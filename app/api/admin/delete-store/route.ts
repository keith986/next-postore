import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/_lib/db";
import { exec } from "child_process";
import { promisify } from "util";
import { RowDataPacket } from "mysql2";

const execAsync = promisify(exec);

interface UserRow extends RowDataPacket {
  id:     string;
  domain: string | null;
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const admin_id = request.nextUrl.searchParams.get("admin_id");
    if (!admin_id)
      return NextResponse.json({ error: "admin_id is required" }, { status: 400 });

    const pool = await getPool();

    // Verify the user exists and get their domain
    const [userRows] = await pool.query<UserRow[]>(
      "SELECT id, domain FROM users WHERE id = ? LIMIT 1",
      [admin_id]
    );

    if (!userRows || userRows.length === 0)
      return NextResponse.json({ error: "Admin account not found" }, { status: 404 });

    const domain = userRows[0].domain;

    // ── Remove subdomain from server ──
    if (domain) {
      try {
        const { stdout } = await execAsync(
          `sudo /usr/local/bin/remove-subdomain.sh ${domain}`
        );
        console.log(`[Delete Store] Subdomain removal: ${stdout}`);
      } catch (e) {
        console.warn(`[Delete Store] Subdomain removal failed for "${domain}":`, e);
        // Continue anyway — still delete the account
      }
    }

    // ── Delete in dependency order ──
    await pool.query("DELETE FROM stock_movements   WHERE admin_id = ?", [admin_id]);
    await pool.query("DELETE FROM mpesa_transactions WHERE user_id = ?", [admin_id]);
    await pool.query("DELETE FROM subscriptions      WHERE user_id = ?", [admin_id]);
    await pool.query("DELETE FROM password_resets    WHERE user_id = ?", [admin_id]);
    await pool.query("DELETE FROM orders             WHERE admin_id = ?", [admin_id]);
    await pool.query("DELETE FROM customers          WHERE admin_id = ?", [admin_id]);
    await pool.query("DELETE FROM products           WHERE admin_id = ?", [admin_id]);
    await pool.query("DELETE FROM staff              WHERE admin_id = ?", [admin_id]);
    await pool.query("DELETE FROM appointments       WHERE admin_id = ?", [admin_id]);
    await pool.query("DELETE FROM services           WHERE admin_id = ?", [admin_id]);
    await pool.query("DELETE FROM suppliers          WHERE admin_id = ?", [admin_id]);
    await pool.query("DELETE FROM price_tiers        WHERE admin_id = ?", [admin_id]);
    await pool.query("DELETE FROM prescriptions      WHERE admin_id = ?", [admin_id]);
    await pool.query("DELETE FROM menu_items         WHERE admin_id = ?", [admin_id]);
    await pool.query(`DELETE FROM \`tables\`         WHERE admin_id = ?`, [admin_id]);

    // ── Delete settings (use admin_id column not id=1) ──
    await pool.query("DELETE FROM settings WHERE admin_id = ?", [admin_id]);

    // ── Finally delete the admin account ──
    await pool.query("DELETE FROM users WHERE id = ?", [admin_id]);

    return NextResponse.json({ success: true, message: "Store and subdomain deleted successfully" });

  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}