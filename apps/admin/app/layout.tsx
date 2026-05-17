import type { Metadata } from "next";
import "./globals.css";
import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { AdminProviders } from "@/components/admin-providers";
import { AdminShell } from "@/components/admin-shell";

export const metadata: Metadata = {
  title: "KENBA 后台",
  description: "KENBA 运营管理后台",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="dark">
      <body className="min-h-dvh antialiased">
        <AdminProviders>
          <AdminAuthGuard>
            <AdminShell>{children}</AdminShell>
          </AdminAuthGuard>
        </AdminProviders>
      </body>
    </html>
  );
}
