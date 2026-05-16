import { docsApi } from "@/lib/api-client";
import { DocViewer } from "@/components/docs/doc-viewer";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function RoadmapPage({ params }: Props) {
  const { locale } = await params;
  const items = await docsApi.list("roadmap", locale).catch(() => []);
  const slug = items.find((i) => i.slug === "phases")?.slug ?? items[0]?.slug ?? "phases";
  const article = await docsApi.article("roadmap", slug, locale).catch(() => null);
  if (!article) notFound();
  return <DocViewer title={article.title} body={article.body} />;
}
