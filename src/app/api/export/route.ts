import { NextResponse } from "next/server";
import { locationHistory } from "@/lib/statistics";
import { locationHistoryToCsv } from "@/lib/csv";

export async function GET() {
  const rows = locationHistory();
  const csv = locationHistoryToCsv(rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tieu_doi_sat_thu_dia_diem.csv"`,
    },
  });
}
