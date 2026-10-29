import type { MetadataRoute } from "next"
import { siteUrl } from "@/lib/siteUrl"

// Shared links (/lijstje/…) aren't blocked here: WhatsApp and others read
// robots.txt before showing a preview. They stay out of search results with
// a noindex on the page instead, like every page behind a login.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/profile"],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).href,
  }
}
