import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "zh", "ko", "ja", "ar"],
  defaultLocale: "en",
  localePrefix: "always",
});
