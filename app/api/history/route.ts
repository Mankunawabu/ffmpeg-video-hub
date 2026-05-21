import { NextResponse } from "next/server";
import { getHistoryStats, readHistory } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const records = await readHistory();
  const selected = id ? records.find((record) => record.id === id) ?? null : records[0] ?? null;
  const stats = await getHistoryStats(records);

  return NextResponse.json({ ok: true, records, selected, stats });
}
