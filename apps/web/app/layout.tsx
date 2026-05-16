import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://kangba.local"),
  title: {
    default: "KangBa — Dark Fantasy Web3 Realm",
    template: "%s · KangBa",
  },
  description:
    "Enter the KangBa realm: cinematic Web3 gaming hub with daily rewards, tasks, events, and mock NFT collectibles.",
  keywords: ["Web3", "game", "NFT", "dark fantasy", "KangBa", "rewards"],
  openGraph: {
    title: "KangBa — Dark Fantasy Web3 Realm",
    description: "Cinematic Web3 game hub with rewards, events, and collectible progression.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "KangBa",
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
