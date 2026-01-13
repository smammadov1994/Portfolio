const IMAGE_EXT_RE = /\.(avif|webp|png|jpe?g|gif|svg)$/i;

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(data, init = {}, request) {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json; charset=utf-8');
  const cors = corsHeaders(request);
  for (const [k, v] of Object.entries(cors)) headers.set(k, v);
  return new Response(JSON.stringify(data), { ...init, headers });
}

function normalizeBase(url) {
  if (!url) return '';
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    const url = new URL(request.url);
    if (url.pathname !== '/images' && url.pathname !== '/images.json') {
      return new Response('Not found', { status: 404 });
    }

    const base = normalizeBase(env.PUBLIC_BASE_URL);
    const limit = Math.min(Number(url.searchParams.get('limit') || 1000), 1000);
    const prefix = url.searchParams.get('prefix') || '';

    let cursor = undefined;
    const keys = [];

    // paginate
    while (true) {
      const listed = await env.GALLERY_BUCKET.list({ prefix, cursor, limit });
      for (const obj of listed.objects) {
        if (IMAGE_EXT_RE.test(obj.key)) keys.push(obj.key);
      }
      if (!listed.truncated) break;
      cursor = listed.cursor;
    }

    const images = base ? keys.map((k) => `${base}/${k}`) : keys;
    return json({ images, count: images.length }, {}, request);
  },
};


