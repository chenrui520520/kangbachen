"use client";

import { Button } from "@kangba/ui";

export function ProfileShare({ userId }: { userId: string }) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}`
      : `/profile/${userId}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={() => void copy()}>
      Copy profile link
    </Button>
  );
}
