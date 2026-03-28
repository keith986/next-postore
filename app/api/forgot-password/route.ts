import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/_lib/db";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/app/_lib/mailer";
import { RowDataPacket } from "mysql2";

interface UserRow extends RowDataPacket {
  id:         string;
  store_name: string | null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { email } = await request.json();
  if (!email)
    return NextResponse.json({ error: "Email is required" }, { status: 400 });

  try {
    const pool = await getPool();
    const [rows] = await pool.query<UserRow[]>(
      "SELECT id, store_name FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    // Always return success to prevent email enumeration
    if (!rows || rows.length === 0)
      return NextResponse.json({ success: true });

    const token   = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      `INSERT INTO password_resets (user_id, token, expires_at)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)`,
      [rows[0].id, token, expires]
    );

    const resetUrl = `https://pos.upendoapps.com/reset-password?token=${token}`;

    await sendPasswordResetEmail(email, resetUrl, rows[0].store_name ?? undefined);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}