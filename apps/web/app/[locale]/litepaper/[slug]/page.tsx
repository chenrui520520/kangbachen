import { docsApi } from "@/lib/api-client";
import { DocViewer } from "@/components/docs/doc-viewer";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function LitepaperArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  const article = await docsApi.article("litepaper", slug, locale).catch(() => null);
  if (!article) notFound();
  return <DocViewer title={article.title} body={article.body} />;
}
