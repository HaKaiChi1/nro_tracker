import { NextResponse } from "next/server";
import { playerTimeline } from "@/lib/statistics";
import { getSelectedServer } from "@/lib/server-selection";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const playerName = decodeURIComponent(name);
  const server = await getSelectedServer();
  const rows = playerTimeline(playerName, server);

  return NextResponse.json({
    rows: rows.map((row) => ({ id: row.id, time: row.time, value: row.value })),
  });
}
