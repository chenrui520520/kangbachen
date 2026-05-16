import { docsApi } from "@/lib/api-client";
import { markdownToHtml } from "@/lib/markdown";

type Props = { params: Promise<{ locale: string }> };

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  const items = await docsApi.list("faq", locale).catch(() => []);
  const articles = await Promise.all(
    items.map((item) => docsApi.article("faq", item.slug, locale).catch(() => null)),
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">FAQ</h1>
      <div className="mt-8 space-y-6">
        {items.map((item, i) => (
          <details key={item.id} className="rounded-lg border border-border/60 bg-card/40 p-4">
            <summary className="cursor-pointer font-medium">{item.title}</summary>
            <div
              className="mt-3 text-sm text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(articles[i]?.body ?? "") }}
            />
          </details>
        ))}
      </div>
    </div>
  );
}
