import { redirect } from "next/navigation";

type Props = { params: Promise<{ locale: string }> };

/** Legacy campaign slug → current Hollow King awakening. */
export default async function ShadowAwakeningRedirect({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/campaigns/hollow-king-awakening`);
}
