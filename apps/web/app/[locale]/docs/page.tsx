import { docsApi } from "@/lib/api-client";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function DocsIndexPage({ params }: Props) {
  const { locale } = await params;
  const items = await docsApi.list("docs", locale).catch(() => []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">Documentation</h1>
      <ul className="mt-8 space-y-3">
        {items.map((d) => (
          <li key={d.id}>
            <Link href={`/docs/${d.slug}`} className="text-lg text-violet-400 hover:underline">
              {d.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
