import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteConfig.url}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${siteConfig.url}/agendamento`, changeFrequency: "monthly", priority: 0.9 },
  ];
}
