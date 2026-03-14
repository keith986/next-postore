"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #f5f4f0;
    --surface: #ffffff;
    --ink: #141410;
    --ink2: #4a4a40;
    --muted: #9a9a8e;
    --border: #e2e0d8;
    --border2: #c8c6bc;
    --accent: #d4522a;
  }

  html, body { height: 100%; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--ink);
    height: 100%;
  }

  body::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(0,0,0,0.032) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.032) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  .page-wrap {
    display: grid;
    grid-template-columns: 1fr 1fr;
    height: 100vh;
    overflow: hidden;
    position: relative;
    z-index: 1;
  }

  /* LEFT — sticky, never scrolls */
  .left {
    background: var(--surface);
    border-right: 1px solid var(--border);
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100vh;
    overflow: hidden;
    position: relative;
  }

  .blob {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }
  .blob-a { width: 300px; height: 300px; background: #fde8d8; top: -80px; right: -80px; opacity: 0.55; }
  .blob-b { width: 220px; height: 220px; background: #d1fae5; bottom: -60px; left: -60px; opacity: 0.45; }

  .logo-row {
    display: flex; align-items: center; gap: 10px;
    position: relative; z-index: 1;
  }
  .logo-mark {
    width: 34px; height: 34px;
    background: var(--ink);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 13px; font-weight: 500;
  }
  .logo-name { font-weight: 500; font-size: 15px; }

  .hero { position: relative; z-index: 1; }
  .hero-eyebrow {
    font-size: 11px; font-weight: 500;
    letter-spacing: 2px; text-transform: uppercase;
    color: var(--accent); margin-bottom: 10px;
  }
  .hero-title {
    font-size: 28px; font-weight: 500;
    line-height: 1.2; margin-bottom: 12px;
  }
  .hero-body {
    font-size: 13px; color: var(--muted);
    line-height: 1.65; max-width: 260px;
  }

  .stats { display: flex; gap: 1.5rem; position: relative; z-index: 1; }
  .stat { border-left: 2px solid var(--border); padding-left: 12px; }
  .stat-num { font-size: 20px; font-weight: 500; }
  .stat-lbl { font-size: 11px; color: var(--muted); margin-top: 2px; }

  /* RIGHT — scrollable */
  .right {
    overflow-y: auto;
    height: 100vh;
    background: var(--bg);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 0 2.5rem;
  }

  .form-card {
    width: 100%;
    max-width: 340px;
    padding: 3rem 0;
  }

  .form-eyebrow {
    font-size: 11px; font-weight: 500;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--muted); margin-bottom: 6px;
  }
  .form-title { font-size: 22px; font-weight: 500; margin-bottom: 4px; }
  .form-sub { font-size: 13px; color: var(--muted); margin-bottom: 1.8rem; line-height: 1.5; }

  .field { margin-bottom: 14px; }
  .field-meta {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 5px;
  }
  .field label, .f-label {
    display: block;
    font-size: 11px; font-weight: 500;
    letter-spacing: 0.5px; text-transform: uppercase;
    color: var(--ink2); margin-bottom: 5px;
  }
  .field-meta label { margin-bottom: 0; }

  .field input {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 8px;
    padding: 9px 12px;
    color: var(--ink);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .field input::placeholder { color: var(--muted); }
  .field input:focus {
    border-color: var(--ink);
    box-shadow: 0 0 0 3px rgba(20,20,16,0.07);
  }

  .forgot {
    font-size: 12px; color: #1e40af;
    text-decoration: none;
  }
  .forgot:hover { text-decoration: underline; }

  .btn-primary {
    width: 100%; padding: 10px;
    background: var(--ink); color: #fff;
    border: none; border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500;
    cursor: pointer; margin-top: 6px;
    transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
  }
  .btn-primary:hover { background: #2a2a22; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(20,20,16,0.18); }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

  .divider {
    display: flex; align-items: center; gap: 10px;
    margin: 16px 0; font-size: 12px; color: var(--muted);
  }
  .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  .btn-google {
    width: 100%; padding: 9px;
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 8px; color: var(--ink);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: border-color 0.15s, background 0.15s;
  }
  .btn-google:hover { border-color: var(--ink2); background: var(--bg); }

  .footer-link { text-align: center; margin-top: 1.2rem; font-size: 12px; color: var(--muted); }
  .footer-link a { color: var(--accent); font-weight: 500; text-decoration: none; }
  .footer-link a:hover { text-decoration: underline; }

  .error-box {
    background: #fef2f2; border: 1px solid #fecaca;
    color: #991b1b; border-radius: 8px;
    padding: 9px 12px; font-size: 13px;
    margin-bottom: 14px;
    display: flex; align-items: center; gap: 6px;
  }

  @media (max-width: 700px) {
    .page-wrap { grid-template-columns: 1fr; height: auto; overflow: visible; }
    .left { display: none; }
    .right { height: auto; padding: 2rem 1.25rem; }
    .form-card { padding: 2rem 0; }
  }
`;

const ROLE_REDIRECT : { [key: string]: string } = {
  admin:  "/admin/dashboard",
  staff:  "/staff/dashboard",
  client: "/client/dashboard",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Please fill in all fields.");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ email, password }),
                });
    const data = await res.json();

    localStorage.setItem("user", JSON.stringify(data.user));

    setTimeout(() => setLoading(false), 1500);

    if (data.error) {
      setError(data.error);
    } else {
      router.push(ROLE_REDIRECT[data.user.role]);
    }
    
  };

  return (
    <>
      <style>{css}</style>
      <div className="page-wrap">

        {/* ── LEFT ── */}
        <div className="left">
          <div className="blob blob-a" />
          <div className="blob blob-b" />

          <div className="logo-row">
            <div className="logo-mark">P</div>
            <span className="logo-name">POStore</span>
          </div>

          <div className="hero">
            <p className="hero-eyebrow">Point of sale</p>
            <h1 className="hero-title">Sell smarter,<br />grow faster.</h1>
            <p className="hero-body">
              Complete POS for modern retailers. Manage inventory, process payments, and track every transaction in real time.
            </p>
          </div>

          <div className="stats">
            <div className="stat">
              <div className="stat-num">--</div>
              <div className="stat-lbl">Daily transactions</div>
            </div>
            <div className="stat">
              <div className="stat-num">--</div>
              <div className="stat-lbl">Uptime SLA</div>
            </div>
            <div className="stat">
              <div className="stat-num">--</div>
              <div className="stat-lbl">User rating</div>
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="right">
          <div className="form-card">
            <p className="form-eyebrow">Welcome back</p>
            <h2 className="form-title">Sign in to your store</h2>
            <p className="form-sub">Enter your credentials to access your dashboard.</p>

            {error && <div className="error-box"><span>⚠</span> {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Email address</label>
                <input
                  type="email"
                  placeholder="you@yourstore.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="field">
                <div className="field-meta">
                  <label>Password</label>
                  <a href="/forgot-password" className="forgot">Forgot password?</a>
                </div>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "Signing in…" : "Sign in →"}
              </button>
            </form>

            <div className="divider"></div>

            <p className="footer-link">
              Don&apos;t have an account?{" "}
              <Link href="/signup">Create one free</Link>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
