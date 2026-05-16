import type { Metadata } from "next";
import "./globals.css";
import { AdminProviders } from "@/components/admin-providers";
import { AdminShell } from "@/components/admin-shell";

export const metadata: Metadata = {
  title: "康巴后台",
  description: "KangBa 运营管理后台",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="dark">
      <body className="min-h-dvh antialiased">
        <AdminProviders>
          <AdminShell>{children}</AdminShell>
        </AdminProviders>
      </body>
    </html>
  );
}
