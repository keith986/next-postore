import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/_lib/db";
import bcrypt from "bcryptjs";

/* ── POST /api/auth/signup ──
   Body: { full_name, email, password, role, store_name, domain }
   Returns: { user: { id, full_name, email, role, store_name, domain, pos_type } }
   The client saves user to localStorage then redirects to /onboarding
── */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { full_name, email, password, store_name, domain } = await request.json();

    /* Validate required fields */
    if (!full_name || !email || !password || !store_name || !domain)
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });

    if (password.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    const pool = await getPool();

    /* Check email uniqueness */
    const [emailRows] = await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    if ((emailRows as unknown[]).length > 0)
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });

    /* Check domain uniqueness */
    const [domainRows] = await pool.query(
      "SELECT id FROM users WHERE domain = ? LIMIT 1",
      [domain]
    );
    if ((domainRows as unknown[]).length > 0)
      return NextResponse.json({ error: "That domain is already taken" }, { status: 409 });

    /* Create account */
    const id     = crypto.randomUUID();
    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (id, full_name, email, password, role, store_name, domain)
       VALUES (?, ?, ?, ?, 'admin', ?, ?)`,
      [id, full_name, email, hashed, store_name, domain]
    );

    /* Return user object (no password) — client saves to localStorage */
    return NextResponse.json({
      success: true,
      user: {
        id,
        full_name,
        email,
        role:       "admin",
        store_name,
        domain,
        pos_type:   null,   // set during onboarding
      },
    }, { status: 201 });

  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}