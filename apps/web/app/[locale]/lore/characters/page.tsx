import { loreApi } from "@/lib/api-client";
import { LoreCard } from "@/components/lore/lore-card";

type Props = { params: Promise<{ locale: string }> };

export default async function CharactersPage({ params }: Props) {
  const { locale } = await params;
  const characters = await loreApi.characters(locale).catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold">Characters</h1>
      <p className="mt-2 text-muted-foreground">Heroes and villains of the blood moon.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}
