import type { MetadataRoute } from "next"
import { siteUrl } from "@/lib/siteUrl"

// The pages visitors can see without logging in.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl.origin, changeFrequency: "monthly", priority: 1 },
    {
      url: new URL("/vragen", siteUrl).href,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ]
}
