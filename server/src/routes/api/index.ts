import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { authController } from "../../controllers/auth.controller.js";
import { oauthController } from "../../controllers/oauth.controller.js";
import { commerceController } from "../../controllers/commerce.controller.js";
import { engagementController } from "../../controllers/engagement.controller.js";
import { signinController } from "../../controllers/signin.controller.js";
import { adminController } from "../../controllers/admin.controller.js";
import { referralController } from "../../controllers/referral.controller.js";
import { cmsPublicController } from "../../controllers/cms.controller.js";
import { cmsAdminController } from "../../controllers/cms-admin.controller.js";
import { mediaAdminController } from "../../controllers/media-admin.controller.js";
import { contentAdminController } from "../../controllers/content-admin.controller.js";
import { analyticsController } from "../../controllers/analytics.controller.js";
import { adminAuthController } from "../../controllers/admin-auth.controller.js";
import { lorePublicController } from "../../controllers/lore.controller.js";
import { loreAdminController } from "../../controllers/lore-admin.controller.js";
import {
  campaignPublicController,
  docPublicController,
  profilePublicController,
  communityController,
  monitoringAdminController,
  docAdminController,
  campaignAdminController,
  eventPublicController,
  eventAdminController,
  communityAdminController,
} from "../../controllers/phase6.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { optionalAuth } from "../../middleware/optional-auth.middleware.js";
import {
  requireAdminAccess,
  requireAdminJwt,
  requireAdminPermission,
} from "../../middleware/admin-auth.middleware.js";

const authRateLimit = { max: 20, timeWindow: "1 minute" };
const claimRateLimit = { max: 10, timeWindow: "1 minute" };
const analyticsRateLimit = { max: 120, timeWindow: "1 minute" };

type Handler = (req: FastifyRequest, reply: FastifyReply) => Promise<unknown>;

function adminPre(perms: string[]) {
  return [requireAdminAccess, ...perms.map((p) => requireAdminPermission(p))];
}

export const apiV1Routes: FastifyPluginAsync = async (app) => {
  app.post("/login/wallet/nonce", { config: { rateLimit: authRateLimit } }, authController.walletNonce);
  app.post("/login/wallet", { config: { rateLimit: authRateLimit } }, authController.loginWallet);
  app.post("/login/email/request", { config: { rateLimit: authRateLimit } }, authController.emailRequest);
  app.post("/login/email/verify", { config: { rateLimit: authRateLimit } }, authController.emailVerify);
  app.post("/login/email", { config: { rateLimit: authRateLimit } }, authController.emailVerify);
  app.post("/login/twitter", { config: { rateLimit: authRateLimit } }, authController.loginTwitter);

  app.get("/auth/providers", oauthController.providers);
  app.get("/login/google", oauthController.googleStart);
  app.get("/login/google/callback", oauthController.googleCallback);
  app.get("/login/twitter", oauthController.twitterStart);
  app.get("/login/twitter/callback", oauthController.twitterCallback);
  app.post("/auth/oauth/complete", { config: { rateLimit: authRateLimit } }, oauthController.complete);

  app.post("/auth/refresh", { config: { rateLimit: authRateLimit } }, authController.refresh);
  app.post("/auth/logout", authController.logout);
  app.get("/auth/me", { preHandler: requireAuth }, authController.me);

  app.get("/signin/status", { preHandler: requireAuth }, signinController.status);
  app.post("/signin/claim", { preHandler: requireAuth, config: { rateLimit: claimRateLimit } }, signinController.claim);
  app.get("/signin/history", { preHandler: requireAuth }, signinController.history);
  app.post("/signin", { preHandler: requireAuth, config: { rateLimit: claimRateLimit } }, engagementController.signin);

  app.get("/rewards", { preHandler: requireAuth }, engagementController.rewards);
  app.get("/tasks", { preHandler: requireAuth }, engagementController.tasks);
  app.post("/tasks/complete", { preHandler: requireAuth }, engagementController.tasksComplete);
  app.get("/recommendations", { preHandler: requireAuth }, engagementController.recommendations);
  app.get("/leaderboard", { preHandler: requireAuth }, engagementController.leaderboard);
  app.get("/events", { preHandler: optionalAuth }, eventPublicController.list);
  app.get("/events/:slug", { preHandler: optionalAuth }, eventPublicController.get);
  app.post("/events/:slug/advance", { preHandler: requireAuth }, eventPublicController.advance);
  app.get("/shop", { preHandler: requireAuth }, commerceController.shop);
  app.post("/shop/purchase", { preHandler: requireAuth }, commerceController.shopPurchase);

  app.get("/referral/me", { preHandler: requireAuth }, referralController.me);
  app.post("/referral/bind", { preHandler: requireAuth }, referralController.bind);
  app.get("/referral/stats", { preHandler: requireAuth }, referralController.stats);

  app.get("/cms/bundle", cmsPublicController.bundle);
  app.get("/cms/pages/:slug", cmsPublicController.page);
  app.get("/cms/posts/:slug", cmsPublicController.post);

  app.post("/analytics/track", { config: { rateLimit: analyticsRateLimit } }, analyticsController.track);

  app.post("/admin/auth/login", { config: { rateLimit: authRateLimit } }, adminAuthController.login);
  app.get("/admin/auth/me", { preHandler: requireAdminJwt }, adminAuthController.me);
  app.post("/admin/auth/change-password", { preHandler: requireAdminJwt }, adminAuthController.changePassword);

  app.get("/admin/stats/users", { preHandler: adminPre(["analytics:read"]) }, adminController.userStats);
  app.get("/admin/analytics", { preHandler: adminPre(["analytics:read"]) }, analyticsController.dashboard);
  app.get("/admin/system/status", { preHandler: adminPre(["analytics:read"]) }, adminController.systemStatus);
  app.get("/admin/audit", { preHandler: adminPre(["analytics:read"]) }, adminController.auditLogs);

  app.get("/admin/users", { preHandler: adminPre(["users:read"]) }, adminController.listUsers);
  app.post("/admin/users/points", { preHandler: adminPre(["users:write"]) }, contentAdminController.adjustUserPoints);
  app.get("/admin/referrals", { preHandler: adminPre(["users:read"]) }, adminController.listReferrals);
  app.get("/admin/shop", { preHandler: adminPre(["cms:read"]) }, contentAdminController.listShop);
  app.post("/admin/shop", { preHandler: adminPre(["cms:write"]) }, contentAdminController.saveShop);
  app.get("/admin/tasks", { preHandler: adminPre(["cms:read"]) }, contentAdminController.listTasks);
  app.post("/admin/tasks", { preHandler: adminPre(["cms:write"]) }, contentAdminController.saveTask);
  app.get("/admin/nfts", { preHandler: adminPre(["cms:read"]) }, contentAdminController.listNfts);
  app.post("/admin/nfts", { preHandler: adminPre(["cms:write"]) }, contentAdminController.saveNft);
  app.get("/admin/content/overview", { preHandler: adminPre(["cms:read"]) }, contentAdminController.overview);
  app.get("/admin/signin-rewards", { preHandler: adminPre(["cms:read"]) }, contentAdminController.listSignInRewards);
  app.post("/admin/signin-rewards", { preHandler: adminPre(["cms:write"]) }, contentAdminController.saveSignInReward);

  app.get("/admin/export/rewards", { preHandler: requireAdminAccess }, adminController.exportRewards);
  app.get("/admin/export/leaderboard", { preHandler: requireAdminAccess }, adminController.exportLeaderboard);
  app.get("/admin/export/points", { preHandler: requireAdminAccess }, adminController.exportPoints);
  app.get("/admin/export/referrals", { preHandler: requireAdminAccess }, adminController.exportReferrals);

  app.get("/admin/cms/pages", { preHandler: adminPre(["cms:read"]) }, cmsAdminController.listPages);
  app.post("/admin/cms/pages", { preHandler: adminPre(["cms:write"]) }, cmsAdminController.savePage);
  app.get("/admin/cms/posts", { preHandler: adminPre(["cms:read"]) }, cmsAdminController.listPosts);
  app.post("/admin/cms/posts", { preHandler: adminPre(["cms:write"]) }, cmsAdminController.savePost);
  app.get("/admin/cms/banners", { preHandler: adminPre(["cms:read"]) }, cmsAdminController.listBanners);
  app.post("/admin/cms/banners", { preHandler: adminPre(["cms:write"]) }, cmsAdminController.saveBanner);
  app.get("/admin/cms/faq", { preHandler: adminPre(["cms:read"]) }, cmsAdminController.listFaqs);
  app.post("/admin/cms/faq", { preHandler: adminPre(["cms:write"]) }, cmsAdminController.saveFaq);
  app.get("/admin/cms/announcements", { preHandler: adminPre(["cms:read"]) }, cmsAdminController.listAnnouncements);
  app.post("/admin/cms/announcements", { preHandler: adminPre(["cms:write"]) }, cmsAdminController.saveAnnouncement);
  app.delete("/admin/cms/:kind/:id", { preHandler: adminPre(["cms:write"]) }, cmsAdminController.delete);

  app.get("/admin/media", { preHandler: adminPre(["cms:read"]) }, mediaAdminController.list);
  app.post("/admin/media/upload", { preHandler: adminPre(["cms:write"]) }, mediaAdminController.upload);

  app.get("/lore/world", lorePublicController.world);
  app.get("/lore/regions/:slug", lorePublicController.region);
  app.get("/lore/factions/:slug", lorePublicController.faction);
  app.get("/lore/characters", lorePublicController.characters);
  app.get("/lore/characters/:slug", lorePublicController.character);
  app.get("/lore/creatures", lorePublicController.creatures);
  app.get("/lore/artifacts", lorePublicController.artifacts);
  app.get("/lore/timeline", lorePublicController.timeline);

  app.get("/docs/search", docPublicController.search);
  app.get("/docs/:category", docPublicController.list);
  app.get("/docs/:category/:slug", docPublicController.article);

  app.get("/campaigns", campaignPublicController.list);
  app.get("/campaigns/:slug", campaignPublicController.get);
  app.post("/campaigns/:slug/advance", { preHandler: requireAuth }, campaignPublicController.advance);

  app.get("/profile/:id", profilePublicController.get);
  app.get("/community/me", { preHandler: requireAuth }, communityController.me);
  app.post("/community/invite", { preHandler: requireAuth }, communityController.invite);

  app.get("/admin/lore/factions", { preHandler: adminPre(["cms:read"]) }, loreAdminController.listFactions);
  app.post("/admin/lore/factions", { preHandler: adminPre(["cms:write"]) }, loreAdminController.saveFaction);
  app.get("/admin/lore/characters", { preHandler: adminPre(["cms:read"]) }, loreAdminController.listCharacters);
  app.post("/admin/lore/characters", { preHandler: adminPre(["cms:write"]) }, loreAdminController.saveCharacter);
  app.get("/admin/lore/timeline", { preHandler: adminPre(["cms:read"]) }, loreAdminController.listTimeline);
  app.post("/admin/lore/timeline", { preHandler: adminPre(["cms:write"]) }, loreAdminController.saveTimeline);
  app.delete("/admin/lore/:kind/:id", { preHandler: adminPre(["cms:write"]) }, loreAdminController.delete);

  app.get("/admin/docs", { preHandler: adminPre(["cms:read"]) }, docAdminController.list);
  app.post("/admin/docs", { preHandler: adminPre(["cms:write"]) }, docAdminController.save);
  app.delete("/admin/docs/:id", { preHandler: adminPre(["cms:write"]) }, docAdminController.delete);

  app.get("/admin/campaigns", { preHandler: adminPre(["cms:read"]) }, campaignAdminController.list);
  app.post("/admin/campaigns", { preHandler: adminPre(["cms:write"]) }, campaignAdminController.saveCampaign);
  app.post("/admin/campaigns/quests", { preHandler: adminPre(["cms:write"]) }, campaignAdminController.saveQuest);

  app.get("/admin/events/export", { preHandler: adminPre(["analytics:read"]) }, eventAdminController.exportStats);
  app.get("/admin/events", { preHandler: adminPre(["cms:read"]) }, eventAdminController.list);
  app.post("/admin/events", { preHandler: adminPre(["cms:write"]) }, eventAdminController.saveEvent);
  app.post("/admin/events/tasks", { preHandler: adminPre(["cms:write"]) }, eventAdminController.saveTask);
  app.post("/admin/events/rewards", { preHandler: adminPre(["cms:write"]) }, eventAdminController.saveReward);
  app.get("/admin/community", { preHandler: adminPre(["users:read"]) }, communityAdminController.overview);
  app.post("/admin/community/badges", { preHandler: adminPre(["cms:write"]) }, communityAdminController.saveBadge);

  app.get("/admin/monitoring", { preHandler: adminPre(["analytics:read"]) }, monitoringAdminController.dashboard);
};
