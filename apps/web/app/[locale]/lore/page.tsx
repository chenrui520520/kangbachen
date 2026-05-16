import { loreApi } from "@/lib/api-client";
import { LoreCard } from "@/components/lore/lore-card";
import { LoreAtmosphere } from "@/components/lore/lore-atmosphere";
import { Link } from "@/i18n/navigation";
import { Button } from "@kangba/ui";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function LoreHubPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("lore");
  const world = await loreApi.world(locale).catch(() => ({
    factions: [],
    regions: [],
    timeline: [],
  }));

  return (
    <LoreAtmosphere>
      <div className="relative min-h-[80vh] overflow-hidden">
        <div className="relative mx-auto max-w-6xl space-y-12 px-6 py-16">
          <header className="text-center">
            <p className="text-xs font-semibold tracking-[0.4em] text-violet-400">{t("eyebrow")}</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">{t("title")}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{t("subtitle")}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild variant="secondary">
                <Link href="/lore/timeline">{t("timeline")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/lore/characters">{t("characters")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/lore/creatures">{t("creaturesTitle")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/campaigns">{t("campaigns")}</Link>
              </Button>
            </div>
          </header>

          <section>
            <h2 className="mb-6 text-xl font-semibold">{t("factionsTitle")}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {world.factions.map((f) => (
                <LoreCard
                  key={f.id}
                  href={`/lore/factions/${f.slug}`}
                  name={f.name}
                  subtitle={f.tagline ?? undefined}
                  theme={f.colorTheme}
                />
              ))}
            </div>
          </section>

          {world.regions.length > 0 ? (
            <section>
              <h2 className="mb-4 text-xl font-semibold">{t("mapTitle")}</h2>
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-zinc-950 via-violet-950/30 to-black">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(88,28,135,0.15),transparent)] opacity-40" />
                {world.regions.map((r) => (
                  <Link
                    key={r.id}
                    href={`/lore/regions/${r.slug}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-500/50 bg-black/70 px-3 py-1 text-xs font-medium backdrop-blur transition hover:border-amber-500/60 hover:shadow-[0_0_16px_rgba(139,92,246,0.4)]"
                    style={{ left: `${r.mapX}%`, top: `${r.mapY}%` }}
                  >
                    {r.name}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </LoreAtmosphere>
  );
}
