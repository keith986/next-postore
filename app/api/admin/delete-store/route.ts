import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/_lib/db";

/* ── DELETE /api/admin/delete-store?admin_id=xxx ──
   Nuclear option. Deletes in order:
     1. stock_movements  (references products)
     2. orders           (references customers)
     3. customers
     4. products
     5. staff            (references users via admin_id)
     6. settings row     (if exists)
     7. users            (the admin account itself)
── */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const admin_id = request.nextUrl.searchParams.get("admin_id");
    if (!admin_id)
      return NextResponse.json({ error: "admin_id is required" }, { status: 400 });

    const pool = await getPool();

    /* Verify the user exists before doing anything destructive */
    const [userRows] = await pool.query(
      "SELECT id FROM users WHERE id = ?",
      [admin_id]
    );

    if (!Array.isArray(userRows) || userRows.length === 0)
      return NextResponse.json({ error: "Admin account not found" }, { status: 404 });

    /* Delete in dependency order */
    await pool.query("DELETE FROM stock_movements WHERE admin_id = ?", [admin_id]);
    await pool.query("DELETE FROM orders WHERE admin_id = ?",           [admin_id]);
    await pool.query("DELETE FROM customers WHERE admin_id = ?",        [admin_id]);
    await pool.query("DELETE FROM products WHERE admin_id = ?",         [admin_id]);
    await pool.query("DELETE FROM staff WHERE admin_id = ?",            [admin_id]);

    /* settings table uses id = 1 (single-row) — only delete if it belongs to this admin */
    await pool.query(
      "DELETE FROM settings WHERE id = 1",
      []
    );

    /* Finally delete the admin user account */
    await pool.query("DELETE FROM users WHERE id = ?", [admin_id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}