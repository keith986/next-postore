// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/_lib/db";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";

interface UserRow extends RowDataPacket {
  id:         string;
  full_name:  string;
  email:      string;
  password:   string;
  role:       "admin" | "staff" | "client";
  store_name: string | null;
  domain:     string | null;
  pos_type:   string | null;
  created_at: string;
}

interface StaffRow extends RowDataPacket {
  id:         string;
  full_name:  string;
  email:      string;
  password:   string;
  admin_id:   string;
  shift_role: "staff";
  status:     "active" | "inactive";
  created_at: string;
  domain:     string | null;
}


export async function POST(request: NextRequest): Promise<NextResponse> {
  const { email, password }: { email: string; password: string } =
    await request.json();

  if (!email || !password)
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });

  try {
    const pool = await getPool();

    // Get the subdomain from the request host
    const host = request.headers.get('host') || ''
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'upendoapps.com'
    const subdomain = host.replace(`.${baseDomain}`, '')
    const isSubdomain = subdomain !== host && subdomain !== 'www'

    /* ── 1. Check users table ── */
    const [userRows] = await pool.query<UserRow[]>(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (userRows.length > 0) {
      const user = userRows[0];

      // If on a subdomain, make sure this user owns it
      if (isSubdomain && user.domain !== subdomain) {
        return NextResponse.json(
          { error: "This account does not belong to this store" },
          { status: 403 }
        );
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });

      const { password: _, ...safeUser } = user;
      return NextResponse.json({ success: true, user: safeUser });
    }

    /* ── 2. Check staff table ── */
    const [staffRows] = await pool.query<StaffRow[]>(
      `SELECT s.*, u.domain 
       FROM staff s 
       JOIN users u ON s.admin_id = u.id 
       WHERE s.email = ? LIMIT 1`,
      [email]
    );

    if (staffRows.length > 0) {
      const staff = staffRows[0];

      // Staff must belong to the subdomain's admin
      if (isSubdomain && staff.domain !== subdomain) {
        return NextResponse.json(
          { error: "This account does not belong to this store" },
          { status: 403 }
        );
      }

      if (staff.status === "inactive")
        return NextResponse.json(
          { error: "Your account is inactive. Contact your administrator." },
          { status: 403 }
        );

      const match = await bcrypt.compare(password, staff.password);
      if (!match)
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });

      await pool.query("UPDATE staff SET last_login = NOW() WHERE id = ?", [staff.id]);

      const { password: _, ...safeStaff } = staff;
      return NextResponse.json({
        success: true,
        user: { ...safeStaff, role: "staff", store_name: null },
      });
    }

    return NextResponse.json(
      { error: "No account found with that email" },
      { status: 404 }
    );

  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}