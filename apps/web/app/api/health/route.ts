import { NextResponse } from "next/server";

export async function GET() {
  const base =
    process.env.API_INTERNAL_URL ?? process.env.KENBA_API_URL ?? "http://127.0.0.1:4000";

  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/health`, { cache: "no-store" });
    const data = (await res.json().catch(() => null)) as unknown;
    return NextResponse.json(
      { ok: res.ok, upstreamStatus: res.status, upstream: data },
      { status: res.ok ? 200 : 502 },
    );
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 502 });
  }
}
