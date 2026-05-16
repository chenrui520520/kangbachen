import { prisma } from "./prisma.js";
import { notFound } from "../errors/http-error.js";
import { getRedis } from "./redis.js";

const DOC_CATEGORIES = ["litepaper", "docs", "tokenomics", "roadmap", "faq"] as const;
export type DocCategory = (typeof DOC_CATEGORIES)[number];

const CACHE_TTL = 300;

function docCacheKey(category: string, locale: string) {
  return `doc:${category}:${locale}`;
}

export const docService = {
  isValidCategory(category: string): category is DocCategory {
    return (DOC_CATEGORIES as readonly string[]).includes(category);
  },

  async listCategory(category: DocCategory, locale: string) {
    const redis = getRedis();
    const key = docCacheKey(category, locale);
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);

    const rows = await prisma.docArticle.findMany({
      where: { category, locale, published: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        seoDescription: true,
        sortOrder: true,
        version: true,
        updatedAt: true,
      },
    });
    await redis.setex(key, CACHE_TTL, JSON.stringify(rows));
    return rows;
  },

  async getArticle(category: DocCategory, slug: string, locale: string) {
    const article = await prisma.docArticle.findFirst({
      where: { category, slug, locale, published: true },
    });
    if (!article) throw notFound("Article not found");
    return article;
  },

  async search(locale: string, q: string) {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const rows = await prisma.docArticle.findMany({
      where: { locale, published: true },
      select: { slug: true, category: true, title: true, body: true, seoDescription: true },
      take: 40,
    });
    return rows
      .filter(
        (r) =>
          r.title.toLowerCase().includes(term) ||
          r.body.toLowerCase().includes(term) ||
          (r.seoDescription?.toLowerCase().includes(term) ?? false),
      )
      .slice(0, 15)
      .map((r) => ({
        slug: r.slug,
        category: r.category,
        title: r.title,
        excerpt: (r.seoDescription ?? r.body).slice(0, 160),
      }));
  },

  async invalidateCache(category?: string, locale?: string) {
    const redis = getRedis();
    if (category && locale) {
      await redis.del(docCacheKey(category, locale));
      return;
    }
    const keys = await redis.keys("doc:*");
    if (keys.length) await redis.del(...keys);
  },

  adminList() {
    return prisma.docArticle.findMany({
      orderBy: [{ category: "asc" }, { locale: "asc" }, { sortOrder: "asc" }],
    });
  },

  async adminUpsert(data: {
    id?: string;
    slug: string;
    category: string;
    locale: string;
    title: string;
    body: string;
    version?: number;
    seoTitle?: string;
    seoDescription?: string;
    published: boolean;
    sortOrder?: number;
  }) {
    const { id, ...rest } = data;
    if (id) {
      const existing = await prisma.docArticle.findUnique({ where: { id } });
      return prisma.docArticle.update({
        where: { id },
        data: { ...rest, version: (existing?.version ?? 0) + 1 },
      });
    }
    return prisma.docArticle.create({ data: rest });
  },

  adminDelete(id: string) {
    return prisma.docArticle.delete({ where: { id } });
  },
};
