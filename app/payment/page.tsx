"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PLANS, POS_PRICES, getPrice } from "@/app/_lib/pricing";
import type { PlanId, PosType } from "@/app/_lib/pricing";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #f5f4f0; --surface: #fff; --ink: #141410; --ink2: #4a4a40;
    --muted: #9a9a8e; --border: #e2e0d8; --border2: #c8c6bc; --accent: #d4522a;
    --green: #16a34a; --green-bg: #f0fdf4; --green-border: #bbf7d0;
  }
  html, body { height: 100%; font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--ink); }
  body::before { content: ''; position: fixed; inset: 0; background-image: linear-gradient(rgba(0,0,0,0.032) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.032) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; z-index: 0; }
  .page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 2.5rem 1rem 4rem; position: relative; z-index: 1; }
  .header { text-align: center; margin-bottom: 2.5rem; }
  .logo { width: 44px; height: 44px; background: var(--ink); border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; font-weight: 700; margin-bottom: 1rem; }
  .header h1 { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 6px; }
  .header p { font-size: 14px; color: var(--muted); }
  .pos-selector { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-bottom: 2rem; }
  .pos-btn { padding: 7px 16px; border: 1px solid var(--border2); border-radius: 100px; background: var(--surface); font-family: inherit; font-size: 13px; cursor: pointer; color: var(--ink2); transition: all 0.15s; }
  .pos-btn.active { background: var(--ink); color: #fff; border-color: var(--ink); }
  .pos-btn:hover:not(.active) { border-color: var(--ink); color: var(--ink); }
  .plans { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; width: 100%; max-width: 860px; margin-bottom: 2rem; }
  .plan-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: 16px; padding: 1.5rem; cursor: pointer; transition: all 0.15s; position: relative; }
  .plan-card:hover { border-color: #9a9a8e; box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
  .plan-card.selected { border-color: var(--ink); box-shadow: 0 0 0 3px rgba(20,20,16,0.1); }
  .plan-card.highlight { border-color: #2563eb; }
  .plan-card.highlight.selected { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
  .plan-badge { position: absolute; top: -11px; left: 50%; transform: translateX(-50%); background: #2563eb; color: #fff; font-size: 10px; font-weight: 700; padding: 3px 12px; border-radius: 100px; white-space: nowrap; letter-spacing: 0.5px; }
  .plan-name { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .plan-desc { font-size: 12px; color: var(--muted); margin-bottom: 1rem; line-height: 1.5; }
  .plan-price { font-size: 28px; font-weight: 700; letter-spacing: -1px; margin-bottom: 2px; }
  .plan-price span { font-size: 13px; font-weight: 400; color: var(--muted); }
  .plan-divider { border: none; border-top: 1px solid var(--border); margin: 1rem 0; }
  .plan-features { list-style: none; display: flex; flex-direction: column; gap: 7px; }
  .plan-features li { font-size: 12px; color: var(--ink2); display: flex; align-items: center; gap: 7px; }
  .check { color: var(--green); flex-shrink: 0; }
  .select-indicator { position: absolute; top: 14px; right: 14px; width: 20px; height: 20px; border-radius: 50%; background: var(--ink); display: flex; align-items: center; justify-content: center; }
  .plan-card.highlight .select-indicator { background: #2563eb; }
  .pay-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 1.75rem; width: 100%; max-width: 420px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
  .pay-title { font-size: 15px; font-weight: 600; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 8px; color: var(--ink); }
  .summary-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; padding: 5px 0; color: var(--ink2); }
  .summary-row.total { font-size: 15px; font-weight: 700; color: var(--ink); border-top: 1px solid var(--border); padding-top: 10px; margin-top: 6px; }
  .field { margin: 1rem 0; }
  .field label { display: block; font-size: 11px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; color: var(--ink2); margin-bottom: 5px; }
  .field input { width: 100%; background: #f9f8f6; border: 1px solid var(--border2); border-radius: 8px; padding: 10px 12px; color: var(--ink); font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
  .field input:focus { border-color: var(--ink); box-shadow: 0 0 0 3px rgba(20,20,16,0.07); background: #fff; }
  .field input::placeholder { color: var(--muted); }
  .mpesa-badge { display: flex; align-items: center; gap: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 12px; margin-bottom: 1rem; }
  .mpesa-dot { width: 9px; height: 9px; border-radius: 50%; background: #16a34a; animation: blink 1.5s ease infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .mpesa-text { font-size: 13px; font-weight: 500; color: #166534; }
  .pay-btn { width: 100%; padding: 12px; background: #16a34a; color: #fff; border: none; border-radius: 9px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.15s, transform 0.1s; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .pay-btn:hover:not(:disabled) { background: #15803d; transform: translateY(-1px); }
  .pay-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .polling-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 1rem; animation: fadeIn 0.2s ease; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .polling-card { background: #fff; border-radius: 20px; padding: 2.5rem; width: 100%; max-width: 380px; text-align: center; box-shadow: 0 24px 60px rgba(0,0,0,0.2); animation: slideUp 0.25s ease; }
  @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .polling-icon { width: 68px; height: 68px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; }
  .polling-icon.pending { background: #fffbeb; border: 1px solid #fde68a; }
  .polling-icon.success { background: #f0fdf4; border: 1px solid #bbf7d0; }
  .polling-icon.failed  { background: #fef2f2; border: 1px solid #fecaca; }
  .polling-title { font-size: 19px; font-weight: 700; margin-bottom: 8px; color: var(--ink); }
  .polling-sub { font-size: 13px; color: var(--muted); line-height: 1.7; margin-bottom: 1.5rem; }
  .spinner { width: 28px; height: 28px; border: 3px solid #e2e0d8; border-top-color: #d97706; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .cancel-btn { background: none; border: 1px solid var(--border2); border-radius: 8px; padding: 9px 24px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--muted); cursor: pointer; transition: all 0.15s; }
  .cancel-btn:hover { border-color: var(--ink2); color: var(--ink); }
  .retry-btn { width: 100%; padding: 11px; background: #dc2626; color: #fff; border: none; border-radius: 9px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
  .retry-btn:hover { background: #b91c1c; }
  .error-box { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 8px; padding: 9px 12px; font-size: 13px; margin-bottom: 1rem; display: flex; align-items: center; gap: 6px; }
  .divider-line { border: none; border-top: 1px solid var(--border); margin: 1.25rem 0; }
  .secure-note { font-size: 11px; color: #c8c6bc; text-align: center; margin-top: 0.75rem; line-height: 1.5; }
  @media (max-width: 700px) { .plans { grid-template-columns: 1fr; } .pos-selector { gap: 6px; } }
  @media (max-width: 900px) and (min-width: 701px) { .plans { grid-template-columns: 1fr 1fr; } }
`;

interface StoredUser {
  id:         string;
  full_name:  string;
  email:      string;
  pos_type?:  PosType;
  plan?:      PlanId;
  store_name: string | null;
  domain?:    string;
}

interface PendingSignup {
  full_name:  string;
  email:      string;
  password:   string;
  store_name: string;
  domain:     string;
}

type PollingStatus = "idle" | "pending" | "success" | "failed";

function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("user") ?? "null"); }
  catch { return null; }
}

export default function PaymentPage() {
  const router = useRouter();

  const [user,          setUser]          = useState<StoredUser | null>(null);
  const [isNewSignup,   setIsNewSignup]   = useState(false);
  const [pendingSignup, setPendingSignup] = useState<PendingSignup | null>(null);
  const [posType,       setPosType]       = useState<PosType>("retail");
  const [plan,          setPlan]          = useState<PlanId>("pro");
  const [phone,         setPhone]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [polling,       setPolling]       = useState<PollingStatus>("idle");
  const [checkoutId,    setCheckoutId]    = useState("");
  const [failMsg,       setFailMsg]       = useState("");
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  /* ── Init ── */
  useEffect(() => {
    const isSignup = new URLSearchParams(window.location.search).get("signup") === "true";

    if (isSignup) {
      const pending = sessionStorage.getItem("pending_signup");
      if (!pending) { router.push("/signup"); return; }
      const data = JSON.parse(pending) as PendingSignup;
      setIsNewSignup(true);
      setPendingSignup(data);
      return;
    }

    // Existing user renewing subscription
    const u = getStoredUser();
    if (!u) { router.push("/"); return; }
    setUser(u);
    if (u.pos_type) setPosType(u.pos_type);
  }, [router]);

  const amount = getPrice(posType, plan);

  /* ── Stop polling ── */
  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
  };

  /* ── Poll for payment status ── */
  const startPolling = (checkoutRequestId: string) => {
    let attempts = 0;
    const maxAttempts = 24; // 2 min

    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res  = await fetch("/api/mpesa/query", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            checkoutRequestId,
            user_id:   isNewSignup ? `pending_${pendingSignup?.email}` : user?.id,
            plan,
          }),
        });
        const data = await res.json();

        if (data.status === "completed") {
          stopPolling();

          if (isNewSignup && pendingSignup) {
            // ── Create account now ──
            const createRes  = await fetch("/api/auth/signup/", {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body:    JSON.stringify({
                ...pendingSignup,
                plan,
                pos_type: posType,
                checkout_request_id: checkoutRequestId,
              }),
            });
            const createData = await createRes.json();

            if (createRes.ok && createData.user) {
              sessionStorage.removeItem("pending_signup");
              localStorage.setItem("user", JSON.stringify(createData.user));
              setPolling("success");
              setTimeout(() => router.push("/onboarding"), 3000);
              return;
            } else {
              setPolling("failed");
              setFailMsg(createData.error || "Account creation failed. Contact support.");
              return;
            }
          }

          // Existing user renewal
          const updated = { ...user, plan };
          localStorage.setItem("user", JSON.stringify(updated));
          setPolling("success");
          setTimeout(() => router.push("/onboarding"), 2500);
          return;
        }

        if (data.status === "failed") {
          stopPolling();
          setPolling("failed");
          setFailMsg(data.message || "Payment was not completed. Please try again.");
          return;
        }

        if (attempts >= maxAttempts) {
          stopPolling();
          setPolling("failed");
          setFailMsg("Payment timed out. Please try again.");
        }
      } catch {
        if (attempts >= maxAttempts) {
          stopPolling();
          setPolling("failed");
          setFailMsg("Could not verify payment. Please contact support.");
        }
      }
    }, 5000);
  };

  /* ── Pay ── */
  const handlePay = async () => {
    if (!phone) return setError("Please enter your M-Pesa phone number.");
    const phoneClean = phone.replace(/\s/g, "");
    if (!/^(07|01|2547|2541|\+2547|\+2541)\d{7,8}$/.test(phoneClean))
      return setError("Please enter a valid Kenyan phone number (07xx or 01xx).");

    setLoading(true); setError("");

    const userId = isNewSignup
      ? `pending_${pendingSignup?.email?.replace(/[^a-z0-9]/gi, "_")}`
      : user?.id;

    try {  
      const res  = await fetch("/api/mpesa/stk", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          phone:     phoneClean,
          plan,
          pos_type:  posType,
          user_id:   userId,
          is_signup: isNewSignup,
          domain:    isNewSignup ? pendingSignup?.domain : user?.domain,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success)
        throw new Error(data.error || "Failed to initiate payment.");

      setCheckoutId(data.checkoutRequestId);
      setPolling("pending");
      startPolling(data.checkoutRequestId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    stopPolling();
    setPolling("idle");
    setCheckoutId("");
    setFailMsg("");
  };

  /* ── Display name ── */
  const displayName = isNewSignup
    ? pendingSignup?.full_name?.split(" ")[0] ?? "there"
    : user?.full_name?.split(" ")[0] ?? "there";

  const selectedPosLabel = POS_PRICES.find(p => p.posType === posType)?.label ?? posType;
  const selectedPlan     = PLANS.find(p => p.id === plan);

  return (
    <>
      <style>{css}</style>

      {/* ── Polling overlay ── */}
      {polling !== "idle" && (
        <div className="polling-overlay">
          <div className="polling-card">

            {polling === "pending" && (
              <>
                <div className="spinner" />
                <div className="polling-icon pending" style={{ marginBottom: "1rem" }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2"/>
                    <line x1="12" y1="18" x2="12.01" y2="18"/>
                  </svg>
                </div>
                <div className="polling-title">Check your phone</div>
                <div className="polling-sub">
                  We sent an M-Pesa STK push to <strong>{phone}</strong>.<br />
                  Enter your PIN to complete payment of <strong>KES {amount.toLocaleString()}</strong>.
                </div>
                <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
              </>
            )}

            {polling === "success" && (
              <>
                <div className="polling-icon success">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div className="polling-title" style={{ color: "#16a34a" }}>
                  {isNewSignup ? "Account created!" : "Payment successful!"}
                </div>
                <div className="polling-sub">
                  {isNewSignup
                    ? `Welcome to POStore, ${displayName}! Setting up your store…`
                    : `Your ${selectedPlan?.name} subscription is now active. Redirecting…`}
                </div>
                <div className="spinner" style={{ borderTopColor: "#16a34a" }} />
              </>
            )}

            {polling === "failed" && (
              <>
                <div className="polling-icon failed">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <div className="polling-title" style={{ color: "#dc2626" }}>Payment failed</div>
                <div className="polling-sub">{failMsg}</div>
                <button className="retry-btn" onClick={handleCancel}>Try again</button>
              </>
            )}

          </div>
        </div>
      )}

      <div className="page">

        {/* ── Header ── */}
        <div className="header">
          <div className="logo">P</div>
          <h1>
            {isNewSignup ? `Welcome, ${displayName}!` : "Renew your subscription"}
          </h1>
          <p>
            {isNewSignup
              ? "Choose a plan and pay to activate your store."
              : "Select a plan to continue using POStore."}
          </p>
        </div>

        {/* ── POS Type selector ── */}
        <div className="pos-selector">
          {POS_PRICES.map(p => (
            <button
              key={p.posType}
              className={`pos-btn ${posType === p.posType ? "active" : ""}`}
              onClick={() => setPosType(p.posType)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* ── Plans ── */}
        <div className="plans">
          {PLANS.map(p => {
            const price      = getPrice(posType, p.id);
            const isSelected = plan === p.id;
            return (
              <div
                key={p.id}
                className={`plan-card ${isSelected ? "selected" : ""} ${p.highlight ? "highlight" : ""}`}
                onClick={() => setPlan(p.id)}
              >
                {p.badge && <div className="plan-badge">{p.badge}</div>}

                {isSelected && (
                  <div className="select-indicator">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                )}

                <div className="plan-name">{p.name}</div>
                <div className="plan-desc">{p.description}</div>
                <div className="plan-price">
                  KES {price.toLocaleString()}<span>/mo</span>
                </div>

                <hr className="plan-divider" />

                <ul className="plan-features">
                  {p.features.map(f => (
                    <li key={f}>
                      <svg className="check" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* ── Payment form ── */}
        <div className="pay-card">
          <div className="pay-title">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Order summary
          </div>

          {/* Summary */}
          <div className="summary-row">
            <span>Plan</span>
            <span>{selectedPlan?.name}</span>
          </div>
          <div className="summary-row">
            <span>POS Type</span>
            <span>{selectedPosLabel}</span>
          </div>
          <div className="summary-row">
            <span>Billing cycle</span>
            <span>Monthly</span>
          </div>
          {isNewSignup && pendingSignup && (
            <div className="summary-row">
              <span>Store</span>
              <span>{pendingSignup.store_name}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>Total today</span>
            <span>KES {amount.toLocaleString()}</span>
          </div>

          <hr className="divider-line" />

          {/* M-Pesa */}
          <div className="mpesa-badge">
            <div className="mpesa-dot" />
            <div className="mpesa-text">Pay with M-Pesa STK Push</div>
          </div>

          {error && (
            <div className="error-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <div className="field">
            <label>M-Pesa Phone Number</label>
            <input
              type="tel"
              placeholder="07XXXXXXXX or 01XXXXXXXX"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          <button className="pay-btn" onClick={handlePay} disabled={loading}>
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, border: "2.5px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Sending STK push…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="5" y="2" width="14" height="20" rx="2"/>
                  <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
                Pay KES {amount.toLocaleString()} via M-Pesa
              </>
            )}
          </button>

          <p className="secure-note">
            You will receive a prompt on your phone.<br />
            Enter your M-Pesa PIN to confirm. Secured by Safaricom.
          </p>
        </div>

        <p style={{ fontSize: 12, color: "#c8c6bc", marginTop: "1.5rem", textAlign: "center" }}>
          Cancel anytime · No hidden fees · Powered by M-Pesa
        </p>
      </div>
    </>
  );
}