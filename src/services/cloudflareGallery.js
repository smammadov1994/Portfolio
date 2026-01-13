const IMAGE_EXT_RE = /\.(avif|webp|png|jpe?g|gif|svg)$/i;

function normalizeBase(url) {
  if (!url) return '';
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function dirname(path) {
  if (!path) return '/';
  const i = path.lastIndexOf('/');
  if (i <= 0) return '/';
  return path.slice(0, i);
}

function objectBaseFromManifestUrl({ baseUrl, manifestUrl }) {
  // If manifest is in a subfolder (e.g. /images/images.json), assume objects are in that same folder.
  // This matches common "static hosting" layouts and prevents needing to prefix keys manually.
  const base = normalizeBase(baseUrl);
  if (!base) return base;

  let path = '';

  if (typeof manifestUrl === 'string') {
    if (manifestUrl.startsWith('/__cf_r2__')) {
      // dev proxy URL - strip proxy prefix to get the real path
      path = manifestUrl.replace(/^\/__cf_r2__/, '') || '/';
    } else if (manifestUrl.startsWith(base)) {
      path = manifestUrl.slice(base.length) || '/';
    } else if (manifestUrl.startsWith('/')) {
      path = manifestUrl;
    }
  }

  const dir = dirname(path);
  if (!dir || dir === '/') return base;
  return `${base}${dir}`;
}

function toUrlMaybeKey(value, baseUrl) {
  if (!value) return null;
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  // Already a full URL
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const base = normalizeBase(baseUrl);
  if (!base) return null;

  // Treat as key/path relative to base
  if (trimmed.startsWith('/')) return `${base}${trimmed}`;
  return `${base}/${trimmed}`;
}

function extractCandidates(json) {
  // Support common shapes:
  // - ["a.jpg", "b.png"] or ["https://..."]
  // - { files: [...] }
  // - { images: [...] }
  // - { keys: [...] }
  // - { objects: [{ key, url }, ...] }
  // - { result: { objects: [...] } } (Cloudflare-ish)
  if (Array.isArray(json)) return json;

  if (json && typeof json === 'object') {
    if (Array.isArray(json.files)) return json.files;
    if (Array.isArray(json.images)) return json.images;
    if (Array.isArray(json.keys)) return json.keys;
    if (Array.isArray(json.objects)) return json.objects;

    // nested common wrappers
    if (json.result) return extractCandidates(json.result);
    if (json.data) return extractCandidates(json.data);
  }

  return [];
}

function coerceToUrls(candidates, baseUrl) {
  const urls = [];

  for (const c of candidates) {
    if (typeof c === 'string') {
      const u = toUrlMaybeKey(c, baseUrl);
      if (u && IMAGE_EXT_RE.test(u.split('?')[0])) urls.push(u);
      continue;
    }

    if (c && typeof c === 'object') {
      // Prefer explicit url; otherwise use key/name/path relative to base
      const rawUrl = c.url || c.publicUrl || c.href;
      const rawKey = c.key || c.name || c.path;

      const u = toUrlMaybeKey(rawUrl || rawKey, baseUrl);
      if (u && IMAGE_EXT_RE.test(u.split('?')[0])) urls.push(u);
    }
  }

  // de-dupe while preserving order
  return Array.from(new Set(urls));
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok) {
    // Read a small snippet to make debugging easier (many 404s return HTML).
    let snippet = '';
    try {
      snippet = (await res.text()).slice(0, 200);
    } catch {
      // ignore
    }
    const extra = snippet ? ` (content-type: ${contentType}, body: ${JSON.stringify(snippet)}…)` : ` (content-type: ${contentType})`;
    throw new Error(`HTTP ${res.status} for ${url}${extra}`);
  }

  if (!contentType.includes('application/json')) {
    const body = (await res.text()).slice(0, 200);
    throw new Error(`Expected JSON from ${url} but got ${contentType || 'unknown'} (${JSON.stringify(body)}…)`);
  }

  return await res.json();
}

/**
 * Fetches a list of public image URLs from Cloudflare.
 *
 * IMPORTANT:
 * - In the browser you generally cannot list an R2 bucket from its public URL directly.
 * - This expects `VITE_CLOUDFLARE_PUBLIC_API` to be either:
 *   - a Worker/API endpoint that returns a JSON listing of objects, OR
 *   - a public base URL where one of the following exists: manifest.json / index.json / images.json
 */
export async function fetchCloudflareGalleryImages() {
  const publicApi =
    import.meta.env.VITE_CLOUDFLARE_PUBLIC_API ||
    import.meta.env.CLOUDFLARE_PUBLIC_API;
  const baseUrl = normalizeBase(publicApi);

  if (!baseUrl) {
    throw new Error('Missing CLOUDFLARE_PUBLIC_API (or VITE_CLOUDFLARE_PUBLIC_API) env var');
  }

  // In dev, fetch JSON through Vite's same-origin proxy to avoid CORS issues.
  // Note: the returned image URLs still use the real public baseUrl by default.
  const fetchBaseUrl =
    import.meta.env.DEV && /^https?:\/\//i.test(baseUrl) ? '/__cf_r2__' : baseUrl;

  // If the provided value already looks like a JSON endpoint, try it directly first.
  const directTry = fetchBaseUrl;
  const fallbacks = [
    `${fetchBaseUrl}/manifest.json`,
    `${fetchBaseUrl}/index.json`,
    `${fetchBaseUrl}/images.json`,
    `${fetchBaseUrl}/images/images.json`,
  ];

  // Don't try fetching the bucket "root" unless it's actually a JSON endpoint; r2.dev often serves HTML there.
  const tryUrls = directTry.endsWith('.json') ? [directTry, ...fallbacks] : fallbacks;

  let lastErr = null;

  for (const u of tryUrls) {
    try {
      const json = await fetchJson(u);
      const candidates = extractCandidates(json);
      const objectBase = objectBaseFromManifestUrl({ baseUrl, manifestUrl: u });
      const urls = coerceToUrls(candidates, objectBase);
      if (urls.length > 0) return urls;
    } catch (e) {
      lastErr = e;
    }
  }

  // Common case: user provided a public R2 host URL, but no manifest file exists.
  if (baseUrl.includes('.r2.dev')) {
    throw new Error(
      `No manifest JSON found at ${baseUrl}/(manifest.json|images.json|index.json). ` +
      `Public R2 hosts don’t provide a “list all files” API. ` +
      `Upload an images.json manifest OR point CLOUDFLARE_PUBLIC_API to a Worker endpoint (e.g. /images) that lists the bucket.`
    );
  }

  // If we got a generic fetch failure against an r2.dev origin, it is almost always CORS.
  if (
    lastErr &&
    (lastErr instanceof TypeError || (lastErr && lastErr.name === 'TypeError')) &&
    baseUrl.includes('.r2.dev') &&
    !import.meta.env.DEV
  ) {
    throw new Error(
      'CORS blocked. Your R2 public domain does not allow browser fetch(). Use a Worker/API that returns JSON with Access-Control-Allow-Origin, or host a manifest JSON on the same origin as the site.'
    );
  }

  throw lastErr || new Error('No images found');
}


