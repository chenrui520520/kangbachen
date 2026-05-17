import type { PrismaClient } from "@prisma/client";

const LOCALES = ["en", "zh", "ko", "ja", "ar"] as const;

type Locale = (typeof LOCALES)[number];

const EVENT_COPY: Record<
  Locale,
  {
    hollow: { name: string; description: string };
    blackveil: { name: string; description: string };
    tasks: {
      hollow: Array<{ title: string; description: string; taskKey: string }>;
      blackveil: Array<{ title: string; description: string; taskKey: string }>;
    };
  }
> = {
  en: {
    hollow: {
      name: "Hollow King Awakening",
      description: "Live fog chronicle — complete rites before the Cathedral falls silent.",
    },
    blackveil: {
      name: "Echoes Beneath Blackveil",
      description: "2× soul tithe on tasks while the marshes whisper.",
    },
    tasks: {
      hollow: [
        { title: "Witness the first hymn", description: "Open the event chronicle.", taskKey: "witness-hymn" },
        { title: "Pay the soul tithe", description: "Complete any daily sign-in during the awakening.", taskKey: "pay-tithe" },
        { title: "Bind a witness soul", description: "Invite one ally to KENBA.", taskKey: "bind-witness" },
        { title: "Claim a cursed relic", description: "Earn any mock NFT reward.", taskKey: "claim-relic" },
      ],
      blackveil: [
        { title: "Enter the fog", description: "View this chronicle.", taskKey: "enter-fog" },
        { title: "Complete three tasks", description: "Finish any three quests under the multiplier.", taskKey: "three-tasks" },
        { title: "Spend soul fragments", description: "Purchase from the event shop.", taskKey: "event-shop" },
      ],
    },
  },
  zh: {
    hollow: {
      name: "空壳王觉醒",
      description: "活体迷雾纪事 — 在大教堂归于寂静前完成仪式。",
    },
    blackveil: {
      name: "黑纱之下的回响",
      description: "沼泽低语期间任务魂税双倍。",
    },
    tasks: {
      hollow: [
        { title: "见证首曲圣歌", description: "打开活动纪事。", taskKey: "witness-hymn" },
        { title: "缴纳魂税", description: "觉醒期间完成一次签到。", taskKey: "pay-tithe" },
        { title: "束缚见证之魂", description: "邀请一位盟友。", taskKey: "bind-witness" },
        { title: "夺取诅咒遗物", description: "获得任意虚拟藏品。", taskKey: "claim-relic" },
      ],
      blackveil: [
        { title: "步入迷雾", description: "查看本纪事。", taskKey: "enter-fog" },
        { title: "完成三项任务", description: "在倍率下完成任意三个任务。", taskKey: "three-tasks" },
        { title: "消耗灵魂碎片", description: "在活动商店购买。", taskKey: "event-shop" },
      ],
    },
  },
  ko: {
    hollow: {
      name: "공허 왕의 각성",
      description: "안개 연대기 — 성당이 침묵하기 전 의식을 완료하라.",
    },
    blackveil: {
      name: "블랙베일 아래의 메아리",
      description: "늪이 속삭이는 동안 2× 영혼세.",
    },
    tasks: {
      hollow: [
        { title: "첫 성가 목격", description: "이벤트 연대기를 연다.", taskKey: "witness-hymn" },
        { title: "영혼세 지불", description: "각성 기간 일일 출석.", taskKey: "pay-tithe" },
        { title: "증인의 영혼 결속", description: "동맹 1명 초대.", taskKey: "bind-witness" },
        { title: "저주 유물 획득", description: "모의 NFT 보상 획득.", taskKey: "claim-relic" },
      ],
      blackveil: [
        { title: "안개 입장", description: "연대기 확인.", taskKey: "enter-fog" },
        { title: "퀘스트 3개 완료", description: "배율 적용 중 3개 완료.", taskKey: "three-tasks" },
        { title: "영혼 파편 사용", description: "이벤트 상점 구매.", taskKey: "event-shop" },
      ],
    },
  },
  ja: {
    hollow: {
      name: "ホロウキング覚醒",
      description: "霧の年代記 — 聖堂が沈黙する前に儀式を終えよ。",
    },
    blackveil: {
      name: "ブラックベイルの下の響き",
      description: "沼の囁きの間、タスク魂税2倍。",
    },
    tasks: {
      hollow: [
        { title: "最初の聖歌を目撃", description: "イベント年代記を開く。", taskKey: "witness-hymn" },
        { title: "魂税を払う", description: "覚醒期間にサインイン。", taskKey: "pay-tithe" },
        { title: "証人の魂を結ぶ", description: "同盟を1人招待。", taskKey: "bind-witness" },
        { title: "呪われし遺物を得る", description: "モックNFTを獲得。", taskKey: "claim-relic" },
      ],
      blackveil: [
        { title: "霧に入る", description: "年代記を見る。", taskKey: "enter-fog" },
        { title: "クエスト3つ完了", description: "倍率中に3つ完了。", taskKey: "three-tasks" },
        { title: "ソウル・フラグメントを使う", description: "イベントショップで購入。", taskKey: "event-shop" },
      ],
    },
  },
  ar: {
    hollow: {
      name: "يقظة الملك الأجوف",
      description: "سجل الضباب — أكمل الطقوس قبل صمت الكاتدرائية.",
    },
    blackveil: {
      name: "أصداء تحت الحجاب الأسود",
      description: "2× ضريبة الأرواح أثناء همس المستنقعات.",
    },
    tasks: {
      hollow: [
        { title: "اشهد الترنيمة الأولى", description: "افتح السجل.", taskKey: "witness-hymn" },
        { title: "ادفع ضريبة الأرواح", description: "سجّل دخولاً يومياً.", taskKey: "pay-tithe" },
        { title: "اربط شاهداً", description: "ادعُ حليفاً واحداً.", taskKey: "bind-witness" },
        { title: "احصل على أثر ملعون", description: "اكسب NFT وهمياً.", taskKey: "claim-relic" },
      ],
      blackveil: [
        { title: "ادخل الضباب", description: "اعرض السجل.", taskKey: "enter-fog" },
        { title: "أكمل ثلاث مهام", description: "تحت المضاعف.", taskKey: "three-tasks" },
        { title: "أنفق شظايا الأرواح", description: "اشترِ من متجر الحدث.", taskKey: "event-shop" },
      ],
    },
  },
};

export async function seedPhase7Events(prisma: PrismaClient) {
  const now = new Date();
  const week = 7 * 24 * 60 * 60 * 1000;
  const month = 30 * 24 * 60 * 60 * 1000;

  for (const locale of LOCALES) {
    const copy = EVENT_COPY[locale];

    const hollow = await prisma.event.upsert({
      where: { slug_locale: { slug: "hollow-king-awakening", locale } },
      update: {
        name: copy.hollow.name,
        description: copy.hollow.description,
        featured: true,
        active: true,
        bannerUrl: "/events/hollow-king-banner.png",
      },
      create: {
        id: `event-hollow-${locale}`,
        slug: "hollow-king-awakening",
        locale,
        name: copy.hollow.name,
        description: copy.hollow.description,
        startsAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        endsAt: new Date(now.getTime() + month),
        multiplier: 1.5,
        featured: true,
        bannerUrl: "/events/hollow-king-banner.png",
        active: true,
      },
    });

    const blackveil = await prisma.event.upsert({
      where: { slug_locale: { slug: "echoes-beneath-blackveil", locale } },
      update: {
        name: copy.blackveil.name,
        description: copy.blackveil.description,
        featured: locale === "en",
        active: true,
        multiplier: 2,
        bannerUrl: "/events/blackveil-banner.png",
      },
      create: {
        id: `event-blackveil-${locale}`,
        slug: "echoes-beneath-blackveil",
        locale,
        name: copy.blackveil.name,
        description: copy.blackveil.description,
        startsAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        endsAt: new Date(now.getTime() + week),
        multiplier: 2,
        featured: locale === "en",
        bannerUrl: "/events/blackveil-banner.png",
        active: true,
      },
    });

    let step = 1;
    for (const t of copy.tasks.hollow) {
      const id = `evt-task-hollow-${t.taskKey}-${locale}`;
      await prisma.eventTask.upsert({
        where: { id },
        update: { title: t.title, description: t.description, stepOrder: step },
        create: {
          id,
          eventId: hollow.id,
          stepOrder: step,
          title: t.title,
          description: t.description,
          taskKey: t.taskKey,
          targetProgress: 1,
          rewardPoints: step === 1 ? 50 : step === 4 ? 200 : 100,
          rewardNftId: step === 4 ? "nft-rare-blade" : null,
        },
      });
      step += 1;
    }

    step = 1;
    for (const t of copy.tasks.blackveil) {
      const id = `evt-task-bv-${t.taskKey}-${locale}`;
      await prisma.eventTask.upsert({
        where: { id },
        update: { title: t.title, description: t.description, stepOrder: step },
        create: {
          id,
          eventId: blackveil.id,
          stepOrder: step,
          title: t.title,
          description: t.description,
          taskKey: t.taskKey,
          targetProgress: t.taskKey === "three-tasks" ? 3 : 1,
          rewardPoints: 75 * step,
        },
      });
      step += 1;
    }

    await prisma.eventReward.upsert({
      where: { id: `evt-reward-hollow-m3-${locale}` },
      update: {},
      create: {
        id: `evt-reward-hollow-m3-${locale}`,
        eventId: hollow.id,
        milestone: 3,
        rewardPoints: 300,
        nftRewardId: "nft-epic-crown",
      },
    });

    await prisma.eventReward.upsert({
      where: { id: `evt-reward-bv-m2-${locale}` },
      update: {},
      create: {
        id: `evt-reward-bv-m2-${locale}`,
        eventId: blackveil.id,
        milestone: 2,
        rewardPoints: 150,
      },
    });
  }

  await prisma.shopItem.updateMany({
    where: { id: "shop-nft-chest" },
    data: { eventSlug: "hollow-king-awakening" },
  });

  console.log("Phase 7 events seeded (5 locales, tasks, milestones, shop link)");
}
