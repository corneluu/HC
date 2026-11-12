/**
 * Content-Security-Policy for a static site. GitHub Pages cannot send headers, so it goes in a <meta> tag.
 * shortcut: scripts need 'unsafe-inline' because a static export inlines Next's page data and nonces need a
 * server; move to per-request nonces if the site ever runs behind a proxy (Cloudflare, Vercel).
 * A <meta> CSP cannot set frame-ancestors; that needs a real header from a proxy.
 */
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");

export const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${supabase ? ` ${supabase}` : ""}`,
  "font-src 'self'",
  `connect-src 'self' https://formspree.io${supabase ? ` ${supabase} ${supabase.replace(/^https/, "wss")}` : ""}`,
  "frame-src https://www.youtube-nocookie.com https://open.spotify.com",
  "media-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://formspree.io",
  "upgrade-insecure-requests",
].join("; ");

/** Dev mode needs eval and hot reload, so the policy is only sent in production builds. */
export const cspMeta = process.env.NODE_ENV === "production" ? CSP : null;
