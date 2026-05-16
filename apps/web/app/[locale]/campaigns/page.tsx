import { campaignApi } from "@/lib/api-client";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function CampaignsPage({ params }: Props) {
  const { locale } = await params;
  const campaigns = await campaignApi.list(locale).catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold">Campaigns</h1>
      <p className="mt-2 text-muted-foreground">Limited-time chronicles with exclusive rewards.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {campaigns.map((c) => {
          const ends = new Date(c.endsAt);
          const daysLeft = Math.max(0, Math.ceil((ends.getTime() - Date.now()) / 86400000));
          return (
            <Link
              key={c.id}
              href={`/campaigns/${c.slug}`}
              className="group overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card to-violet-950/20 p-6 transition hover:border-violet-500/40"
            >
              {c.featured ? (
                <span className="text-xs font-semibold tracking-widest text-violet-400">FEATURED</span>
              ) : null}
              <h2 className="mt-2 text-xl font-semibold group-hover:text-violet-300">{c.name}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
              <p className="mt-4 text-xs text-violet-400">{daysLeft} days remaining</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
