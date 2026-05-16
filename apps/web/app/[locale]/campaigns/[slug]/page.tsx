import { campaignApi } from "@/lib/api-client";
import { CampaignDetail } from "@/components/campaigns/campaign-detail";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function CampaignPage({ params }: Props) {
  const { locale, slug } = await params;
  const data = await campaignApi.get(slug, locale).catch(() => null);
  if (!data?.campaign) notFound();
  return <CampaignDetail campaign={data.campaign} progress={data.progress as Array<{ questId: string; progress: number; completed: boolean }>} slug={slug} locale={locale} />;
}
