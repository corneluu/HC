import type { NextConfig } from "next";

// "/" means served from the domain root (custom domain).
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "/corul-harmonia-christi").replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: basePath || undefined,
  images: { unoptimized: true },
  turbopack: { rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } } },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_BUILD_DATE: new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Bucharest" }).format(new Date()),
  },
};

export default nextConfig;
