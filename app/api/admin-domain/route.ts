import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/_lib/db";
import { RowDataPacket } from "mysql2";

interface UserRow extends RowDataPacket {
  domain: string | null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const admin_id = searchParams.get("admin_id");

  if (!admin_id)
    return NextResponse.json({ error: "admin_id is required" }, { status: 400 });

  try {
    const pool = await getPool();
    const [rows] = await pool.query<UserRow[]>(
      "SELECT domain FROM users WHERE id = ? AND role = 'admin' LIMIT 1",
      [admin_id]
    );

    if (!rows || rows.length === 0)
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    return NextResponse.json({ domain: rows[0].domain });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}