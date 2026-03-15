import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/_lib/db";
import { randomUUID } from "crypto";

/* ── GET /api/orders?admin_id=xxx ── */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const admin_id = request.nextUrl.searchParams.get("admin_id");
    if (!admin_id)
      return NextResponse.json({ error: "admin_id is required" }, { status: 400 });

    const pool = await getPool();

    const [rows] = await pool.query(
      `SELECT * FROM orders WHERE admin_id = ? ORDER BY created_at DESC`,
      [admin_id]
    );

    /* Parse items JSON for each order */
    const orders = (rows as Record<string, unknown>[]).map(o => ({
      ...o,
      items: typeof o.items === "string" ? JSON.parse(o.items) : o.items ?? [],
    }));

    return NextResponse.json(orders);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ── POST /api/orders — create a new order ── */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const {
      customer_id, customer_name, customer_email,
      items, subtotal, tax, total,
      payment_method, payment_status,
      staff_name, note, admin_id,
    } = await request.json();

    if (!customer_name || !items || !total || !admin_id)
      return NextResponse.json({ error: "customer_name, items, total and admin_id are required" }, { status: 400 });

    const pool         = await getPool();
    const id           = randomUUID();
    const order_number = `ORD-${Date.now().toString().slice(-6)}`;

    await pool.query(
      `INSERT INTO orders
         (id, order_number, customer_id, customer_name, customer_email,
          items, subtotal, tax, total,
          status, payment_method, payment_status,
          staff_name, note, admin_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)`,
      [
        id, order_number,
        customer_id ?? null, customer_name, customer_email ?? "",
        JSON.stringify(items), subtotal ?? 0, tax ?? 0, total,
        payment_method ?? "cash", payment_status ?? "paid",
        staff_name ?? null, note ?? null, admin_id,
      ]
    );

    return NextResponse.json({ success: true, id, order_number });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}