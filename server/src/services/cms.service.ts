import { prisma } from "./prisma.js";
import { getRedis } from "./redis.js";
import { notFound } from "../errors/http-error.js";

const CACHE_TTL = 120;

function cacheKey(kind: string, locale: string) {
  return `cms:${kind}:${locale}`;
}

export const cmsService = {
  async getPublicBundle(locale: string) {
    const redis = getRedis();
    const key = cacheKey("bundle", locale);
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);

    const now = new Date();
    const [allAnnouncements, banners, faqs] = await Promise.all([
      prisma.cmsAnnouncement.findMany({
        where: { locale, active: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.cmsBanner.findMany({
        where: { locale, active: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.cmsFaq.findMany({
        where: { locale, published: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    const announcements = allAnnouncements
      .filter((a) => (!a.startsAt || a.startsAt <= now) && (!a.endsAt || a.endsAt >= now))
      .slice(0, 3);

    const bundle = { announcements, banners, faqs };
    await redis.setex(key, CACHE_TTL, JSON.stringify(bundle));
    return bundle;
  },

  async getPage(slug: string, locale: string) {
    const page = await prisma.cmsPage.findFirst({
      where: { slug, locale, published: true },
    });
    if (!page) throw notFound("Page not found");
    return page;
  },

  async getPost(slug: string, locale: string) {
    const post = await prisma.cmsPost.findFirst({
      where: { slug, locale, published: true },
    });
    if (!post) throw notFound("Post not found");
    return post;
  },

  async invalidateCache(locale?: string) {
    const redis = getRedis();
    if (locale) {
      await redis.del(cacheKey("bundle", locale));
      return;
    }
    const keys = await redis.keys("cms:*");
    if (keys.length) await redis.del(...keys);
  },

  // Admin CRUD helpers
  listPages() {
    return prisma.cmsPage.findMany({ orderBy: [{ locale: "asc" }, { slug: "asc" }] });
  },
  listPosts() {
    return prisma.cmsPost.findMany({ orderBy: { updatedAt: "desc" } });
  },
  listBanners() {
    return prisma.cmsBanner.findMany({ orderBy: [{ locale: "asc" }, { sortOrder: "asc" }] });
  },
  listFaqs() {
    return prisma.cmsFaq.findMany({ orderBy: [{ locale: "asc" }, { sortOrder: "asc" }] });
  },
  listAnnouncements() {
    return prisma.cmsAnnouncement.findMany({ orderBy: { createdAt: "desc" } });
  },

  upsertPage(data: {
    id?: string;
    slug: string;
    locale: string;
    title: string;
    body: string;
    seoTitle?: string;
    seoDescription?: string;
    published: boolean;
  }) {
    const publishedAt = data.published ? new Date() : null;
    if (data.id) {
      return prisma.cmsPage.update({
        where: { id: data.id },
        data: { ...data, publishedAt },
      });
    }
    return prisma.cmsPage.create({
      data: { ...data, publishedAt },
    });
  },

  upsertPost(data: {
    id?: string;
    slug: string;
    locale: string;
    title: string;
    excerpt?: string;
    body: string;
    coverImageUrl?: string;
    seoTitle?: string;
    seoDescription?: string;
    published: boolean;
  }) {
    const publishedAt = data.published ? new Date() : null;
    if (data.id) {
      return prisma.cmsPost.update({ where: { id: data.id }, data: { ...data, publishedAt } });
    }
    return prisma.cmsPost.create({ data: { ...data, publishedAt } });
  },

  upsertBanner(data: {
    id?: string;
    locale: string;
    title: string;
    subtitle?: string;
    imageUrl?: string;
    linkUrl?: string;
    sortOrder?: number;
    active: boolean;
  }) {
    if (data.id) return prisma.cmsBanner.update({ where: { id: data.id }, data });
    return prisma.cmsBanner.create({ data });
  },

  upsertFaq(data: {
    id?: string;
    locale: string;
    question: string;
    answer: string;
    sortOrder?: number;
    published: boolean;
  }) {
    if (data.id) return prisma.cmsFaq.update({ where: { id: data.id }, data });
    return prisma.cmsFaq.create({ data });
  },

  upsertAnnouncement(data: {
    id?: string;
    locale: string;
    message: string;
    linkUrl?: string;
    active: boolean;
    startsAt?: Date | null;
    endsAt?: Date | null;
  }) {
    if (data.id) return prisma.cmsAnnouncement.update({ where: { id: data.id }, data });
    return prisma.cmsAnnouncement.create({ data });
  },

  async delete(kind: "page" | "post" | "banner" | "faq" | "announcement", id: string) {
    switch (kind) {
      case "page":
        return prisma.cmsPage.delete({ where: { id } });
      case "post":
        return prisma.cmsPost.delete({ where: { id } });
      case "banner":
        return prisma.cmsBanner.delete({ where: { id } });
      case "faq":
        return prisma.cmsFaq.delete({ where: { id } });
      case "announcement":
        return prisma.cmsAnnouncement.delete({ where: { id } });
    }
  },
};
