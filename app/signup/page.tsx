"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TAKEN = ["demo", "test", "admin", "app", "store", "shop", "vendx", "mystore"];

function slugify(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function pwStrength(pw: string) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const STRENGTH_LABEL = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLOR = ["", "#e24b4a", "#d97706", "#84cc16", "#16a34a"];

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
    --ok: #16a34a;
    --bad: #e24b4a;
  }

  html, body { height: 100%; }
  body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--ink); height: 100%; }

  body::before {
    content: ''; position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(0,0,0,0.032) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.032) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none; z-index: 0;
  }

  .page-wrap { display: grid; grid-template-columns: 1fr 1fr; height: 100vh; overflow: hidden; position: relative; z-index: 1; }

  .left {
    background: var(--surface); border-right: 1px solid var(--border);
    padding: 2.5rem; display: flex; flex-direction: column;
    justify-content: space-between; height: 100vh; overflow: hidden; position: relative;
  }

  .blob { position: absolute; border-radius: 50%; pointer-events: none; }
  .blob-a { width: 280px; height: 280px; background: #d1fae5; top: -70px; left: -70px; opacity: 0.5; }
  .blob-b { width: 220px; height: 220px; background: #fde8d8; bottom: -60px; right: -60px; opacity: 0.45; }

  .logo-row { display: flex; align-items: center; gap: 10px; position: relative; z-index: 1; }
  .logo-mark { width: 34px; height: 34px; background: var(--ink); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 500; }
  .logo-name { font-weight: 500; font-size: 15px; }

  .hero { position: relative; z-index: 1; }
  .hero-eyebrow { font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--ok); margin-bottom: 10px; }
  .hero-title { font-size: 26px; font-weight: 500; line-height: 1.2; margin-bottom: 12px; }
  .hero-body { font-size: 13px; color: var(--muted); line-height: 1.65; max-width: 260px; margin-bottom: 20px; }

  .check-list { display: flex; flex-direction: column; gap: 10px; }
  .check-item { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--muted); }
  .check-icon { width: 20px; height: 20px; border-radius: 50%; background: #f0fdf4; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

  .left-footer { font-size: 12px; color: var(--muted); position: relative; z-index: 1; }
  .left-footer a { color: var(--accent); font-weight: 500; text-decoration: none; }
  .left-footer a:hover { text-decoration: underline; }

  .right { overflow-y: auto; height: 100vh; background: var(--bg); display: flex; align-items: flex-start; justify-content: center; padding: 0 2.5rem; }

  .form-card { width: 100%; max-width: 340px; padding: 3rem 0; }

  .form-eyebrow { font-size: 11px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
  .form-title { font-size: 22px; font-weight: 500; margin-bottom: 4px; }
  .form-sub { font-size: 13px; color: var(--muted); margin-bottom: 1rem; line-height: 1.5; }

  .sec-label { font-size: 11px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); display: flex; align-items: center; gap: 10px; margin: 18px 0 12px; }
  .sec-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  .field { margin-bottom: 13px; }
  .field label { display: block; font-size: 11px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; color: var(--ink2); margin-bottom: 5px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

  .field input { width: 100%; background: var(--surface); border: 1px solid var(--border2); border-radius: 8px; padding: 9px 12px; color: var(--ink); font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
  .field input::placeholder { color: var(--muted); }
  .field input:focus { border-color: var(--ink); box-shadow: 0 0 0 3px rgba(20,20,16,0.07); }
  .field input.valid { border-color: var(--ok); }
  .field input.valid:focus { box-shadow: 0 0 0 3px rgba(22,163,74,0.1); }
  .field input.invalid { border-color: var(--bad); }
  .field input.invalid:focus { box-shadow: 0 0 0 3px rgba(226,75,74,0.1); }

  .domain-row { display: flex; align-items: stretch; background: var(--surface); border: 1px solid var(--border2); border-radius: 8px; overflow: hidden; transition: border-color 0.15s, box-shadow 0.15s; }
  .domain-row:focus-within { border-color: var(--ink); box-shadow: 0 0 0 3px rgba(20,20,16,0.07); }
  .domain-row.valid { border-color: var(--ok); }
  .domain-row.valid:focus-within { box-shadow: 0 0 0 3px rgba(22,163,74,0.1); }
  .domain-row.invalid { border-color: var(--bad); }
  .domain-row.invalid:focus-within { box-shadow: 0 0 0 3px rgba(226,75,74,0.1); }

  .domain-input { flex: 1; background: transparent; border: none; outline: none; padding: 9px 0 9px 12px; color: var(--ink); font-family: 'DM Sans', sans-serif; font-size: 14px; min-width: 0; }
  .domain-input::placeholder { color: var(--muted); }
  .domain-suffix { padding: 0 12px; background: var(--bg); font-size: 12px; font-weight: 500; color: var(--ink2); display: flex; align-items: center; border-left: 1px solid var(--border); white-space: nowrap; }

  .domain-hint { display: flex; align-items: center; gap: 5px; margin-top: 5px; font-size: 12px; min-height: 18px; }
  .hint-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
  .domain-hint.neutral  { color: var(--muted); }
  .domain-hint.checking { color: #d97706; }
  .domain-hint.ok       { color: var(--ok); }
  .domain-hint.bad      { color: var(--bad); }

  .domain-preview { font-size: 11px; color: var(--muted); margin-top: 3px; }
  .domain-preview strong { color: var(--ink2); font-weight: 500; }

  .pw-bars { display: flex; gap: 3px; margin-top: 6px; }
  .pw-bar { flex: 1; height: 3px; border-radius: 2px; background: var(--border); transition: background 0.3s; }
  .pw-lbl { font-size: 11px; color: var(--muted); margin-top: 3px; }

  .btn-primary { width: 100%; padding: 10px; background: var(--ink); color: #fff; border: none; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; margin-top: 8px; transition: background 0.15s, transform 0.1s, box-shadow 0.15s; }
  .btn-primary:hover { background: #2a2a22; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(20,20,16,0.18); }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

  .divider { display: flex; align-items: center; gap: 10px; margin: 16px 0; font-size: 12px; color: var(--muted); }
  .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  .error-box { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 8px; padding: 9px 12px; font-size: 13px; margin-bottom: 14px; display: flex; align-items: center; gap: 6px; }

  .terms { font-size: 11px; color: var(--muted); text-align: center; margin-top: 1rem; line-height: 1.6; }
  .terms a { color: var(--accent); text-decoration: none; font-weight: 500; }
  .terms a:hover { text-decoration: underline; }

  .footer-link { text-align: center; margin-top: 1.1rem; font-size: 12px; color: var(--muted); }
  .footer-link a { color: var(--accent); font-weight: 500; text-decoration: none; }
  .footer-link a:hover { text-decoration: underline; }

  @media (max-width: 700px) {
    .page-wrap { grid-template-columns: 1fr; height: auto; overflow: visible; }
    .left { display: none; }
    .right { height: auto; padding: 2rem 1.25rem; }
    .form-card { padding: 2rem 0; }
  }
`;

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    storeName: "", domain: "",
    password: "", confirm: "",
  });
  const [domainStatus, setDomainStatus] = useState("neutral");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm(f => ({ ...f, [key]: val }));
    if (key === "storeName" && !form.domain) triggerSlug(val);
  };

  const triggerSlug = (name: string) => {
    const slug = slugify(name);
    setForm(f => ({ ...f, domain: slug }));
    checkDomain(slug);
  };

  const handleDomain = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = slugify(e.target.value);
    setForm(f => ({ ...f, domain: slug }));
    checkDomain(slug);
  };

  let domainTimer: ReturnType<typeof setTimeout>;

  const checkDomain = (slug: string) => {
    if (!slug) { setDomainStatus("neutral"); return; }
    setDomainStatus("checking");
    clearTimeout(domainTimer);
    domainTimer = setTimeout(async () => {
      // Check hardcoded list first
      if (TAKEN.includes(slug)) { setDomainStatus("bad"); return; }
      // Then check against your database
      try {
        const res  = await fetch(`/api/auth/check-domain?domain=${slug}`);
        const data = await res.json();
        setDomainStatus(data.taken ? "bad" : "ok");
      } catch {
        // Fallback: just mark as ok if the request fails
        setDomainStatus("ok");
      }
    }, 650);
  };

  const strength = pwStrength(form.password);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!form.firstName || !form.email || !form.storeName || !form.domain || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (domainStatus !== "ok") {
      setError("Please choose an available domain.");
      return;
    }
    if (strength < 2) {
      setError("Please choose a stronger password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name:  `${form.firstName} ${form.lastName}`.trim(),
          email:      form.email,
          password:   form.password,
          role:       "admin",        // store owners are admins
          store_name: form.storeName,
          domain:     form.domain,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed. Please try again.");
        return;
      }

      // Save user to localStorage and redirect to onboarding
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/payment");

    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const domainRowClass = domainStatus === "ok" ? "valid" : domainStatus === "bad" ? "invalid" : "";
  const confirmClass   = form.confirm
    ? form.confirm === form.password ? "valid" : "invalid"
    : "";

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
            <p className="hero-eyebrow">Free forever plan</p>
            <h1 className="hero-title">Your store,<br />your domain.</h1>
            <p className="hero-body">
              Get a dedicated store URL like{" "}
              <strong style={{ color: "var(--ink)", fontWeight: 500 }}>yourstore.postore.app</strong>{" "}
              — yours from day one.
            </p>
            <div className="check-list">
              {["Custom store domain included", "Inventory & sales management", "No credit card required"].map(item => (
                <div className="check-item" key={item}>
                  <div className="check-icon">
                    <svg width="10" height="10" viewBox="0 0 12 12">
                      <polyline points="2,6 5,9 10,3" stroke="#16a34a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    </svg>
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="left-footer">
            Already have an account?{" "}
            <Link href="/">Sign in</Link>
          </div>
        </div>

        {/* ── RIGHT (scrollable) ── */}
        <div className="right">
          <div className="form-card">
            <p className="form-eyebrow">Get started free</p>
            <h2 className="form-title">Create your store</h2>
            <p className="form-sub">Set up your POS in minutes. No credit card required.</p>

            {error && (
              <div className="error-box">
                <span>⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* YOUR DETAILS */}
              <div className="sec-label">Your details</div>

              <div className="two-col">
                <div className="field">
                  <label>First name</label>
                  <input type="text" placeholder="Jane" value={form.firstName} onChange={set("firstName")} />
                </div>
                <div className="field">
                  <label>Last name</label>
                  <input type="text" placeholder="Doe" value={form.lastName} onChange={set("lastName")} />
                </div>
              </div>

              <div className="field">
                <label>Email address</label>
                <input type="email" placeholder="jane@yourstore.com" value={form.email} onChange={set("email")} autoComplete="email" />
              </div>

              {/* YOUR STORE */}
              <div className="sec-label">Your store</div>

              <div className="field">
                <label>Store name</label>
                <input type="text" placeholder="e.g. Jane's Boutique" value={form.storeName} onChange={set("storeName")} />
              </div>

              <div className="field">
                <label>Store domain</label>
                <div className={`domain-row ${domainRowClass}`}>
                  <input
                    className="domain-input"
                    type="text"
                    placeholder="your-store"
                    value={form.domain}
                    onChange={handleDomain}
                    spellCheck={false}
                    autoCapitalize="none"
                  />
                  <span className="domain-suffix">.postore.app</span>
                </div>

                <div className={`domain-hint ${domainStatus}`}>
                  <span className="hint-dot" />
                  {domainStatus === "neutral"  && "This will be your store's unique URL"}
                  {domainStatus === "checking" && "Checking availability…"}
                  {domainStatus === "ok"       && `${form.domain}.postore.app is available`}
                  {domainStatus === "bad"      && "That domain is already taken"}
                </div>

                {form.domain && (
                  <div className="domain-preview">
                    Your store: <strong>https://{form.domain}.postore.app</strong>
                  </div>
                )}
              </div>

              {/* SECURITY */}
              <div className="sec-label">Security</div>

              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={set("password")}
                  autoComplete="new-password"
                />
                {form.password && (
                  <>
                    <div className="pw-bars">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className="pw-bar"
                          style={{ background: strength >= i ? STRENGTH_COLOR[strength] : undefined }}
                        />
                      ))}
                    </div>
                    <div className="pw-lbl">{STRENGTH_LABEL[strength]} password</div>
                  </>
                )}
              </div>

              <div className="field">
                <label>Confirm password</label>
                <input
                  type="password"
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={set("confirm")}
                  className={confirmClass}
                  autoComplete="new-password"
                />
              </div>

              <button
                className="btn-primary"
                type="submit"
                disabled={loading || domainStatus === "bad" || domainStatus === "neutral"}
              >
                {loading ? "Creating your store…" : "Create my store →"}
              </button>
            </form>

            <div className="divider" />

            <p className="terms">
              By creating an account you agree to our{" "}
              <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>

            <p className="footer-link">
              Already have an account? <Link href="/">Sign in</Link>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}