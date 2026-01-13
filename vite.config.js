import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import process from "node:process";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env vars (no prefix filtering) so we can configure the dev proxy.
  const env = loadEnv(mode, process.cwd(), "");
  const cloudflarePublicApi =
    env.CLOUDFLARE_PUBLIC_API || env.VITE_CLOUDFLARE_PUBLIC_API;
  const resendApiKey = env.RESEND_API_KEY;

  const devEmailPlugin =
    mode === "development"
      ? {
          name: "dev-email-endpoint",
          configureServer(devServer) {
            devServer.middlewares.use("/api/send-email", async (req, res) => {
              try {
                if (req.method !== "POST") {
                  res.statusCode = 405;
                  res.setHeader("Content-Type", "application/json");
                  res.end(
                    JSON.stringify({ ok: false, error: "Method not allowed" })
                  );
                  return;
                }

                if (!resendApiKey) {
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  res.end(
                    JSON.stringify({
                      ok: false,
                      error: "Missing RESEND_API_KEY on the dev server.",
                    })
                  );
                  return;
                }

                let body = "";
                req.on("data", (chunk) => (body += chunk));
                await new Promise((resolve) => req.on("end", resolve));

                const parsed = body ? JSON.parse(body) : {};
                const fromEmail = String(parsed.fromEmail || "").trim();
                const subject = String(parsed.subject || "").trim();
                const message = String(parsed.message || "").trim();

                if (!subject || !message) {
                  res.statusCode = 400;
                  res.setHeader("Content-Type", "application/json");
                  res.end(
                    JSON.stringify({
                      ok: false,
                      error: "Missing required fields: subject, message",
                    })
                  );
                  return;
                }

                // Resend requires a verified sender domain. We'll use onboarding@resend.dev for now.
                const payload = {
                  from: "onboarding@resend.dev",
                  to: "smammadov494@gmail.com",
                  subject,
                  html: `<p><strong>From:</strong> ${
                    fromEmail || "(not provided)"
                  }</p><p>${message
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/\n/g, "<br/>")}</p>`,
                };

                const r = await fetch("https://api.resend.com/emails", {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${resendApiKey}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(payload),
                });

                const text = await r.text();
                res.statusCode = r.status;
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    ok: r.ok,
                    status: r.status,
                    body: text,
                  })
                );
              } catch (e) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    ok: false,
                    error: e instanceof Error ? e.message : "Unknown error",
                  })
                );
              }
            });
          },
        }
      : null;

  const server = {};
  if (cloudflarePublicApi && /^https?:\/\//i.test(cloudflarePublicApi)) {
    server.proxy = {
      "/__cf_r2__": {
        target: cloudflarePublicApi,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/__cf_r2__/, ""),
      },
    };
  }

  return {
    plugins: [react(), ...(devEmailPlugin ? [devEmailPlugin] : [])],
    // Vite only exposes env vars with the configured prefix to the client (default: VITE_).
    // Since this is a public URL, it's safe to also expose CLOUDFLARE_* variables.
    envPrefix: ["VITE_", "CLOUDFLARE_"],

    server: Object.keys(server).length ? server : undefined,
  };
});
