import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { routing } from "./i18n/routing";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** Legacy slugs — use config redirects (page-level redirect() breaks SSG for some locales). */
function legacyCampaignRedirects() {
  return routing.locales.map((locale) => ({
    source: `/${locale}/campaigns/shadow-awakening`,
    destination: `/${locale}/campaigns/hollow-king-awakening`,
    permanent: true,
  }));
}

/** Retired litepaper routes → home. */
function retiredLitepaperRedirects() {
  return routing.locales.flatMap((locale) => [
    {
      source: `/${locale}/litepaper`,
      destination: `/${locale}`,
      permanent: true,
    },
    {
      source: `/${locale}/litepaper/:slug`,
      destination: `/${locale}`,
      permanent: true,
    },
  ]);
}

const nextConfig: NextConfig = {
  transpilePackages: ["@kenba/utils", "@kenba/ui"],
  async redirects() {
    return [...legacyCampaignRedirects(), ...retiredLitepaperRedirects()];
  },
  // @metamask/sdk (via RainbowKit metaMaskWallet) optionally imports RN storage — not used on web.
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": false,
    };
    return config;
  },
};

export default withNextIntl(nextConfig);
