import { PrismaClient } from "@prisma/client";
import { seedUndeadLore } from "./seed-undead-lore.js";
import { seedPhase7Events } from "./seed-phase7-events.js";

const prisma = new PrismaClient();

async function main() {
  const nfts = await Promise.all([
    prisma.nFTReward.upsert({
      where: { id: "nft-starter-chest" },
      update: {
        name: "Soul Fragment Vessel",
        description: "A taxed memory decanted by the Necropolis. Common mock collectible.",
        metadata: { series: 2, loreKey: "soul-fragment-vessel" },
      },
      create: {
        id: "nft-starter-chest",
        name: "Soul Fragment Vessel",
        description: "A taxed memory decanted by the Necropolis. Common mock collectible.",
        rarity: "common",
        imageUrl: "/nft/placeholder-common.png",
        metadata: { series: 2, loreKey: "soul-fragment-vessel" },
      },
    }),
    prisma.nFTReward.upsert({
      where: { id: "nft-rare-blade" },
      update: {
        name: "Cursed Relic Blade",
        description: "Smuggled from Blackveil fog. Rare mock NFT for oath-breakers.",
        metadata: { series: 2, loreKey: "cursed-relic-blade" },
      },
      create: {
        id: "nft-rare-blade",
        name: "Cursed Relic Blade",
        description: "Smuggled from Blackveil fog. Rare mock NFT for oath-breakers.",
        rarity: "rare",
        imageUrl: "/nft/placeholder-rare.png",
        metadata: { series: 2, loreKey: "cursed-relic-blade" },
      },
    }),
    prisma.nFTReward.upsert({
      where: { id: "nft-epic-crown" },
      update: {
        name: "Necrotic Sigil",
        description: "Burns on chain-less ledgers. Epic reward for Cathedral oath-keepers.",
        metadata: { series: 2, loreKey: "necrotic-sigil" },
      },
      create: {
        id: "nft-epic-crown",
        name: "Necrotic Sigil",
        description: "Burns on chain-less ledgers. Epic reward for Cathedral oath-keepers.",
        rarity: "epic",
        imageUrl: "/nft/placeholder-epic.png",
        metadata: { series: 2, loreKey: "necrotic-sigil" },
      },
    }),
    prisma.nFTReward.upsert({
      where: { id: "nft-legendary-dragon" },
      update: {
        name: "Abyssal Echo",
        description: "A sound that should not exist. Legendary sigil of the Final Silence prophecy.",
        metadata: { series: 2, loreKey: "abyssal-echo" },
      },
      create: {
        id: "nft-legendary-dragon",
        name: "Abyssal Echo",
        description: "A sound that should not exist. Legendary sigil of the Final Silence prophecy.",
        rarity: "legendary",
        imageUrl: "/nft/placeholder-legendary.png",
        metadata: { series: 2, loreKey: "abyssal-echo" },
      },
    }),
  ]);

  for (let day = 1; day <= 30; day++) {
    const rewardPoints = 50 + day * 15;
    const nftRewardId =
      day === 7
        ? nfts[0].id
        : day === 14
          ? nfts[1].id
          : day === 21
            ? nfts[2].id
            : day === 30
              ? nfts[3].id
              : null;

    await prisma.signInRewardConfig.upsert({
      where: { day },
      update: { rewardPoints, nftRewardId },
      create: { day, rewardPoints, nftRewardId },
    });
  }

  const tasks = [
    {
      id: "task-daily-login",
      name: "Soul Tithe",
      description: "Pay the daily soul tithe — open KangBa once per cycle.",
      type: "daily",
      category: "DAILY",
      rewardPoints: 30,
      repeatable: true,
      cooldownHours: 20,
      targetProgress: 1,
    },
    {
      id: "task-share-x",
      name: "Spread the Prophecy",
      description: "Share KangBa's curse on X (honor system).",
      type: "social",
      category: "SOCIAL",
      rewardPoints: 80,
      repeatable: true,
      cooldownHours: 24,
      targetProgress: 1,
    },
    {
      id: "task-watch-trailer",
      name: "Witness the Rite",
      description: "Witness the cinematic rite on the home page.",
      type: "daily",
      category: "DAILY",
      rewardPoints: 40,
      repeatable: true,
      cooldownHours: 24,
      targetProgress: 1,
    },
    {
      id: "task-streak-7",
      name: "Seven Oaths of Ash",
      description: "Maintain a 7-day sign-in streak beneath the Hollow King.",
      type: "achievement",
      category: "ACHIEVEMENT",
      rewardPoints: 200,
      rewardNftId: nfts[0].id,
      repeatable: false,
      targetProgress: 7,
    },
    {
      id: "task-event-participant",
      name: "Fogbound Participant",
      description: "Join an active Blackveil or Hollow King campaign.",
      type: "event",
      category: "EVENT",
      rewardPoints: 120,
      repeatable: true,
      cooldownHours: 48,
      targetProgress: 1,
    },
  ];

  for (const t of tasks) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: t,
      create: t,
    });
  }

  const shopItems = [
    {
      id: "shop-points-pack",
      name: "Soul Fragment Satchel",
      description: "Bundled taxed memories (virtual points).",
      type: "points",
      costPoints: 500,
      stock: 999,
    },
    {
      id: "shop-nft-chest",
      name: "Cursed Reliquary",
      description: "Redeem for a Cursed Relic Blade mock NFT.",
      type: "nft",
      costPoints: 1200,
      rewardNftId: nfts[1].id,
      stock: 100,
    },
    {
      id: "shop-legendary-sigil",
      name: "Abyssal Echo Crate",
      description: "Limited Abyssal Echo mock NFT — Final Silence prophecy.",
      type: "nft",
      costPoints: 5000,
      rewardNftId: nfts[3].id,
      stock: 10,
    },
  ];

  for (const item of shopItems) {
    await prisma.shopItem.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }

  const { adminAuthService } = await import("../src/services/admin-auth.service.js");
  const admins = await adminAuthService.seedDemoAdmins();
  console.log("Admin accounts:", admins.map((a) => `${a.email} (${a.role})`).join(", "));

  await prisma.cmsAnnouncement.upsert({
    where: { id: "ann-welcome-en" },
    update: {
      message: "The Hollow King stirs — soul fragment rewards await sworn players.",
      linkUrl: "/campaigns/hollow-king-awakening",
    },
    create: {
      id: "ann-welcome-en",
      locale: "en",
      message: "The Hollow King stirs — soul fragment rewards await sworn players.",
      linkUrl: "/campaigns/hollow-king-awakening",
      active: true,
    },
  });

  await prisma.cmsFaq.upsert({
    where: { id: "faq-onchain-en" },
    update: {},
    create: {
      id: "faq-onchain-en",
      locale: "en",
      question: "What are soul fragments?",
      answer: "Points and mock NFTs represent taxed memories in KangBa's undead economy — virtual, exportable, not on-chain yet.",
      sortOrder: 1,
      published: true,
    },
  });

  await prisma.cmsBanner.upsert({
    where: { id: "banner-hero-en" },
    update: {},
    create: {
      id: "banner-hero-en",
      locale: "en",
      title: "Blood Moon Siege",
      subtitle: "2× task points this week",
      linkUrl: "/events",
      sortOrder: 0,
      active: true,
    },
  });

  const roles = [
    { key: "wanderer", name: "Deathsworn", description: "A soul taxed but still walking.", minReputation: 0 },
    { key: "vanguard", name: "Soulbinder", description: "Binds fragments for the Dominion.", minReputation: 100 },
    { key: "archon", name: "Grave Sovereign", description: "Commands relic markets.", minReputation: 500 },
  ];
  for (const r of roles) {
    await prisma.communityRole.upsert({
      where: { key: r.key },
      update: r,
      create: r,
    });
  }

  await prisma.alphaPass.upsert({
    where: { key: "genesis" },
    update: { name: "Cathedral Alpha", description: "Witnessed the Hollow King's first hymn" },
    create: { key: "genesis", name: "Cathedral Alpha", description: "Witnessed the Hollow King's first hymn" },
  });

  const tiers = [
    { key: "initiate", name: "Grave Initiate", minReferrals: 0, sortOrder: 0 },
    { key: "scout", name: "Fog Scout", minReferrals: 3, sortOrder: 1 },
    { key: "warlord", name: "Relic Warlord", minReferrals: 10, sortOrder: 2 },
    { key: "sovereign", name: "Silence Sovereign", minReferrals: 25, sortOrder: 3 },
  ];
  for (const t of tiers) {
    await prisma.inviteTier.upsert({ where: { key: t.key }, update: t, create: t });
  }

  const badges = [
    { key: "og", name: "Oathbreaker OG", description: "Witnessed the First Oath break", rarity: "legendary", frameStyle: "ember" },
    { key: "recruiter", name: "Soul Witness", description: "Bound your first witness soul", rarity: "rare", frameStyle: "violet" },
    { key: "alpha-tester", name: "Hollow Alpha", description: "Five souls sworn to your banner", rarity: "epic", frameStyle: "crimson" },
    { key: "warlord-inviter", name: "Grave Herald", description: "Ten souls bound in silence", rarity: "legendary", frameStyle: "gold" },
  ];
  for (const b of badges) {
    await prisma.badge.upsert({ where: { key: b.key }, update: b, create: b });
  }

  await seedUndeadLore(prisma);
  await seedPhase7Events(prisma);

  console.log("Seed complete: undead lore, engagement, CMS, campaigns, phase7 events");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
