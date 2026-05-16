import { prisma } from "./prisma.js";
import { notFound } from "../errors/http-error.js";
import { getRedis } from "./redis.js";

const CACHE_TTL = 180;

function loreCacheKey(kind: string, locale: string) {
  return `lore:${kind}:${locale}`;
}

export const loreService = {
  async getWorld(locale: string) {
    const redis = getRedis();
    const key = loreCacheKey("world", locale);
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);

    const [factions, regions, timeline] = await Promise.all([
      prisma.loreFaction.findMany({
        where: { locale, published: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          slug: true,
          name: true,
          tagline: true,
          imageUrl: true,
          colorTheme: true,
          motto: true,
        },
      }),
      prisma.loreRegion.findMany({
        where: { locale, published: true },
        select: {
          id: true,
          slug: true,
          name: true,
          mapX: true,
          mapY: true,
          factionId: true,
          imageUrl: true,
        },
      }),
      prisma.loreTimeline.findMany({
        where: { locale, published: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          slug: true,
          title: true,
          era: true,
          yearLabel: true,
          sortOrder: true,
          factionId: true,
        },
      }),
    ]);

    const world = { factions, regions, timeline };
    await redis.setex(key, CACHE_TTL, JSON.stringify(world));
    return world;
  },

  async getFaction(slug: string, locale: string) {
    const faction = await prisma.loreFaction.findFirst({
      where: { slug, locale, published: true },
      include: {
        characters: { where: { published: true }, select: { id: true, slug: true, name: true, title: true, rarity: true, imageUrl: true } },
        regions: { where: { published: true }, select: { id: true, slug: true, name: true, mapX: true, mapY: true } },
        artifacts: { where: { published: true }, select: { id: true, slug: true, name: true, rarity: true, imageUrl: true } },
        timeline: { where: { published: true }, orderBy: { sortOrder: "asc" } },
      },
    });
    if (!faction) throw notFound("Faction not found");
    return faction;
  },

  async getRegion(slug: string, locale: string) {
    const region = await prisma.loreRegion.findFirst({
      where: { slug, locale, published: true },
      include: {
        faction: { select: { slug: true, name: true, colorTheme: true } },
        creatures: { where: { published: true }, select: { id: true, slug: true, name: true, rarity: true } },
      },
    });
    if (!region) throw notFound("Region not found");
    return region;
  },

  async getCharacter(slug: string, locale: string) {
    const row = await prisma.loreCharacter.findFirst({
      where: { slug, locale, published: true },
      include: {
        faction: { select: { slug: true, name: true, colorTheme: true } },
        region: { select: { slug: true, name: true } },
      },
    });
    if (!row) throw notFound("Character not found");
    return row;
  },

  listCharacters(locale: string) {
    return prisma.loreCharacter.findMany({
      where: { locale, published: true },
      orderBy: { name: "asc" },
      select: { id: true, slug: true, name: true, title: true, rarity: true, imageUrl: true, factionId: true },
    });
  },

  listCreatures(locale: string) {
    return prisma.loreCreature.findMany({
      where: { locale, published: true },
      orderBy: { name: "asc" },
      include: { region: { select: { slug: true, name: true } } },
    });
  },

  listArtifacts(locale: string) {
    return prisma.loreArtifact.findMany({
      where: { locale, published: true },
      orderBy: { name: "asc" },
    });
  },

  getTimeline(locale: string) {
    return prisma.loreTimeline.findMany({
      where: { locale, published: true },
      orderBy: { sortOrder: "asc" },
      include: { faction: { select: { slug: true, name: true, colorTheme: true } } },
    });
  },

  async invalidateCache(locale?: string) {
    const redis = getRedis();
    if (locale) {
      await redis.del(loreCacheKey("world", locale));
      return;
    }
    const keys = await redis.keys("lore:*");
    if (keys.length) await redis.del(...keys);
  },

  // Admin
  adminListFactions() {
    return prisma.loreFaction.findMany({ orderBy: [{ locale: "asc" }, { sortOrder: "asc" }] });
  },
  adminUpsertFaction(data: {
    id?: string;
    slug: string;
    locale: string;
    name: string;
    tagline?: string;
    body: string;
    imageUrl?: string;
    colorTheme?: string;
    motto?: string;
    published: boolean;
    sortOrder?: number;
  }) {
    const { id, ...rest } = data;
    if (id) return prisma.loreFaction.update({ where: { id }, data: rest });
    return prisma.loreFaction.create({ data: rest });
  },
  adminListCharacters() {
    return prisma.loreCharacter.findMany({ orderBy: { updatedAt: "desc" } });
  },
  adminUpsertCharacter(data: {
    id?: string;
    slug: string;
    locale: string;
    name: string;
    title?: string;
    body: string;
    imageUrl?: string;
    rarity?: string;
    factionId?: string;
    regionId?: string;
    published: boolean;
    metadata?: object;
  }) {
    const { id, metadata, ...rest } = data;
    const payload = { ...rest, metadata: metadata ?? undefined };
    if (id) return prisma.loreCharacter.update({ where: { id }, data: payload });
    return prisma.loreCharacter.create({ data: payload });
  },
  adminListTimeline() {
    return prisma.loreTimeline.findMany({ orderBy: [{ locale: "asc" }, { sortOrder: "asc" }] });
  },
  adminUpsertTimeline(data: {
    id?: string;
    slug: string;
    locale: string;
    title: string;
    body: string;
    era?: string;
    yearLabel?: string;
    sortOrder?: number;
    factionId?: string;
    published: boolean;
  }) {
    const { id, ...rest } = data;
    if (id) return prisma.loreTimeline.update({ where: { id }, data: rest });
    return prisma.loreTimeline.create({ data: rest });
  },
  adminDelete(kind: "faction" | "character" | "timeline", id: string) {
    if (kind === "faction") return prisma.loreFaction.delete({ where: { id } });
    if (kind === "character") return prisma.loreCharacter.delete({ where: { id } });
    return prisma.loreTimeline.delete({ where: { id } });
  },
};
