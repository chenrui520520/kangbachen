import { docsApi } from "@/lib/api-client";
import { DocViewer } from "@/components/docs/doc-viewer";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function TokenomicsPage({ params }: Props) {
  const { locale } = await params;
  const items = await docsApi.list("tokenomics", locale).catch(() => []);
  const slug = items.find((i) => i.slug === "economy")?.slug ?? items[0]?.slug ?? "economy";
  const article = await docsApi.article("tokenomics", slug, locale).catch(() => null);
  if (!article) notFound();
  return <DocViewer title={article.title} body={article.body} />;
}
