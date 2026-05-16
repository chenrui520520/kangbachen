import { loreApi } from "@/lib/api-client";
import { markdownToHtml } from "@/lib/markdown";
import { LoreAtmosphere } from "@/components/lore/lore-atmosphere";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function RegionPage({ params }: Props) {
  const { locale, slug } = await params;
  const region = await loreApi.region(slug, locale).catch(() => null);
  if (!region) notFound();

  const faction = region.faction as { name?: string } | null;

  return (
    <LoreAtmosphere>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs tracking-widest text-violet-400">REGION</p>
        <h1 className="mt-2 text-4xl font-bold">{String(region.name)}</h1>
        {faction?.name ? <p className="text-muted-foreground">{faction.name}</p> : null}
        <div
          className="mt-8 rounded-xl border border-border/50 bg-card/50 p-8"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(String(region.body)) }}
        />
      </div>
    </LoreAtmosphere>
  );
}
