import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/_lib/db";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import type { UserRole } from "@/app/_lib/types";

interface SignupPayload {
  full_name:  string;
  email:      string;
  password:   string;
  role:       UserRole;
  store_name: string;
  domain:     string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { full_name, email, password, role, store_name, domain }: SignupPayload =
    await request.json();

  try {
    const pool   = await getPool();
    const hashed = await bcrypt.hash(password, 10);
    const id     = randomUUID();

    await pool.query(
      `INSERT INTO users (id, full_name, email, password, role, store_name, domain)
       VALUES (?,?,?,?,?,?,?)`,
      [id, full_name, email, hashed, role, store_name, domain]
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}