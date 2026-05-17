import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://KENBA.local";

const paths = [
  "",
  "/lore",
  "/lore/timeline",
  "/lore/characters",
  "/campaigns",
  "/tokenomics",
  "/roadmap",
  "/faq",
  "/tasks",
  "/rewards",
  "/leaderboard",
  "/events",
  "/shop",
  "/invite",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    for (const path of paths) {
      entries.push({
        url: `${base}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "daily",
        priority: path === "" ? 1 : 0.8,
      });
    }
  }
  return entries;
}
