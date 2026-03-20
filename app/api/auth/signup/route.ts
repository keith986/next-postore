import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/_lib/db";
import bcrypt from "bcryptjs";

/* ─────────────────────────────────────────────────────────
   cPanel API helper — creates a subdomain via cPanel UAPI
   
   Required env vars in .env.local:
     CPANEL_HOST=yourdomain.com           (your main hosting domain)
     CPANEL_USER=cpanelusername           (your cPanel username)
     CPANEL_TOKEN=your_cpanel_api_token   (cPanel > Manage API Tokens)
     NEXT_PUBLIC_BASE_DOMAIN=postore.app  (domain suffix for subdomains)
──────────────────────────────────────────────────────────── */

interface CpanelResult {
  success: boolean;
  error?:  string;
  url?:    string;
}

async function createCpanelSubdomain(subdomain: string): Promise<CpanelResult> {
  const host       = process.env.CPANEL_HOST;
  const user       = process.env.CPANEL_USER;
  const token      = process.env.CPANEL_TOKEN;
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "postore.app";

  if (!host || !user || !token) {
    /* Skip silently in local dev if env vars not set */
    console.warn("[Subdomain] CPANEL env vars not set — skipping subdomain creation");
    return { success: true, url: `https://${subdomain}.${baseDomain}` };
  }

  try {
    /* cPanel UAPI: SubDomain::addsubdomain
       Docs: https://api.docs.cpanel.net/openapi/cpanel/operation/SubDomain-addsubdomain/
       The document root is auto-created by cPanel under public_html */
    const params = new URLSearchParams({
      domain:     subdomain,   // e.g. "mystore"
      rootdomain: baseDomain,  // e.g. "postore.app"
      dir:        `public_html/${subdomain}`, // doc root relative to home
    });

    const res = await fetch(
      `https://${host}:2083/execute/SubDomain/addsubdomain?${params}`,
      { headers: { Authorization: `cpanel ${user}:${token}` } }
    );

    const data = await res.json();

    if (!res.ok || data.status === 0) {
      const errMsg = data.errors?.[0] ?? "cPanel API error";
      console.error("[Subdomain] cPanel error:", errMsg);
      return { success: false, error: errMsg };
    }

    return { success: true, url: `https://${subdomain}.${baseDomain}` };

  } catch (err) {
    console.error("[Subdomain] Network error:", (err as Error).message);
    return { success: false, error: (err as Error).message };
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
    const cpanel          = await createCpanelSubdomain(domain);
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