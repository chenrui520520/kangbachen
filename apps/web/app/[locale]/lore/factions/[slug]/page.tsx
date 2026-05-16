import { loreApi } from "@/lib/api-client";
import { markdownToHtml } from "@/lib/markdown";
import { LoreCard } from "@/components/lore/lore-card";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function FactionPage({ params }: Props) {
  const { locale, slug } = await params;
  const faction = await loreApi.faction(slug, locale).catch(() => null);
  if (!faction) notFound();

  const name = String(faction.name);
  const body = String(faction.body ?? "");
  const characters = (faction.characters as Array<Record<string, unknown>>) ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-12">
      <header>
        <p className="text-xs tracking-[0.35em] text-violet-400">FACTION</p>
        <h1 className="mt-2 text-4xl font-bold">{name}</h1>
        {faction.motto ? <p className="mt-2 italic text-muted-foreground">{String(faction.motto)}</p> : null}
      </header>
      <div className="rounded-xl border border-border/50 bg-card/50 p-8" dangerouslySetInnerHTML={{ __html: markdownToHtml(body) }} />
      {characters.length > 0 ? (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Champions</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {characters.map((c) => (
              <LoreCard
                key={String(c.id)}
                href={`/lore/characters/${String(c.slug)}`}
                name={String(c.name)}
                subtitle={c.title ? String(c.title) : undefined}
                rarity={String(c.rarity ?? "common")}
                imageUrl={c.imageUrl ? String(c.imageUrl) : null}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
