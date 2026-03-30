import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/_lib/db";

/* ── POST /api/auth/verify-session
   Body: { user_id: string, role: string }
   Called by login page and admin layout before allowing access.
   Returns:
     { valid: false }                          → session is forged / user doesn't exist
     { valid: true, payment_status: "unpaid" } → user exists but hasn't paid
     { valid: true, payment_status: "active" } → all clear
── */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { user_id, role } = await request.json();

    if (!user_id || !role)
      return NextResponse.json({ valid: false });

    const pool = await getPool();

    /* Check user exists and get their role */
    const [userRows] = await pool.query(
      "SELECT id, role FROM users WHERE id = ? LIMIT 1",
      [user_id]
    ) as [{ id: string; role: string }[], unknown];

    /* User not found or role tampered */
    if (!userRows.length || userRows[0].role !== role)
      return NextResponse.json({ valid: false });

    /* Staff don't need subscription check */
    if (role === "staff")
      return NextResponse.json({ valid: true, payment_status: "active" });

    /* Admin — check subscription */
    const [subRows] = await pool.query(
      `SELECT status FROM mpesa_transactions
       WHERE user_id = ? AND status = 'completed'
       LIMIT 1`,
      [user_id]
    ) as [{ status: string }[], unknown];

    const payment_status = subRows.length > 0 ? "completed" : "unpaid";

    return NextResponse.json({ valid: true, payment_status });

  } catch (error) {
    console.error("[verify-session]", (error as Error).message);
    /* On DB error, allow through to avoid locking out users */
    return NextResponse.json({ valid: true, payment_status: "active" });
  }
}