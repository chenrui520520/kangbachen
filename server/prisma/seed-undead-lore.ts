import type { PrismaClient } from "@prisma/client";

const LOCALES = ["en", "zh", "ko", "ja", "ar"] as const;

type Locale = (typeof LOCALES)[number];

const FACTIONS: Record<
  Locale,
  Array<{
    slug: string;
    name: string;
    tagline: string;
    motto: string;
    body: string;
    colorTheme: string;
    sortOrder: number;
  }>
> = {
  en: [
    {
      slug: "necropolis-dominion",
      name: "Necropolis Dominion",
      tagline: "Empire of the still-breathing dead",
      motto: "No throne survives the grave",
      body: "## Necropolis Dominion\n\nThe last civilization of KENBA did not fall — it **died upright**. Marble citadels house liches who tax soul fragments. Every citizen owes the Dominion a memory.",
      colorTheme: "ash",
      sortOrder: 0,
    },
    {
      slug: "choir-hollow-king",
      name: "Choir of the Hollow King",
      tagline: "Cathedral hymns that unmake the living",
      motto: "Hear the crown that never eats",
      body: "## Choir of the Hollow King\n\nWhen Morvain shed his heart, the Choir was born. They sing **Abyssal Echoes** into bone cathedrals, converting faith into necrotic fuel.",
      colorTheme: "violet",
      sortOrder: 1,
    },
    {
      slug: "blackveil-covenant",
      name: "Blackveil Covenant",
      tagline: "Swamp pact-binders and relic smugglers",
      motto: "Trade blood for cursed silver",
      body: "## Blackveil Covenant\n\nBeneath Blackveil's fog, exiles barter **cursed relics** stripped from forgotten wars. They alone map the paths to the Hollow King's tomb.",
      colorTheme: "crimson",
      sortOrder: 2,
    },
  ],
  zh: [
    {
      slug: "necropolis-dominion",
      name: "死灵都城邦",
      tagline: "伫立而亡的帝国",
      motto: "王座难逃坟墓",
      body: "## 死灵都城邦\n\nKENBA最后的文明并未崩塌——而是**站着死去**。大理石城塞中的巫妖向臣民征收灵魂碎片。",
      colorTheme: "ash",
      sortOrder: 0,
    },
    {
      slug: "choir-hollow-king",
      name: "空壳王庭圣歌团",
      tagline: "瓦解生者的圣歌",
      motto: "聆听永不进食的王冠",
      body: "## 空壳王庭圣歌团\n\n莫尔文舍弃心脏之时，圣歌团诞生。他们在骨教堂中吟唱**深渊回响**。",
      colorTheme: "violet",
      sortOrder: 1,
    },
    {
      slug: "blackveil-covenant",
      name: "黑纱盟约",
      tagline: "沼泽契约者与遗物走私者",
      motto: "以血换咒银",
      body: "## 黑纱盟约\n\n黑纱迷雾之下，流亡者交易从遗忘战争中剥下的**诅咒遗物**。",
      colorTheme: "crimson",
      sortOrder: 2,
    },
  ],
  ko: [
    {
      slug: "necropolis-dominion",
      name: "네크로폴리스 도미니언",
      tagline: "죽어 서 있는 제국",
      motto: "무덤을 피한 왕좌는 없다",
      body: "## 네크로폴리스 도미니언\n\n캉바의 마지막 문명은 무너지지 않고 **서서 죽었다**. 영혼 파편을 거두는 리치들이 대리석 성채를 지배한다.",
      colorTheme: "ash",
      sortOrder: 0,
    },
    {
      slug: "choir-hollow-king",
      name: "공허 왕의 성가대",
      tagline: "살아 있는 자를 해체하는 찬가",
      motto: "먹지 않는 왕관을 들으라",
      body: "## 공허 왕의 성가대\n\n모르베인이 심장을 버렸을 때 성가대가 탄생했다. 뼈 대성당에 **심연의 메아리**를 울린다.",
      colorTheme: "violet",
      sortOrder: 1,
    },
    {
      slug: "blackveil-covenant",
      name: "블랙베일 서약",
      tagline: "늪의 계약자와 유물 밀수꾼",
      motto: "피로 저주받은 은을 사라",
      body: "## 블랙베일 서약\n\n안개 아래 망명자들이 **저주받은 유물**을 거래하며 공허 왕의 무덤 길을 그린다.",
      colorTheme: "crimson",
      sortOrder: 2,
    },
  ],
  ja: [
    {
      slug: "necropolis-dominion",
      name: "ネクロポリス・ドミニオン",
      tagline: "立ったまま死んだ帝国",
      motto: "墓を免れぬ玉座",
      body: "## ネクロポリス・ドミニオン\n\nカンバ最後の文明は崩れず、**立って死んだ**。ソウル・フラグメントを徴収するリッチが大理石の城塞を治める。",
      colorTheme: "ash",
      sortOrder: 0,
    },
    {
      slug: "choir-hollow-king",
      name: "ホロウキングの聖歌隊",
      tagline: "生者を解く聖歌",
      motto: "食べぬ王冠を聞け",
      body: "## ホロウキングの聖歌隊\n\nモーヴァインが心を捨てた時、聖歌隊が生まれた。骨の大聖堂に**深淵のこだま**を響かせる。",
      colorTheme: "violet",
      sortOrder: 1,
    },
    {
      slug: "blackveil-covenant",
      name: "ブラックベイル盟約",
      tagline: "沼の契約者と遺物密輸者",
      motto: "血で呪われし銀を買え",
      body: "## ブラックベイル盟約\n\n霧の下で追放者たちが**呪われし遺物**を売買し、ホロウキングの墓への道を描く。",
      colorTheme: "crimson",
      sortOrder: 2,
    },
  ],
  ar: [
    {
      slug: "necropolis-dominion",
      name: "هيمنة نيكروبوليس",
      tagline: "إمبراطورية الموتى القائمين",
      motto: "لا عرش ينجو من القبر",
      body: "## هيمنة نيكروبوليس\n\nلم تسقط حضارة كانغبا — **ماتت واقفة**. يلتزم كل مواطن بتقديم جزء من ذاكرته كضريبة.",
      colorTheme: "ash",
      sortOrder: 0,
    },
    {
      slug: "choir-hollow-king",
      name: "جوقة الملك الأجوف",
      tagline: "تراتيل تفكك الأحياء",
      motto: "اسمع التاج الذي لا يأكل",
      body: "## جوقة الملك الأجوف\n\nعندما طرح مورفين قلبه، وُلدت الجوقة. يُنشدون **أصداء الهاوية** في كاتدرائيات العظام.",
      colorTheme: "violet",
      sortOrder: 1,
    },
    {
      slug: "blackveil-covenant",
      name: "عهد الحجاب الأسود",
      tagline: "عارضو العقود في المستنقعات",
      motto: "تاجر بالدم مقابل الفضة الملعونة",
      body: "## عهد الحجاب الأسود\n\nتحت ضباب بلاكفيل، يتاجر المنفيون **بالآثار الملعونة** ويرسمون طريق مقبرة الملك الأجوف.",
      colorTheme: "crimson",
      sortOrder: 2,
    },
  ],
};

const REGIONS: Record<
  Locale,
  Array<{ slug: string; name: string; body: string; mapX: number; mapY: number; factionSlug: string }>
> = {
  en: [
    {
      slug: "catacombs-first-oath",
      name: "Catacombs of the First Oath",
      body: "Where the Dominion swore to never die, and broke the oath the same night.",
      mapX: 28,
      mapY: 62,
      factionSlug: "necropolis-dominion",
    },
    {
      slug: "blackveil-marshes",
      name: "Blackveil Marshes",
      body: "Fog so thick it remembers your name. Relic markets burn cold lanterns.",
      mapX: 72,
      mapY: 55,
      factionSlug: "blackveil-covenant",
    },
    {
      slug: "throne-cold-ash",
      name: "Throne of Cold Ash",
      body: "The Hollow King dreams in a crown of silence. War horns echo without armies.",
      mapX: 50,
      mapY: 22,
      factionSlug: "choir-hollow-king",
    },
  ],
  zh: [
    {
      slug: "catacombs-first-oath",
      name: "初誓地下墓穴",
      body: "都城邦立誓永不消亡之夜，誓言同日破碎。",
      mapX: 28,
      mapY: 62,
      factionSlug: "necropolis-dominion",
    },
    {
      slug: "blackveil-marshes",
      name: "黑纱沼泽",
      body: "浓雾记得你的名字。遗物市集点燃幽冷的灯。",
      mapX: 72,
      mapY: 55,
      factionSlug: "blackveil-covenant",
    },
    {
      slug: "throne-cold-ash",
      name: "冷灰王座",
      body: "空壳王在寂静王冠中做梦。无军的战号仍在回响。",
      mapX: 50,
      mapY: 22,
      factionSlug: "choir-hollow-king",
    },
  ],
  ko: [
    {
      slug: "catacombs-first-oath",
      name: "첫 서약의 지하묘지",
      body: "도미니언이 죽지 않겠다 맹세한 밤, 같은 밤 서약이 깨졌다.",
      mapX: 28,
      mapY: 62,
      factionSlug: "necropolis-dominion",
    },
    {
      slug: "blackveil-marshes",
      name: "블랙베일 늪",
      body: "안개가 이름을 기억한다. 유물 시장의 등불은 차갑게 타오른다.",
      mapX: 72,
      mapY: 55,
      factionSlug: "blackveil-covenant",
    },
    {
      slug: "throne-cold-ash",
      name: "차가운 재의 왕좌",
      body: "공허 왕이 침묵의 왕관 속에서 꿈꾼다.",
      mapX: 50,
      mapY: 22,
      factionSlug: "choir-hollow-king",
    },
  ],
  ja: [
    {
      slug: "catacombs-first-oath",
      name: "初誓の地下墓",
      body: "決して死なぬと誓った夜、同じ夜に誓いは破られた。",
      mapX: 28,
      mapY: 62,
      factionSlug: "necropolis-dominion",
    },
    {
      slug: "blackveil-marshes",
      name: "ブラックベイルの沼",
      body: "霧は名前を覚えている。遺物市の灯は冷たく燃える。",
      mapX: 72,
      mapY: 55,
      factionSlug: "blackveil-covenant",
    },
    {
      slug: "throne-cold-ash",
      name: "冷灰の玉座",
      body: "ホロウキングが沈黙の冠の中で夢を見る。",
      mapX: 50,
      mapY: 22,
      factionSlug: "choir-hollow-king",
    },
  ],
  ar: [
    {
      slug: "catacombs-first-oath",
      name: "دفائن القسم الأول",
      body: "حيث أقسموا بعدم الموت، وكسروا القسم في الليلة نفسها.",
      mapX: 28,
      mapY: 62,
      factionSlug: "necropolis-dominion",
    },
    {
      slug: "blackveil-marshes",
      name: "مستنقعات الحجاب الأسود",
      body: "ضباب يتذكر اسمك. أسواق الآثار تحترق بمصابيح باردة.",
      mapX: 72,
      mapY: 55,
      factionSlug: "blackveil-covenant",
    },
    {
      slug: "throne-cold-ash",
      name: "عرش الرماد البارد",
      body: "الملك الأجوف يحلم في تاج من صمت.",
      mapX: 50,
      mapY: 22,
      factionSlug: "choir-hollow-king",
    },
  ],
};

const CHARACTERS: Record<
  Locale,
  Array<{ slug: string; name: string; title: string; body: string; rarity: string; factionSlug: string }>
> = {
  en: [
    {
      slug: "hollow-king-morvain",
      name: "Morvain the Hollow King",
      title: "Sovereign of the Unbeating Crown",
      body: "Morvain's heart was buried in three graves. He rules the Choir and the prophecy of the **Final Silence**.",
      rarity: "legendary",
      factionSlug: "choir-hollow-king",
    },
    {
      slug: "sister-elegis",
      name: "Sister Elegis",
      title: "Lich Oracle of the First Oath",
      body: "She catalogs soul fragments like coins. Her whispers rewrite sign-in streaks into oaths.",
      rarity: "epic",
      factionSlug: "necropolis-dominion",
    },
    {
      slug: "gravemarshal-keth",
      name: "Gravemarshal Keth",
      title: "Blackveil Relic Hunter",
      body: "Keth smuggles **cursed relics** through the marshes. Every sale funds another war horn.",
      rarity: "rare",
      factionSlug: "blackveil-covenant",
    },
  ],
  zh: [
    {
      slug: "hollow-king-morvain",
      name: "空壳王莫尔文",
      title: "无息王冠之君主",
      body: "莫尔文的心脏被葬在三座坟墓。他统治圣歌团与**终末寂静**预言。",
      rarity: "legendary",
      factionSlug: "choir-hollow-king",
    },
    {
      slug: "sister-elegis",
      name: "艾蕾吉斯修女",
      title: "初誓巫妖先知",
      body: "她将灵魂碎片如钱币编目。低语将签到 streak 改写为誓言。",
      rarity: "epic",
      factionSlug: "necropolis-dominion",
    },
    {
      slug: "gravemarshal-keth",
      name: "墓元帅凯斯",
      title: "黑纱遗物猎手",
      body: "凯斯穿越沼泽走私**诅咒遗物**。",
      rarity: "rare",
      factionSlug: "blackveil-covenant",
    },
  ],
  ko: [
    {
      slug: "hollow-king-morvain",
      name: "공허 왕 모르베인",
      title: "멈추지 않는 왕관의 군주",
      body: "모르베인의 심장은 세 무덤에 묻혔다. 그는 성가대와 **마지막 침묵** 예언을 지배한다.",
      rarity: "legendary",
      factionSlug: "choir-hollow-king",
    },
    {
      slug: "sister-elegis",
      name: "자매 엘레기스",
      title: "첫 서약의 리치 예언자",
      body: "영혼 파편을 동전처럼 기록한다.",
      rarity: "epic",
      factionSlug: "necropolis-dominion",
    },
    {
      slug: "gravemarshal-keth",
      name: "무덤 원수 케스",
      title: "블랙베일 유물 사냥꾼",
      body: "케스는 늪을 통해 **저주받은 유물**을 밀수한다.",
      rarity: "rare",
      factionSlug: "blackveil-covenant",
    },
  ],
  ja: [
    {
      slug: "hollow-king-morvain",
      name: "ホロウキング・モーヴァイン",
      title: "不動の王冠の君主",
      body: "心臓は三つの墓に葬られた。**最後の沈黙**の予言を司る。",
      rarity: "legendary",
      factionSlug: "choir-hollow-king",
    },
    {
      slug: "sister-elegis",
      name: "シスター・エレギス",
      title: "初誓のリッチ・オラクル",
      body: "ソウル・フラグメントを硬貨のように記録する。",
      rarity: "epic",
      factionSlug: "necropolis-dominion",
    },
    {
      slug: "gravemarshal-keth",
      name: "グレイブマーシャル・ケス",
      title: "ブラックベイル遺物狩人",
      body: "沼を通じ**呪われし遺物**を密輸する。",
      rarity: "rare",
      factionSlug: "blackveil-covenant",
    },
  ],
  ar: [
    {
      slug: "hollow-king-morvain",
      name: "مورفين الملك الأجوف",
      title: "سيّد التاج غير النابض",
      body: "دُفن قلب مورفين في ثلاثة قبور. يحكم الجوقة ونبوءة **الصمت الأخير**.",
      rarity: "legendary",
      factionSlug: "choir-hollow-king",
    },
    {
      slug: "sister-elegis",
      name: "الأخت إليجيس",
      title: "عرافة ليتش القسم الأول",
      body: "تُسجّل شظايا الأرواح كعملات معدنية.",
      rarity: "epic",
      factionSlug: "necropolis-dominion",
    },
    {
      slug: "gravemarshal-keth",
      name: "مارشال القبور كيث",
      title: "صياد آثار بلاكفيل",
      body: "يهرب **الآثار الملعونة** عبر المستنقعات.",
      rarity: "rare",
      factionSlug: "blackveil-covenant",
    },
  ],
};

const CREATURES: Record<
  Locale,
  Array<{ slug: string; name: string; body: string; rarity: string; regionSlug: string }>
> = {
  en: [
    {
      slug: "soul-wraith",
      name: "Soul Wraith",
      body: "Tax collectors of the Dominion — they drain streaks into fragment vials.",
      rarity: "common",
      regionSlug: "catacombs-first-oath",
    },
    {
      slug: "bone-leviathan",
      name: "Bone Leviathan",
      body: "Cathedral ossuary guardian. War horns echo from its ribcage.",
      rarity: "epic",
      regionSlug: "throne-cold-ash",
    },
    {
      slug: "fog-lichling",
      name: "Fog Lichling",
      body: "Blackveil marsh spawn — feeds on cursed relic residue.",
      rarity: "rare",
      regionSlug: "blackveil-marshes",
    },
  ],
  zh: [
    {
      slug: "soul-wraith",
      name: "灵魂幽影",
      body: "都城邦的税吏——将签到 streak 吸入碎片瓶。",
      rarity: "common",
      regionSlug: "catacombs-first-oath",
    },
    {
      slug: "bone-leviathan",
      name: "骨利维坦",
      body: "大教堂骨库守护者，肋间回响战号。",
      rarity: "epic",
      regionSlug: "throne-cold-ash",
    },
    {
      slug: "fog-lichling",
      name: "雾巫妖幼体",
      body: "黑纱沼泽孽种，以诅咒遗物残渣为食。",
      rarity: "rare",
      regionSlug: "blackveil-marshes",
    },
  ],
  ko: [
    {
      slug: "soul-wraith",
      name: "영혼 망령",
      body: "도미니언의 징세관.",
      rarity: "common",
      regionSlug: "catacombs-first-oath",
    },
    {
      slug: "bone-leviathan",
      name: "뼈 레비아탄",
      body: "대성당 수호자.",
      rarity: "epic",
      regionSlug: "throne-cold-ash",
    },
    {
      slug: "fog-lichling",
      name: "안개 리치링",
      body: "블랙베일 늪의 산란.",
      rarity: "rare",
      regionSlug: "blackveil-marshes",
    },
  ],
  ja: [
    {
      slug: "soul-wraith",
      name: "ソウル・レイス",
      body: "ドミニオンの徴税者。",
      rarity: "common",
      regionSlug: "catacombs-first-oath",
    },
    {
      slug: "bone-leviathan",
      name: "ボーン・レヴィアタン",
      body: "大聖堂の守護者。",
      rarity: "epic",
      regionSlug: "throne-cold-ash",
    },
    {
      slug: "fog-lichling",
      name: "フォグ・リッチリング",
      body: "ブラックベイルの沼生まれ。",
      rarity: "rare",
      regionSlug: "blackveil-marshes",
    },
  ],
  ar: [
    {
      slug: "soul-wraith",
      name: "شبح الأرواح",
      body: "جباة ضرائب الهيمنة.",
      rarity: "common",
      regionSlug: "catacombs-first-oath",
    },
    {
      slug: "bone-leviathan",
      name: "ليفياثان العظام",
      body: "حارس الكاتدرائية.",
      rarity: "epic",
      regionSlug: "throne-cold-ash",
    },
    {
      slug: "fog-lichling",
      name: "ليتش الضباب",
      body: "نسل مستنقعات بلاكفيل.",
      rarity: "rare",
      regionSlug: "blackveil-marshes",
    },
  ],
};

const ARTIFACTS: Record<
  Locale,
  Array<{ slug: string; name: string; body: string; rarity: string; factionSlug: string }>
> = {
  en: [
    {
      slug: "soul-fragment-vessel",
      name: "Soul Fragment Vessel",
      body: "A vial of stolen memories — spendable as points, tradable as mock NFTs.",
      rarity: "common",
      factionSlug: "necropolis-dominion",
    },
    {
      slug: "cursed-relic-blade",
      name: "Cursed Relic Blade",
      body: "Forged in Blackveil fog. Cuts wallets and streaks alike.",
      rarity: "rare",
      factionSlug: "blackveil-covenant",
    },
    {
      slug: "necrotic-sigil",
      name: "Necrotic Sigil",
      body: "Burns violet on chain-less ledgers. Epic mock reward for oath-keepers.",
      rarity: "epic",
      factionSlug: "choir-hollow-king",
    },
    {
      slug: "abyssal-echo",
      name: "Abyssal Echo",
      body: "A sound that should not exist. Legendary collectible for the Final Silence prophecy.",
      rarity: "legendary",
      factionSlug: "choir-hollow-king",
    },
  ],
  zh: [
    {
      slug: "soul-fragment-vessel",
      name: "灵魂碎片瓶",
      body: "被盗记忆的容器——可作积分，亦可作为虚拟藏品交易。",
      rarity: "common",
      factionSlug: "necropolis-dominion",
    },
    {
      slug: "cursed-relic-blade",
      name: "诅咒遗物之刃",
      body: "黑纱迷雾中锻造，割裂钱包与 streak。",
      rarity: "rare",
      factionSlug: "blackveil-covenant",
    },
    {
      slug: "necrotic-sigil",
      name: "死灵印记",
      body: "在无链账本上燃烧紫焰。守誓者的史诗奖励。",
      rarity: "epic",
      factionSlug: "choir-hollow-king",
    },
    {
      slug: "abyssal-echo",
      name: "深渊回响",
      body: "不应存在之声。终末寂静预言的传奇藏品。",
      rarity: "legendary",
      factionSlug: "choir-hollow-king",
    },
  ],
  ko: [
    {
      slug: "soul-fragment-vessel",
      name: "영혼 파편 병",
      body: "훔친 기억의 병 — 포인트이자 NFT 보상.",
      rarity: "common",
      factionSlug: "necropolis-dominion",
    },
    {
      slug: "cursed-relic-blade",
      name: "저주받은 유물 검",
      body: "블랙베일 안개에서 벼려졌다.",
      rarity: "rare",
      factionSlug: "blackveil-covenant",
    },
    {
      slug: "necrotic-sigil",
      name: "네크로틱 인장",
      body: "서약자의 에픽 보상.",
      rarity: "epic",
      factionSlug: "choir-hollow-king",
    },
    {
      slug: "abyssal-echo",
      name: "심연의 메아리",
      body: "존재해선 안 될 소리. 전설 보상.",
      rarity: "legendary",
      factionSlug: "choir-hollow-king",
    },
  ],
  ja: [
    {
      slug: "soul-fragment-vessel",
      name: "ソウル・フラグメント瓶",
      body: "盗まれた記憶の器。",
      rarity: "common",
      factionSlug: "necropolis-dominion",
    },
    {
      slug: "cursed-relic-blade",
      name: "呪われし遺物の刃",
      body: "ブラックベイルの霧で鍛えられた。",
      rarity: "rare",
      factionSlug: "blackveil-covenant",
    },
    {
      slug: "necrotic-sigil",
      name: "ネクロティック・シジル",
      body: "誓いを守る者へのエピック報酬。",
      rarity: "epic",
      factionSlug: "choir-hollow-king",
    },
    {
      slug: "abyssal-echo",
      name: "深淵のこだま",
      body: "存在してはならない音。",
      rarity: "legendary",
      factionSlug: "choir-hollow-king",
    },
  ],
  ar: [
    {
      slug: "soul-fragment-vessel",
      name: "وعاء شظايا الأرواح",
      body: "ذكريات مسروقة — نقاط ومكافآت افتراضية.",
      rarity: "common",
      factionSlug: "necropolis-dominion",
    },
    {
      slug: "cursed-relic-blade",
      name: "نصل الآثار الملعونة",
      body: "صُقل في ضباب بلاكفيل.",
      rarity: "rare",
      factionSlug: "blackveil-covenant",
    },
    {
      slug: "necrotic-sigil",
      name: "ختم نيكروتيك",
      body: "مكافأة ملحمية لحلفاء القسم.",
      rarity: "epic",
      factionSlug: "choir-hollow-king",
    },
    {
      slug: "abyssal-echo",
      name: "صدى الهاوية",
      body: "صوت لا ينبغي أن يوجد.",
      rarity: "legendary",
      factionSlug: "choir-hollow-king",
    },
  ],
};

const TIMELINE: Record<
  Locale,
  Array<{ slug: string; title: string; body: string; era: string; yearLabel: string; sortOrder: number; factionSlug?: string }>
> = {
  en: [
    {
      slug: "first-oath-broken",
      title: "The First Oath Breaks",
      body: "The Dominion swears eternal undeath. By dawn, the first soul tax is collected.",
      era: "Age of Stillness",
      yearLabel: "Year −400",
      sortOrder: 0,
      factionSlug: "necropolis-dominion",
    },
    {
      slug: "hollow-king-rises",
      title: "Awakening of the Hollow King",
      body: "Morvain removes his heart. Cathedrals sing backwards. **Abyssal Echoes** are first recorded.",
      era: "Age of Stillness",
      yearLabel: "Year −200",
      sortOrder: 1,
      factionSlug: "choir-hollow-king",
    },
    {
      slug: "blackveil-markets",
      title: "Blackveil Relic Markets Open",
      body: "Cursed relic trade becomes the only economy that grows.",
      era: "Age of Ash",
      yearLabel: "Year −50",
      sortOrder: 2,
      factionSlug: "blackveil-covenant",
    },
    {
      slug: "final-silence-prophecy",
      title: "Prophecy of Final Silence",
      body: "Oracles claim KENBA will end when every player holds an **Abyssal Echo**.",
      era: "Present",
      yearLabel: "Year 0",
      sortOrder: 3,
    },
  ],
  zh: [
    {
      slug: "first-oath-broken",
      title: "初誓破碎",
      body: "都城邦立誓永恒不死。黎明即征收首个灵魂税。",
      era: "静滞纪元",
      yearLabel: "前400年",
      sortOrder: 0,
      factionSlug: "necropolis-dominion",
    },
    {
      slug: "hollow-king-rises",
      title: "空壳王觉醒",
      body: "莫尔文摘去心脏。教堂倒唱圣歌。",
      era: "静滞纪元",
      yearLabel: "前200年",
      sortOrder: 1,
      factionSlug: "choir-hollow-king",
    },
    {
      slug: "blackveil-markets",
      title: "黑纱遗物市集",
      body: "诅咒遗物贸易成为唯一增长的禁术经济。",
      era: "灰烬纪元",
      yearLabel: "前50年",
      sortOrder: 2,
      factionSlug: "blackveil-covenant",
    },
    {
      slug: "final-silence-prophecy",
      title: "终末寂静预言",
      body: "先知宣称当每位玩家持有**深渊回响**，KENBA将终结。",
      era: "当下",
      yearLabel: "第0年",
      sortOrder: 3,
    },
  ],
  ko: [
    {
      slug: "first-oath-broken",
      title: "첫 서약의 파괴",
      body: "영원한 언데드를 맹세했으나 새벽에 영혼세가 시작되었다.",
      era: "정적의 시대",
      yearLabel: "기원전 400",
      sortOrder: 0,
      factionSlug: "necropolis-dominion",
    },
    {
      slug: "hollow-king-rises",
      title: "공허 왕의 각성",
      body: "모르베인이 심장을 제거했다.",
      era: "정적의 시대",
      yearLabel: "기원전 200",
      sortOrder: 1,
      factionSlug: "choir-hollow-king",
    },
    {
      slug: "blackveil-markets",
      title: "블랙베일 유물 시장",
      body: "저주받은 유물 거래만이 성장한다.",
      era: "재의 시대",
      yearLabel: "기원전 50",
      sortOrder: 2,
      factionSlug: "blackveil-covenant",
    },
    {
      slug: "final-silence-prophecy",
      title: "마지막 침묵 예언",
      body: "모든 플레이어가 **심연의 메아리**를 보유하면 끝난다.",
      era: "현재",
      yearLabel: "0년",
      sortOrder: 3,
    },
  ],
  ja: [
    {
      slug: "first-oath-broken",
      title: "初誓の破綻",
      body: "永遠の不死を誓い、夜明けに魂税が始まった。",
      era: "静寂の時代",
      yearLabel: "紀元前400",
      sortOrder: 0,
      factionSlug: "necropolis-dominion",
    },
    {
      slug: "hollow-king-rises",
      title: "ホロウキングの覚醒",
      body: "心臓を抜き、聖堂は逆唱する。",
      era: "静寂の時代",
      yearLabel: "紀元前200",
      sortOrder: 1,
      factionSlug: "choir-hollow-king",
    },
    {
      slug: "blackveil-markets",
      title: "ブラックベイル市場",
      body: "呪われし遺物だけが成長する。",
      era: "灰の時代",
      yearLabel: "紀元前50",
      sortOrder: 2,
      factionSlug: "blackveil-covenant",
    },
    {
      slug: "final-silence-prophecy",
      title: "最後の沈黙",
      body: "全員が**深淵のこだま**を持つ時、終わる。",
      era: "現在",
      yearLabel: "0年",
      sortOrder: 3,
    },
  ],
  ar: [
    {
      slug: "first-oath-broken",
      title: "كسر القسم الأول",
      body: "أقسموا بعدم الموت، وجُبي ضريبة الأرواح عند الفجر.",
      era: "عصر السكون",
      yearLabel: "400 ق.م",
      sortOrder: 0,
      factionSlug: "necropolis-dominion",
    },
    {
      slug: "hollow-king-rises",
      title: "يقظة الملك الأجوف",
      body: "أزال مورفين قلبه. تُنشد الكاتدرائيات بالعكس.",
      era: "عصر السكون",
      yearLabel: "200 ق.م",
      sortOrder: 1,
      factionSlug: "choir-hollow-king",
    },
    {
      slug: "blackveil-markets",
      title: "أسواق بلاكفيل",
      body: "تجارة الآثار الملعونة وحدها تنمو.",
      era: "عصر الرماد",
      yearLabel: "50 ق.م",
      sortOrder: 2,
      factionSlug: "blackveil-covenant",
    },
    {
      slug: "final-silence-prophecy",
      title: "نبوءة الصمت الأخير",
      body: "ينتهي كانغبا عندما يحمل الجميع **صدى الهاوية**.",
      era: "الحاضر",
      yearLabel: "0",
      sortOrder: 3,
    },
  ],
};

const CAMPAIGNS: Record<
  Locale,
  Array<{
    slug: string;
    name: string;
    description: string;
    narrative: string;
    quests: Array<{ id: string; stepOrder: number; title: string; description: string; taskKey: string; rewardPoints: number; branchKey?: string }>;
  }>
> = {
  en: [
    {
      slug: "hollow-king-awakening",
      name: "The Awakening of the Hollow King",
      description: "A three-step rite beneath the Throne of Cold Ash.",
      narrative: "Morvain stirs. Complete the chain to earn soul fragments and a necrotic sigil.",
      quests: [
        {
          id: "quest-hollow-signin",
          stepOrder: 1,
          title: "Oath of Ash",
          description: "Claim daily sign-in while the King dreams.",
          taskKey: "signin",
          rewardPoints: 120,
        },
        {
          id: "quest-hollow-lore",
          stepOrder: 2,
          title: "Read the Forbidden Chronicle",
          description: "Visit any faction page in Lore.",
          taskKey: "lore_visit",
          rewardPoints: 80,
          branchKey: "knowledge",
        },
        {
          id: "quest-hollow-invite",
          stepOrder: 3,
          title: "Bind a Witness Soul",
          description: "Recruit one ally to witness the awakening.",
          taskKey: "referral",
          rewardPoints: 200,
          branchKey: "covenant",
        },
      ],
    },
    {
      slug: "echoes-beneath-blackveil",
      name: "Echoes Beneath Blackveil",
      description: "Relic hunters race through the fog.",
      narrative: "The marshes whisper. Gather cursed knowledge before the fog closes.",
      quests: [
        {
          id: "quest-blackveil-task",
          stepOrder: 1,
          title: "Smuggler's Ledger",
          description: "Complete any daily task during the fog event.",
          taskKey: "task",
          rewardPoints: 100,
        },
        {
          id: "quest-blackveil-campaign",
          stepOrder: 2,
          title: "Echo Resonance",
          description: "Advance any campaign quest chain once.",
          taskKey: "campaign",
          rewardPoints: 150,
        },
      ],
    },
  ],
  zh: [
    {
      slug: "hollow-king-awakening",
      name: "空壳王觉醒",
      description: "冷灰王座下的三步仪式。",
      narrative: "莫尔文苏醒。完成链条以赢取灵魂碎片与死灵印记。",
      quests: [
        {
          id: "quest-hollow-signin",
          stepOrder: 1,
          title: "灰烬誓言",
          description: "在君王梦境期间完成每日签到。",
          taskKey: "signin",
          rewardPoints: 120,
        },
        {
          id: "quest-hollow-lore",
          stepOrder: 2,
          title: "禁典阅览",
          description: "访问任意世界观阵营页。",
          taskKey: "lore_visit",
          rewardPoints: 80,
          branchKey: "knowledge",
        },
        {
          id: "quest-hollow-invite",
          stepOrder: 3,
          title: "缚见证之魂",
          description: "招募一名盟友见证觉醒。",
          taskKey: "referral",
          rewardPoints: 200,
          branchKey: "covenant",
        },
      ],
    },
    {
      slug: "echoes-beneath-blackveil",
      name: "黑纱之下的回响",
      description: "遗物猎人在迷雾中竞速。",
      narrative: "沼泽低语。在迷雾闭合前收集诅咒知识。",
      quests: [
        {
          id: "quest-blackveil-task",
          stepOrder: 1,
          title: "走私者账册",
          description: "在迷雾事件期间完成任意每日任务。",
          taskKey: "task",
          rewardPoints: 100,
        },
        {
          id: "quest-blackveil-campaign",
          stepOrder: 2,
          title: "回响共鸣",
          description: "推进任意战役任务链一次。",
          taskKey: "campaign",
          rewardPoints: 150,
        },
      ],
    },
  ],
  ko: [
    {
      slug: "hollow-king-awakening",
      name: "공허 왕의 각성",
      description: "차가운 재의 왕좌 아래 3단 의식.",
      narrative: "모르베인이 움직인다.",
      quests: [
        {
          id: "quest-hollow-signin",
          stepOrder: 1,
          title: "재의 맹세",
          description: "매일 출석.",
          taskKey: "signin",
          rewardPoints: 120,
        },
        {
          id: "quest-hollow-lore",
          stepOrder: 2,
          title: "금서 열람",
          description: "세계관 진영 페이지 방문.",
          taskKey: "lore_visit",
          rewardPoints: 80,
        },
        {
          id: "quest-hollow-invite",
          stepOrder: 3,
          title: "증인의 영혼",
          description: "동맹 1명 초대.",
          taskKey: "referral",
          rewardPoints: 200,
        },
      ],
    },
    {
      slug: "echoes-beneath-blackveil",
      name: "블랙베일 아래의 메아리",
      description: "안개 속 유물 사냥.",
      narrative: "늪이 속삭인다.",
      quests: [
        {
          id: "quest-blackveil-task",
          stepOrder: 1,
          title: "밀수꾼 장부",
          description: "일일 임무 완료.",
          taskKey: "task",
          rewardPoints: 100,
        },
        {
          id: "quest-blackveil-campaign",
          stepOrder: 2,
          title: "메아리 공명",
          description: "캠페인 퀘스트 진행.",
          taskKey: "campaign",
          rewardPoints: 150,
        },
      ],
    },
  ],
  ja: [
    {
      slug: "hollow-king-awakening",
      name: "ホロウキングの覚醒",
      description: "冷灰の玉座の下で三つの儀式。",
      narrative: "モーヴァインが動き出す。",
      quests: [
        {
          id: "quest-hollow-signin",
          stepOrder: 1,
          title: "灰の誓い",
          description: "毎日サインイン。",
          taskKey: "signin",
          rewardPoints: 120,
        },
        {
          id: "quest-hollow-lore",
          stepOrder: 2,
          title: "禁書の閲覧",
          description: "ロアの派閥ページを訪問。",
          taskKey: "lore_visit",
          rewardPoints: 80,
        },
        {
          id: "quest-hollow-invite",
          stepOrder: 3,
          title: "証人の魂",
          description: "同盟を1人招待。",
          taskKey: "referral",
          rewardPoints: 200,
        },
      ],
    },
    {
      slug: "echoes-beneath-blackveil",
      name: "ブラックベイルのこだま",
      description: "霧の中の遺物狩り。",
      narrative: "沼が囁く。",
      quests: [
        {
          id: "quest-blackveil-task",
          stepOrder: 1,
          title: "密輸人の帳簿",
          description: "デイリータスクを完了。",
          taskKey: "task",
          rewardPoints: 100,
        },
        {
          id: "quest-blackveil-campaign",
          stepOrder: 2,
          title: "こだま共鳴",
          description: "キャンペーンを進行。",
          taskKey: "campaign",
          rewardPoints: 150,
        },
      ],
    },
  ],
  ar: [
    {
      slug: "hollow-king-awakening",
      name: "يقظة الملك الأجوف",
      description: "طقوس من ثلاث خطوات تحت عرش الرماد.",
      narrative: "يتحرك مورفين.",
      quests: [
        {
          id: "quest-hollow-signin",
          stepOrder: 1,
          title: "قسم الرماد",
          description: "سجّل الدخول يومياً.",
          taskKey: "signin",
          rewardPoints: 120,
        },
        {
          id: "quest-hollow-lore",
          stepOrder: 2,
          title: "قراءة الممنوع",
          description: "زر صفحة فصيل في الأساطير.",
          taskKey: "lore_visit",
          rewardPoints: 80,
        },
        {
          id: "quest-hollow-invite",
          stepOrder: 3,
          title: "ربط شاهد",
          description: "ادعُ حليفاً واحداً.",
          taskKey: "referral",
          rewardPoints: 200,
        },
      ],
    },
    {
      slug: "echoes-beneath-blackveil",
      name: "أصداء تحت بلاكفيل",
      description: "صيادو الآثار في الضباب.",
      narrative: "المرج يهمس.",
      quests: [
        {
          id: "quest-blackveil-task",
          stepOrder: 1,
          title: "دفتر المهرب",
          description: "أكمل مهمة يومية.",
          taskKey: "task",
          rewardPoints: 100,
        },
        {
          id: "quest-blackveil-campaign",
          stepOrder: 2,
          title: "رنين الصدى",
          description: "تقدّم في حملة.",
          taskKey: "campaign",
          rewardPoints: 150,
        },
      ],
    },
  ],
};

const CMS_ANNOUNCEMENTS: Record<Locale, { message: string; linkUrl: string }> = {
  en: {
    message: "The Hollow King stirs — Awakening rite live. Soul fragment rewards doubled in Blackveil.",
    linkUrl: "/campaigns/hollow-king-awakening",
  },
  zh: {
    message: "空壳王苏醒——觉醒仪式已开启。黑纱期间灵魂碎片奖励加倍。",
    linkUrl: "/campaigns/hollow-king-awakening",
  },
  ko: {
    message: "공허 왕이 움직입니다 — 각성 의식 진행 중.",
    linkUrl: "/campaigns/hollow-king-awakening",
  },
  ja: {
    message: "ホロウキングが動き出す — 覚醒の儀式が始まった。",
    linkUrl: "/campaigns/hollow-king-awakening",
  },
  ar: {
    message: "الملك الأجوف يتحرك — طقوس اليقظة بدأت.",
    linkUrl: "/campaigns/hollow-king-awakening",
  },
};

const DOC_BUNDLE: Record<
  Locale,
  Array<{ slug: string; category: string; title: string; body: string; sortOrder: number }>
> = {
  en: [
    {
      slug: "economy",
      category: "tokenomics",
      title: "Forbidden Soul Economics",
      body: "## Soul Fragments\n\nPoints are **taxed memories**. Mock NFT tiers: Soul Fragment Vessel → Cursed Relic → Necrotic Sigil → Abyssal Echo.",
      sortOrder: 0,
    },
    {
      slug: "phases",
      category: "roadmap",
      title: "Roadmap of the Dying Age",
      body: "## Phases\n\n1. Undead lore & engagement\n2. Alpha cathedral\n3. Community relic wars\n4. On-chain soul contracts (future)",
      sortOrder: 0,
    },
    {
      slug: "enter-necropolis",
      category: "docs",
      title: "Enter the Necropolis",
      body: "Connect wallet or email. Pay daily **soul tithe**. Explore factions. Join **Hollow King** campaigns.",
      sortOrder: 0,
    },
    {
      slug: "soul-rewards-faq",
      category: "faq",
      title: "Are soul fragments on-chain?",
      body: "Not in this phase. All relics are virtual, narrative-bound, and exportable for future programs.",
      sortOrder: 0,
    },
  ],
  zh: [
    {
      slug: "economy",
      category: "tokenomics",
      title: "禁术灵魂经济",
      body: "## 灵魂碎片\n\n积分是被征税的记忆。虚拟藏品：灵魂碎片瓶 → 诅咒遗物 → 死灵印记 → 深渊回响。",
      sortOrder: 0,
    },
    {
      slug: "phases",
      category: "roadmap",
      title: "将亡纪元路线图",
      body: "## 阶段\n\n1. 不死世界观与参与\n2. 阿尔法大教堂\n3. 社区遗物战争\n4. 链上灵魂契约（未来）",
      sortOrder: 0,
    },
    {
      slug: "enter-necropolis",
      category: "docs",
      title: "进入死灵都城",
      body: "连接钱包或邮箱。缴纳每日魂税。探索派系。加入空壳王战役。",
      sortOrder: 0,
    },
    {
      slug: "soul-rewards-faq",
      category: "faq",
      title: "灵魂碎片上链吗？",
      body: "本阶段不上链。所有遗物为虚拟叙事藏品，可导出用于未来计划。",
      sortOrder: 0,
    },
  ],
  ko: [
    {
      slug: "economy",
      category: "tokenomics",
      title: "금지된 영혼 경제",
      body: "## 영혼 파편\n\n포인트는 **징수된 기억**입니다.",
      sortOrder: 0,
    },
    {
      slug: "phases",
      category: "roadmap",
      title: "죽어가는 시대 로드맵",
      body: "## 단계\n\n1. 언데드 로어\n2. 알파 출시\n3. 커뮤니티\n4. 온체인 (미래)",
      sortOrder: 0,
    },
    {
      slug: "enter-necropolis",
      category: "docs",
      title: "네크로폴리스 입장",
      body: "지갑 또는 이메일로 연결. 일일 영혼세를 지불하세요.",
      sortOrder: 0,
    },
    {
      slug: "soul-rewards-faq",
      category: "faq",
      title: "온체인인가요?",
      body: "이 단계에서는 가상 보상만 제공됩니다.",
      sortOrder: 0,
    },
  ],
  ja: [
    {
      slug: "economy",
      category: "tokenomics",
      title: "禁断のソウル経済",
      body: "## ソウル・フラグメント\n\nポイントは**徴収された記憶**です。",
      sortOrder: 0,
    },
    {
      slug: "phases",
      category: "roadmap",
      title: "死にゆく時代のロードマップ",
      body: "## フェーズ\n\n1. アンデッドロア\n2. アルファ\n3. コミュニティ\n4. オンチェーン（将来）",
      sortOrder: 0,
    },
    {
      slug: "enter-necropolis",
      category: "docs",
      title: "ネクロポリスへ",
      body: "ウォレットまたはメールで接続。日々の魂税を払う。",
      sortOrder: 0,
    },
    {
      slug: "soul-rewards-faq",
      category: "faq",
      title: "オンチェーンですか？",
      body: "現フェーズでは仮想報酬のみです。",
      sortOrder: 0,
    },
  ],
  ar: [
    {
      slug: "economy",
      category: "tokenomics",
      title: "اقتصاد الأرواح المحرّم",
      body: "## شظايا الأرواح\n\nالنقاط هي **ذكريات مُقتطعة**.",
      sortOrder: 0,
    },
    {
      slug: "phases",
      category: "roadmap",
      title: "خارطة العصر المحتضر",
      body: "## المراحل\n\n1. الأساطير\n2. ألفا\n3. المجتمع\n4. على السلسلة (لاحقاً)",
      sortOrder: 0,
    },
    {
      slug: "enter-necropolis",
      category: "docs",
      title: "ادخل نيكروبوليس",
      body: "اربط المحفظة أو البريد. ادفع ضريبة الأرواح اليومية.",
      sortOrder: 0,
    },
    {
      slug: "soul-rewards-faq",
      category: "faq",
      title: "هل على السلسلة؟",
      body: "في هذه المرحلة المكافآت افتراضية فقط.",
      sortOrder: 0,
    },
  ],
};

const DOC_LITE: Record<Locale, { title: string; body: string }> = {
  en: {
    title: "KENBA — Soul Economics of a Dying Civilization",
    body: "# KENBA Litepaper\n\nKENBA is a **dying undead civilization** powered by forbidden soul economics.\n\n## Soul Fragments\n\nPoints represent taxed memories. Mock NFTs manifest as **cursed relics**, **necrotic sigils**, and **Abyssal Echoes**.\n\n## No On-Chain Minting (Phase 6.x)\n\nAll rewards are virtual, exportable, privacy-safe.",
  },
  zh: {
    title: "KENBA — 将亡文明的灵魂经济学",
    body: "# KENBA白皮书\n\nKENBA是一个由**禁术灵魂经济**驱动的**将亡不死文明**。\n\n## 灵魂碎片\n\n积分是被征税的记忆。虚拟藏品体现为**诅咒遗物**、**死灵印记**与**深渊回响**。",
  },
  ko: {
    title: "캉바 — 죽어가는 문명의 영혼 경제",
    body: "# 캉바 라이트페이퍼\n\n**금지된 영혼 경제**로 유지되는 **언데드 문명**입니다.",
  },
  ja: {
    title: "カンバ — 死にゆく文明の魂経済",
    body: "# カンバ・ライトペーパー\n\n**禁断のソウル経済**で動く**アンデッド文明**です。",
  },
  ar: {
    title: "كانغبا — اقتصاد أرواح حضارة محتضرة",
    body: "# كانغبا\n\nحضارة **أموات أحياء** يقودها **اقتصاد الأرواح المحرّم**.",
  },
};

export async function seedUndeadLore(prisma: PrismaClient) {
  await prisma.loreFaction.updateMany({
    where: { slug: "shadow-court" },
    data: { published: false },
  });

  const factionIds: Record<string, Record<string, string>> = {};

  for (const locale of LOCALES) {
    factionIds[locale] = {};
    for (const f of FACTIONS[locale]) {
      const row = await prisma.loreFaction.upsert({
        where: { slug_locale: { slug: f.slug, locale } },
        update: {
          name: f.name,
          tagline: f.tagline,
          body: f.body,
          motto: f.motto,
          colorTheme: f.colorTheme,
          sortOrder: f.sortOrder,
          published: true,
        },
        create: { ...f, locale, published: true },
      });
      factionIds[locale][f.slug] = row.id;
    }

    for (const r of REGIONS[locale]) {
      await prisma.loreRegion.upsert({
        where: { slug_locale: { slug: r.slug, locale } },
        update: {
          name: r.name,
          body: r.body,
          mapX: r.mapX,
          mapY: r.mapY,
          factionId: factionIds[locale][r.factionSlug],
          published: true,
        },
        create: {
          slug: r.slug,
          locale,
          name: r.name,
          body: r.body,
          mapX: r.mapX,
          mapY: r.mapY,
          factionId: factionIds[locale][r.factionSlug],
          published: true,
        },
      });
    }

    const regionIds: Record<string, string> = {};
    const regions = await prisma.loreRegion.findMany({ where: { locale } });
    for (const r of regions) regionIds[r.slug] = r.id;

    for (const cr of CREATURES[locale]) {
      await prisma.loreCreature.upsert({
        where: { slug_locale: { slug: cr.slug, locale } },
        update: {
          name: cr.name,
          body: cr.body,
          rarity: cr.rarity,
          regionId: regionIds[cr.regionSlug],
          published: true,
        },
        create: {
          slug: cr.slug,
          locale,
          name: cr.name,
          body: cr.body,
          rarity: cr.rarity,
          regionId: regionIds[cr.regionSlug],
          published: true,
        },
      });
    }

    for (const c of CHARACTERS[locale]) {
      await prisma.loreCharacter.upsert({
        where: { slug_locale: { slug: c.slug, locale } },
        update: {
          name: c.name,
          title: c.title,
          body: c.body,
          rarity: c.rarity,
          factionId: factionIds[locale][c.factionSlug],
          published: true,
        },
        create: {
          slug: c.slug,
          locale,
          name: c.name,
          title: c.title,
          body: c.body,
          rarity: c.rarity,
          factionId: factionIds[locale][c.factionSlug],
          published: true,
        },
      });
    }

    for (const a of ARTIFACTS[locale]) {
      await prisma.loreArtifact.upsert({
        where: { slug_locale: { slug: a.slug, locale } },
        update: {
          name: a.name,
          body: a.body,
          rarity: a.rarity,
          factionId: factionIds[locale][a.factionSlug],
          published: true,
        },
        create: {
          slug: a.slug,
          locale,
          name: a.name,
          body: a.body,
          rarity: a.rarity,
          factionId: factionIds[locale][a.factionSlug],
          published: true,
        },
      });
    }

    for (const t of TIMELINE[locale]) {
      await prisma.loreTimeline.upsert({
        where: { slug_locale: { slug: t.slug, locale } },
        update: {
          title: t.title,
          body: t.body,
          era: t.era,
          yearLabel: t.yearLabel,
          sortOrder: t.sortOrder,
          factionId: t.factionSlug ? factionIds[locale][t.factionSlug] : null,
          published: true,
        },
        create: {
          slug: t.slug,
          locale,
          title: t.title,
          body: t.body,
          era: t.era,
          yearLabel: t.yearLabel,
          sortOrder: t.sortOrder,
          factionId: t.factionSlug ? factionIds[locale][t.factionSlug] : undefined,
          published: true,
        },
      });
    }

    const ann = CMS_ANNOUNCEMENTS[locale];
    await prisma.cmsAnnouncement.upsert({
      where: { id: `ann-undead-${locale}` },
      update: { message: ann.message, linkUrl: ann.linkUrl, active: true, locale },
      create: {
        id: `ann-undead-${locale}`,
        locale,
        message: ann.message,
        linkUrl: ann.linkUrl,
        active: true,
      },
    });

    await prisma.cmsBanner.upsert({
      where: { id: `banner-undead-${locale}` },
      update: {
        title: locale === "zh" ? "空壳王觉醒" : "Hollow King Awakens",
        subtitle: locale === "zh" ? "灵魂碎片奖励" : "Soul fragment rewards",
        linkUrl: "/campaigns/hollow-king-awakening",
        active: true,
        locale,
      },
      create: {
        id: `banner-undead-${locale}`,
        locale,
        title: locale === "zh" ? "空壳王觉醒" : "Hollow King Awakens",
        subtitle: locale === "zh" ? "完成觉醒仪式" : "Complete the awakening rite",
        linkUrl: "/campaigns/hollow-king-awakening",
        sortOrder: 0,
        active: true,
      },
    });

    const lite = DOC_LITE[locale];
    await prisma.docArticle.upsert({
      where: { slug_locale_category: { slug: "overview", locale, category: "litepaper" } },
      update: { title: lite.title, body: lite.body, published: true },
      create: {
        slug: "overview",
        category: "litepaper",
        locale,
        title: lite.title,
        body: lite.body,
        published: true,
      },
    });

    for (const doc of DOC_BUNDLE[locale]) {
      await prisma.docArticle.upsert({
        where: {
          slug_locale_category: { slug: doc.slug, locale, category: doc.category },
        },
        update: { title: doc.title, body: doc.body, published: true, sortOrder: doc.sortOrder },
        create: { ...doc, locale, published: true },
      });
    }
  }

  const campaignStart = new Date();
  const campaignEnd = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);

  await prisma.campaign.updateMany({
    where: { slug: "shadow-awakening" },
    data: { active: false },
  });

  // Legacy seeds used the same quest PK across locales; remove so each locale campaign keeps its chain.
  await prisma.campaignQuest.deleteMany({
    where: {
      id: {
        in: [
          "quest-hollow-signin",
          "quest-hollow-lore",
          "quest-hollow-invite",
          "quest-blackveil-task",
          "quest-blackveil-campaign",
        ],
      },
    },
  });

  for (const locale of LOCALES) {
    for (const c of CAMPAIGNS[locale]) {
      const campaign = await prisma.campaign.upsert({
        where: { slug_locale: { slug: c.slug, locale } },
        update: {
          name: c.name,
          description: c.description,
          narrative: c.narrative,
          startsAt: campaignStart,
          endsAt: campaignEnd,
          active: true,
          featured: c.slug === "hollow-king-awakening",
        },
        create: {
          slug: c.slug,
          locale,
          name: c.name,
          description: c.description,
          narrative: c.narrative,
          startsAt: campaignStart,
          endsAt: campaignEnd,
          active: true,
          featured: c.slug === "hollow-king-awakening",
        },
      });

      for (const q of c.quests) {
        // Quest IDs must be unique globally — shared keys like quest-hollow-signin are per-locale campaigns.
        const questId = `${q.id}-${locale}`;
        await prisma.campaignQuest.upsert({
          where: { id: questId },
          update: {
            campaignId: campaign.id,
            stepOrder: q.stepOrder,
            title: q.title,
            description: q.description,
            taskKey: q.taskKey,
            rewardPoints: q.rewardPoints,
            branchKey: q.branchKey,
            targetProgress: 1,
          },
          create: {
            id: questId,
            campaignId: campaign.id,
            stepOrder: q.stepOrder,
            title: q.title,
            description: q.description,
            taskKey: q.taskKey,
            rewardPoints: q.rewardPoints,
            branchKey: q.branchKey,
            targetProgress: 1,
          },
        });
      }
    }
  }

  await prisma.communityRole.updateMany({
    where: { key: "wanderer" },
    data: { name: "Deathsworn", description: "A soul taxed but still walking." },
  });
  await prisma.communityRole.updateMany({
    where: { key: "vanguard" },
    data: { name: "Soulbinder", description: "Binds fragments for the Dominion." },
  });
  await prisma.communityRole.updateMany({
    where: { key: "archon" },
    data: { name: "Grave Sovereign", description: "Commands relic markets and war horns." },
  });

  await prisma.badge.updateMany({
    where: { key: "og" },
    data: { name: "Oathbreaker OG", description: "Witnessed the First Oath break.", frameStyle: "ember" },
  });
  await prisma.badge.updateMany({
    where: { key: "alpha-tester" },
    data: { name: "Hollow Alpha", description: "Five souls bound to your banner.", frameStyle: "violet" },
  });
}
