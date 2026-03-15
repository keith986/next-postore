import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/_lib/db";

const VALID_STATUSES = ["pending", "processing", "completed", "refunded", "cancelled"];

/* ── PUT /api/orders/[id]/status ── */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id }               = await params;
    const { status, admin_id } = await request.json();

    if (!VALID_STATUSES.includes(status))
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    if (!admin_id)
      return NextResponse.json({ error: "admin_id is required" }, { status: 400 });

    const pool = await getPool();

    /* Verify ownership */
    const [check] = await pool.query(
      "SELECT id, status FROM orders WHERE id = ? AND admin_id = ?",
      [id, admin_id]
    ) as [{ id: string; status: string }[], unknown];

    if ((check as { id: string }[]).length === 0)
      return NextResponse.json({ error: "Order not found or access denied" }, { status: 403 });

    /* Update order status */
    await pool.query(
      "UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?",
      [status, id]
    );

    /* If refunded, update payment_status too */
    if (status === "refunded") {
      await pool.query(
        "UPDATE orders SET payment_status = 'refunded' WHERE id = ?",
        [id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}