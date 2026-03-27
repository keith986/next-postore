import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/_lib/db";
import bcrypt from "bcryptjs";
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/* ── Types ── */
interface CpanelResult {
  success: boolean;
  error?:  string;
  url?:    string;
}

/* ── Subdomain creator ── */
async function createSubdomain(subdomain: string): Promise<CpanelResult> {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'upendoapps.com'
  try {
    const { stdout, stderr } = await execAsync(
      `sudo /usr/local/bin/create-subdomain.sh ${subdomain}`
    )
    if (stdout.includes('SUCCESS')) {
      return { success: true, url: `https://${subdomain}.${baseDomain}` }
    }
    return { success: false, error: stderr }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}



/* ── POST /api/auth/signup ── */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { full_name, email, password, store_name, domain } = await request.json();

    /* Validate */
    if (!full_name || !email || !password || !store_name || !domain)
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });

    if (password.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    if (!/^[a-z0-9-]{2,50}$/.test(domain))
      return NextResponse.json({ error: "Invalid domain — only letters, numbers and hyphens" }, { status: 400 });

    const pool = await getPool();

    /* Check email uniqueness */
    const [emailRows] = await pool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    if ((emailRows as unknown[]).length > 0)
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });

    /* Check domain uniqueness */
    const [domainRows] = await pool.query("SELECT id FROM users WHERE domain = ? LIMIT 1", [domain]);
    if ((domainRows as unknown[]).length > 0)
      return NextResponse.json({ error: "That domain is already taken" }, { status: 409 });

    /* Create cPanel subdomain BEFORE writing to DB */
    const cpanel = await createSubdomain(domain);
    const subdomain_url   = cpanel.url    ?? null;
    const subdomain_status = cpanel.success ? "active" : "pending";

    if (!cpanel.success) {
      console.warn(`[Signup] Subdomain failed for "${domain}": ${cpanel.error}. Creating account anyway.`);
    }
    
    /* Create account */
    const id     = crypto.randomUUID();
    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users
         (id, full_name, email, password, role, store_name, domain, subdomain_url, subdomain_status)
       VALUES (?, ?, ?, ?, 'admin', ?, ?, ?, ?)`,
      [id, full_name, email, hashed, store_name, domain, subdomain_url, subdomain_status]
    );

    return NextResponse.json({
      success:           true,
      subdomain_created: cpanel.success,
      user: {
        id,
        full_name,
        email,
        role:             "admin",
        store_name,
        domain,
        subdomain_url,
        subdomain_status,
        pos_type:         null,
      },
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}