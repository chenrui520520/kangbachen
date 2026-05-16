/** Lightweight markdown → HTML (no external deps). */
export function markdownToHtml(md: string): string {
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  html = html.replace(/^### (.+)$/gm, (_, t: string) => {
    const id = slugify(t);
    return `<h3 id="${id}" class="mt-8 text-lg font-semibold scroll-mt-24">${t}</h3>`;
  });
  html = html.replace(/^## (.+)$/gm, (_, t: string) => {
    const id = slugify(t);
    return `<h2 id="${id}" class="mt-10 text-xl font-semibold scroll-mt-24">${t}</h2>`;
  });
  html = html.replace(/^# (.+)$/gm, (_, t: string) => {
    const id = slugify(t);
    return `<h1 id="${id}" class="text-3xl font-bold scroll-mt-24">${t}</h1>`;
  });
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/`(.+?)`/g, '<code class="rounded bg-muted px-1">$1</code>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-violet-400 underline">$1</a>');
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul class="my-4 list-disc space-y-1 pl-6">${m}</ul>`);
  const blocks = html.split(/\n\n+/).map((b) =>
    b.startsWith("<h") || b.startsWith("<ul") ? b : `<p class="my-4 leading-relaxed text-muted-foreground">${b}</p>`,
  );
  return blocks.join("\n");
}
