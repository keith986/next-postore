import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/_lib/db";
import { RowDataPacket } from "mysql2";

interface SubRow extends RowDataPacket {
  status:            string;
  plan:              string;
  next_billing_date: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const user_id  = searchParams.get("user_id");
  const admin_id = searchParams.get("admin_id");
  const id       = user_id ?? admin_id;

  if (!id) return NextResponse.json({ active: false });

  try {
    const pool = await getPool();
    const [rows] = await pool.query<SubRow[]>(
      "SELECT status, plan, next_billing_date FROM subscriptions WHERE user_id = ? LIMIT 1",
      [id]
    );

    if (!rows.length)
      return NextResponse.json({ active: false });

    return NextResponse.json({
      active:            rows[0].status === "active",
      status:            rows[0].status,
      plan:              rows[0].plan,
      next_billing_date: rows[0].next_billing_date,
    });
  } catch (error) {
    return NextResponse.json({ active: false, error: (error as Error).message });
  }
}