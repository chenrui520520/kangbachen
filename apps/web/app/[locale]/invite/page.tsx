import { getTranslations } from "next-intl/server";
import { AuthGate } from "@/components/engagement/auth-gate";
import { InvitePanel } from "@/components/referral/invite-panel";

type Props = {
  searchParams: Promise<{ ref?: string }>;
};

export default async function InvitePage({ searchParams }: Props) {
  const t = await getTranslations("referral");
  const { ref } = await searchParams;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>
      <AuthGate>
        <InvitePanel initialRef={ref} />
      </AuthGate>
    </div>
  );
}
