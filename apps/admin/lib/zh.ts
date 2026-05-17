import type { MediaCategory } from "./admin-api";

/** 后台界面中文文案 */
export const zh = {
  appTitle: "KENBA 后台",
  brand: "KENBA",

  nav: {
    dashboard: "仪表盘",
    analytics: "数据分析",
    users: "用户",
    referrals: "邀请关系",
    cms: "内容管理",
    media: "素材库",
    lore: "世界观",
    campaigns: "战役活动",
    docs: "文档",
    monitoring: "监控",
    events: "限时活动",
    community: "社区",
    rewards: "奖励",
    shop: "积分商城",
    exports: "数据导出",
    audit: "审计日志",
    system: "系统状态",
    settings: "账号设置",
    tasks: "任务",
    nfts: "NFT 奖励",
    signin: "签到奖励",
  },

  common: {
    slug: "路径标识 (Slug)",
    locale: "语言",
    title: "标题",
    name: "名称",
    save: "保存",
    published: "已发布",
    active: "已启用",
    featured: "推荐展示",
    loading: "加载中…",
    search: "搜索",
    prev: "上一页",
    next: "下一页",
  },

  imageUpload: {
    globalRules: "支持 JPG / PNG / WebP / GIF，单张不超过 5MB",
    pasteUrl: "或粘贴已有 URL",
    placeholder: "/storage/images/...",
    specsTitle: "上传规格",
  },
} as const;

/** 各素材分类推荐尺寸与说明 */
export const imageSpecsByCategory: Record<
  MediaCategory,
  { label: string; recommend: string; ratio?: string }
> = {
  illustrations: { label: "通用插画", recommend: "建议 1200×800 px 及以上", ratio: "3:2" },
  lore: { label: "世界观", recommend: "角色立绘建议 800×1200 px（竖版）", ratio: "2:3" },
  banners: { label: "横幅", recommend: "建议 1920×640 px（宽屏横幅）", ratio: "3:1" },
  cms: { label: "内容管理", recommend: "封面建议 1200×630 px", ratio: "约 1.9:1" },
  events: { label: "限时活动", recommend: "建议 1600×600 px", ratio: "8:3" },
  campaigns: { label: "战役活动", recommend: "建议 1600×600 px", ratio: "8:3" },
  community: { label: "社区徽章", recommend: "建议 512×512 px（正方形）", ratio: "1:1" },
  nft: { label: "NFT", recommend: "建议 1024×1024 px（正方形）", ratio: "1:1" },
};

export function getImageUploadHint(category: MediaCategory): string {
  const spec = imageSpecsByCategory[category];
  return `${zh.imageUpload.globalRules}；${spec.recommend}${spec.ratio ? `，比例约 ${spec.ratio}` : ""}`;
}

export const mediaCategoryOptions: { id: MediaCategory; label: string }[] = [
  { id: "illustrations", label: imageSpecsByCategory.illustrations.label },
  { id: "lore", label: imageSpecsByCategory.lore.label },
  { id: "banners", label: imageSpecsByCategory.banners.label },
  { id: "cms", label: imageSpecsByCategory.cms.label },
  { id: "events", label: imageSpecsByCategory.events.label },
  { id: "campaigns", label: imageSpecsByCategory.campaigns.label },
  { id: "community", label: imageSpecsByCategory.community.label },
  { id: "nft", label: imageSpecsByCategory.nft.label },
];
