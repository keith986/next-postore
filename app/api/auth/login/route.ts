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
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { email, password }: { email: string; password: string } =
    await request.json();

  if (!email || !password)
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });

  try {
    const pool = await getPool();

    /* ── 1. Check users table (admin / client) ── */
    const [userRows] = await pool.query<UserRow[]>(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (userRows.length > 0) {
      const user  = userRows[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match)
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });

      const { password: _, ...safeUser } = user;
      return NextResponse.json({ success: true, user: safeUser });
    }

    /* ── 2. Check staff table ── */
    const [staffRows] = await pool.query<StaffRow[]>(
      "SELECT * FROM staff WHERE email = ? LIMIT 1",
      [email]
    );

    if (staffRows.length > 0) {
      const staff = staffRows[0];

      if (staff.status === "inactive")
        return NextResponse.json({ error: "Your account is inactive. Contact your administrator." }, { status: 403 });

      const match = await bcrypt.compare(password, staff.password);

      if (!match)
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });

      // Update last_login
      await pool.query(
        "UPDATE staff SET last_login = NOW() WHERE id = ?",
        [staff.id]
      );

      const { password: _, ...safeStaff } = staff;

      // Return with role: "staff" so the frontend redirect works
      return NextResponse.json({
        success: true,
        user: {
          ...safeStaff,
          role:       "staff",
          store_name: null,
        },
      });
    }

    /* ── 3. Not found in either table ── */
    return NextResponse.json({ error: "No account found with that email" }, { status: 404 });

  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}