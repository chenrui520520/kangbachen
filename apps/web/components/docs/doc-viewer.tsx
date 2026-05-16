"use client";

import { useMemo } from "react";
import { markdownToHtml } from "@/lib/markdown";

export function DocViewer({ body, title }: { body: string; title: string }) {
  const html = useMemo(() => markdownToHtml(body), [body]);
  const headings = useMemo(() => {
    const matches = body.match(/^#{1,3} (.+)$/gm) ?? [];
    return matches.map((line) => {
      const text = line.replace(/^#+\s*/, "");
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return { text, id, level: line.startsWith("###") ? 3 : line.startsWith("##") ? 2 : 1 };
    });
  }, [body]);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[220px_1fr]">
      <aside className="hidden lg:block">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground">CONTENTS</p>
        <nav className="mt-4 space-y-2 text-sm">
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              className="block text-muted-foreground hover:text-foreground"
              style={{ paddingLeft: (h.level - 1) * 12 }}
            >
              {h.text}
            </a>
          ))}
        </nav>
      </aside>
      <article>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <div className="mt-8" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </div>
  );
}
