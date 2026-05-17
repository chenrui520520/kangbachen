import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://KENBA.local"),
  title: {
    default: "KENBA — Dark Fantasy Web3 Realm",
    template: "%s · KENBA",
  },
  description:
    "Enter the KENBA realm: cinematic Web3 gaming hub with daily rewards, tasks, events, and mock NFT collectibles.",
  keywords: ["Web3", "game", "NFT", "dark fantasy", "KENBA", "rewards"],
  openGraph: {
    title: "KENBA — Dark Fantasy Web3 Realm",
    description: "Cinematic Web3 game hub with rewards, events, and collectible progression.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "KENBA",
    description: "Dark fantasy Web3 game hub.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="min-h-dvh bg-background font-sans antialiased">{children}</body>
    </html>
  );
}
