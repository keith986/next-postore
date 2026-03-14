import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/_lib/db";
import bcrypt from "bcryptjs";
import type { User } from "@/app/_lib/types";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { email, password }: { email: string; password: string } =
    await request.json();

  try {
    const pool  = await getPool();
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?", [email]
    );

    const users = rows as (User & { password: string })[];

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user  = users[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const { password: _, ...safeUser } = user;
    return NextResponse.json({ success: true, user: safeUser });

  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
