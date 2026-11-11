import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_BASE_PATH;
  return {
    rules: { userAgent: "*", allow: "/", disallow: `${base}/admin/` },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
