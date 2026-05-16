import { profileApi } from "@/lib/api-client";
import { ProfileCard } from "@/components/profile/profile-card";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;
  const profile = await profileApi.get(id).catch(() => null);
  if (!profile) notFound();
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <ProfileCard profile={profile} />
    </div>
  );
}
