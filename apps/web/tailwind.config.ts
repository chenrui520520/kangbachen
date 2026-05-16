import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import kangbaPreset from "../../packages/ui/tailwind-preset";

const config = {
  presets: [kangbaPreset],
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  plugins: [tailwindcssAnimate],
} satisfies Config;

export default config;
