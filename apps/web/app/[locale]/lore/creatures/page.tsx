import { loreApi } from "@/lib/api-client";
import { LoreCard } from "@/components/lore/lore-card";
import { LoreAtmosphere } from "@/components/lore/lore-atmosphere";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function CreaturesPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("lore");
  const creatures = await loreApi.creatures(locale).catch(() => []);

  return (
    <LoreAtmosphere>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold">{t("creaturesTitle")}</h1>
        <p className="mt-2 text-muted-foreground">{t("creaturesSubtitle")}</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {creatures.map((c) => (
            <LoreCard
              key={String(c.id)}
              href={`/lore/regions/${String((c as { region?: { slug?: string } }).region?.slug ?? "blackveil-marshes")}`}
              name={String(c.name)}
              rarity={String(c.rarity ?? "common")}
              imageUrl={c.imageUrl ? String(c.imageUrl) : null}
            />
          ))}
        </div>
      </div>
    </LoreAtmosphere>
  );
}
