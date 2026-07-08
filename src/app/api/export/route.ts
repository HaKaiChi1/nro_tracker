import { NextResponse } from "next/server";
import { allRowsForExport } from "@/lib/statistics";
import { toCsv } from "@/lib/csv";
import { getSelectedServer } from "@/lib/server-selection";

export async function GET() {
  const server = await getSelectedServer();
  const rows = allRowsForExport(server);
  const csv = toCsv(rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nro_notifications.csv"`,
    },
  });
}
