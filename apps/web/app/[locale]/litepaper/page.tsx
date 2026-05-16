import { docsApi } from "@/lib/api-client";
import { Link } from "@/i18n/navigation";
import { redirect } from "next/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function LitepaperPage({ params }: Props) {
  const { locale } = await params;
  const items = await docsApi.list("litepaper", locale).catch(() => []);
  const first = items[0];
  if (first) redirect(`/${locale}/litepaper/${first.slug}` as `/${string}`);
  return (
    <div className="px-6 py-12 text-center text-muted-foreground">
      No litepaper published yet. <Link href="/docs">Browse docs</Link>
    </div>
  );
}
