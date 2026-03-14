import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/_lib/db";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const domain = request.nextUrl.searchParams.get("domain");

  if (!domain) {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 });
  }

  try {
    const pool = await getPool();
    const [rows] = await pool.query(
      "SELECT id FROM users WHERE domain = ? LIMIT 1",
      [domain]
    );

    const existing = rows as { id: string }[];

    return NextResponse.json({ taken: existing.length > 0 });

  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}