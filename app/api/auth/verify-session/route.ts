import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/_lib/db";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { user_id, role } = await request.json();
    if (!user_id || !role) return NextResponse.json({ valid: false });

    const pool = await getPool();

    // Check users table
    let foundRole: string | null = null;
    const [userRows] = await pool.query(
      "SELECT id, role FROM users WHERE id = ? LIMIT 1",
      [user_id]
    ) as [{ id: string; role: string }[], unknown];

    if (userRows.length && userRows[0].role === role) {
      foundRole = userRows[0].role;
    }

    // Staff may live in the staff table instead
    if (!foundRole && role === "staff") {
      const [staffRows] = await pool.query(
        "SELECT id FROM staff WHERE id = ? AND status = 'active' LIMIT 1",
        [user_id]
      ) as [{ id: string }[], unknown];
      if (staffRows.length) foundRole = "staff";
    }

    if (!foundRole) return NextResponse.json({ valid: false });

    // Staff don't need a subscription check
    if (foundRole === "staff") {
      return NextResponse.json({ valid: true, payment_status: "active" });
    }

    // Admin — check active subscription first
  
    const [subRows] = await pool.query(
      "SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active' LIMIT 1",
      [user_id]
    ) as [{ id: string }[], unknown];

    if (subRows.length) {
      return NextResponse.json({ valid: true, payment_status: "active" });
    }

    // Fall back to checking for a completed M-Pesa transaction
    // (handles cases where subscription row wasn't created yet)
    const [txRows] = await pool.query(
      "SELECT id FROM mpesa_transactions WHERE user_id = ? AND status = 'completed' LIMIT 1",
      [user_id]
    ) as [{ id: string }[], unknown];

    const payment_status = txRows.length > 0 ? "active" : "unpaid";
    return NextResponse.json({ valid: true, payment_status });

  } catch (error) {
    console.error("[verify-session]", (error as Error).message);
    return NextResponse.json({ valid: true, payment_status: "active" });
  }
}