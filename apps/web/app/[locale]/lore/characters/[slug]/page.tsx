import { loreApi } from "@/lib/api-client";
import { markdownToHtml } from "@/lib/markdown";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function CharacterDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const c = await loreApi.character(slug, locale).catch(() => null);
  if (!c) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-xs uppercase tracking-widest text-violet-400">{String(c.rarity)}</p>
      <h1 className="mt-2 text-4xl font-bold">{String(c.name)}</h1>
      {c.title ? <p className="text-lg text-muted-foreground">{String(c.title)}</p> : null}
      <div className="mt-8 rounded-xl border border-border/50 bg-card/50 p-8" dangerouslySetInnerHTML={{ __html: markdownToHtml(String(c.body)) }} />
    </div>
  );
}
