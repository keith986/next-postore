import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/_lib/db";
import { RowDataPacket } from "mysql2";

interface UserRow extends RowDataPacket {
  subdomain_status: string | null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const subdomain = new URL(request.url).searchParams.get("subdomain");
  if (!subdomain) return NextResponse.json({ status: "inactive" });

  try {
    const pool = await getPool();
    const [rows] = await pool.query<UserRow[]>(
      "SELECT subdomain_status FROM users WHERE domain = ? LIMIT 1",
      [subdomain]
    );

    if (!rows || rows.length === 0)
      return NextResponse.json({ status: "inactive" });

    return NextResponse.json({ status: rows[0].subdomain_status ?? "inactive" });
  } catch {
    return NextResponse.json({ status: "active" }); // fail open
  }
}