import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/_lib/db";
import { RowDataPacket } from "mysql2";

interface SubRow extends RowDataPacket {
  status: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {

  const key = request.headers.get('x-internal-key');
  if (key !== (process.env.INTERNAL_API_KEY || 'internal'))
  return NextResponse.json({ active: false }, { status: 401 });

  const domain = new URL(request.url).searchParams.get("domain");
  if (!domain) return NextResponse.json({ active: false });

  try {
    const pool = await getPool();
    const [rows] = await pool.query<SubRow[]>(
      `SELECT s.status FROM subscriptions s
       JOIN users u ON s.user_id = u.id
       WHERE u.domain = ? AND s.status = 'active' LIMIT 1`,
      [domain]
    );
    return NextResponse.json({ active: rows.length > 0 });
  } catch {
    return NextResponse.json({ active: true }); // fail open
  }
}