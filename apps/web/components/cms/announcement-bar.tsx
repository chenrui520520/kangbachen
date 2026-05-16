"use client";

import { useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { cmsApi } from "@/lib/api-client";

export function AnnouncementBar() {
  const locale = useLocale();
  const { data } = useQuery({
    queryKey: ["cms", "bundle", locale],
    queryFn: () => cmsApi.bundle(locale),
    staleTime: 60_000,
  });

  const msg = data?.announcements?.[0];
  if (!msg) return null;

  return (
    <div className="border-b border-primary/20 bg-primary/10 px-4 py-2 text-center text-sm text-primary">
      {msg.linkUrl ? (
        <Link href={msg.linkUrl} className="hover:underline">
          {msg.message}
        </Link>
      ) : (
        msg.message
      )}
    </div>
  );
}
