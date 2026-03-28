import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/_lib/db";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return NextResponse.json({ valid: false });

  try {
    const pool = await getPool();
    const [rows] = await pool.query(
      "SELECT id FROM password_resets WHERE token = ? AND expires_at > NOW() LIMIT 1",
      [token]
    ) as [{ id: number }[], unknown];

    return NextResponse.json({ valid: rows.length > 0 });
  } catch {
    return NextResponse.json({ valid: false });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { token, password } = await request.json();
  if (!token || !password)
    return NextResponse.json({ error: "Token and password are required" }, { status: 400 });

  try {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT pr.user_id FROM password_resets pr
       WHERE pr.token = ? AND pr.expires_at > NOW() LIMIT 1`,
      [token]
    ) as [{ user_id: string }[], unknown];

    if (!rows || rows.length === 0)
      return NextResponse.json({ error: "Reset link is invalid or expired" }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashed, rows[0].user_id]);
    await pool.query("DELETE FROM password_resets WHERE token = ?", [token]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}