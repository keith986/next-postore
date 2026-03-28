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
  
  .page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 2.5rem 1rem; position: relative; z-index: 1; }
  
  .header { text-align: center; margin-bottom: 2.5rem; }
  .logo { width: 44px; height: 44px; background: var(--ink); border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; font-weight: 700; margin-bottom: 1rem; }
  .header h1 { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 6px; }
  .header p { font-size: 14px; color: var(--muted); }

  /* POS selector */
  .pos-selector { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-bottom: 2rem; }
  .pos-btn { padding: 7px 16px; border: 1px solid var(--border2); border-radius: 100px; background: var(--surface); font-family: inherit; font-size: 13px; cursor: pointer; color: var(--ink2); transition: all 0.15s; }
  .pos-btn.active { background: var(--ink); color: #fff; border-color: var(--ink); }

  /* Plans grid */
  .plans { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; width: 100%; max-width: 860px; margin-bottom: 2rem; }
  .plan-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: 16px; padding: 1.5rem; cursor: pointer; transition: all 0.15s; position: relative; }
  .plan-card:hover { border-color: var(--ink); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
  .plan-card.selected { border-color: var(--ink); box-shadow: 0 0 0 3px rgba(20,20,16,0.1); }
  .plan-card.highlight { border-color: #2563eb; }
  .plan-card.highlight.selected { box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
  .plan-badge { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: #2563eb; color: #fff; font-size: 10px; font-weight: 700; padding: 3px 12px; border-radius: 100px; white-space: nowrap; letter-spacing: 0.5px; }
  .plan-name { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .plan-desc { font-size: 12px; color: var(--muted); margin-bottom: 1rem; line-height: 1.5; }
  .plan-price { font-size: 28px; font-weight: 700; letter-spacing: -1px; margin-bottom: 2px; }
  .plan-price span { font-size: 13px; font-weight: 400; color: var(--muted); }
  .plan-divider { border: none; border-top: 1px solid var(--border); margin: 1rem 0; }
  .plan-features { list-style: none; display: flex; flex-direction: column; gap: 7px; }
  .plan-features li { font-size: 12px; color: var(--ink2); display: flex; align-items: center; gap: 7px; }
  .check { color: var(--green); flex-shrink: 0; }
  .select-indicator { position: absolute; top: 14px; right: 14px; width: 20px; height: 20px; border-radius: 50%; background: var(--ink); display: flex; align-items: center; justify-content: center; }

  /* Payment form */
  .pay-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 1.75rem; width: 100%; max-width: 420px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
  .pay-title { font-size: 16px; font-weight: 600; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 8px; }
  .summary-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; padding: 6px 0; color: var(--ink2); }
  .summary-row.total { font-size: 15px; font-weight: 700; color: var(--ink); border-top: 1px solid var(--border); padding-top: 10px; margin-top: 4px; }
  .field { margin: 1rem 0; }
  .field label { display: block; font-size: 11px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; color: var(--ink2); margin-bottom: 5px; }
  .field input { width: 100%; background: var(--bg); border: 1px solid var(--border2); border-radius: 8px; padding: 10px 12px; color: var(--ink); font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
  .field input:focus { border-color: var(--ink); box-shadow: 0 0 0 3px rgba(20,20,16,0.07); background: #fff; }
  .field input::placeholder { color: var(--muted); }
  .mpesa-logo { display: flex; align-items: center; gap: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 12px; margin-bottom: 1rem; }
  .mpesa-dot { width: 10px; height: 10px; border-radius: 50%; background: #16a34a; }
  .mpesa-text { font-size: 13px; font-weight: 500; color: #166534; }
  .pay-btn { width: 100%; padding: 12px; background: #16a34a; color: #fff; border: none; border-radius: 9px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.15s, transform 0.1s; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .pay-btn:hover:not(:disabled) { background: #15803d; transform: translateY(-1px); }
  .pay-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* Polling overlay */
  .polling-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 1rem; }
  .polling-card { background: #fff; border-radius: 20px; padding: 2.5rem; width: 100%; max-width: 380px; text-align: center; }
  .polling-icon { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; }
  .polling-icon.pending { background: #fffbeb; animation: pulse 1.5s ease infinite; }
  .polling-icon.success { background: #f0fdf4; }
  .polling-icon.failed  { background: #fef2f2; }
  @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.6 } }
  .polling-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
  .polling-sub { font-size: 13px; color: var(--muted); line-height: 1.6; margin-bottom: 1.5rem; }
  .spinner { width: 24px; height: 24px; border: 3px solid #e2e0d8; border-top-color: #d97706; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .cancel-btn { background: none; border: 1px solid var(--border2); border-radius: 8px; padding: 8px 20px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--muted); cursor: pointer; }
  .cancel-btn:hover { border-color: var(--ink2); color: var(--ink); }
  .error-box { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 8px; padding: 9px 12px; font-size: 13px; margin-bottom: 1rem; display: flex; align-items: center; gap: 6px; }

  @media (max-width: 700px) {
    .plans { grid-template-columns: 1fr; }
    .pos-selector { gap: 6px; }
  }
  @media (max-width: 900px) {
    .plans { grid-template-columns: 1fr 1fr; }
  }
`;

interface StoredUser {
  id:         string;
  full_name:  string;
  email:      string;
  pos_type?:  PosType;
  plan?:      PlanId;
  store_name: string | null;
  domain:     string | null;
}

type PollingStatus = "idle" | "pending" | "success" | "failed";

function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("user") ?? "null"); }
  catch { return null; }
}

export default function PaymentPage() {
  const router = useRouter();
  const [user,       setUser]       = useState<StoredUser | null>(null);
  const [posType,    setPosType]    = useState<PosType>("retail");
  const [plan,       setPlan]       = useState<PlanId>("pro");
  const [phone,      setPhone]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [polling,    setPolling]    = useState<PollingStatus>("idle");
  const [checkoutId, setCheckoutId] = useState("");
  const [message,    setMessage]    = useState("");
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
  const u = getStoredUser();
  if (!u) { router.push("/"); return; }
  setUser(u);
  if (u.pos_type) setPosType(u.pos_type);

  // Check if already subscribed — redirect to dashboard
  fetch(`/api/subscription/status?user_id=${u.id}`)
    .then(r => r.json())
    .then(d => {
      if (d.active) {
        window.location.href = u.domain
          ? `https://${u.domain}.upendoapps.com/admin/dashboard`
          : "/onboarding";
      }
    })
    .catch(() => {});
}, [router]);

  const amount = user ? getPrice(posType, plan) : 0;

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
  };

  const startPolling = (checkoutRequestId: string) => {
    let attempts = 0;
    const maxAttempts = 24; // 2 minutes max

    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res  = await fetch("/api/mpesa/query", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            checkoutRequestId,
            user_id: user?.id,
            plan,
          }),
        });
        const data = await res.json();

        if (data.status === "completed") {
          stopPolling();
          setPolling("success");
          // Update localStorage with plan
          const updated = { ...user, plan };
          localStorage.setItem("user", JSON.stringify(updated));
          setTimeout(() => router.push("/onboarding"), 2500);
          return;
        }

        if (data.status === "failed") {
          stopPolling();
          setPolling("failed");
          setMessage(data.message || "Payment was not completed.");
          return;
        }

        if (attempts >= maxAttempts) {
          stopPolling();
          setPolling("failed");
          setMessage("Payment timed out. Please try again.");
        }
      } catch {
        if (attempts >= maxAttempts) {
          stopPolling();
          setPolling("failed");
          setMessage("Could not verify payment. Please contact support.");
        }
      }
    }, 5000);
  };

  const handlePay = async () => {
    if (!phone) return setError("Please enter your M-Pesa phone number.");
    const phoneClean = phone.replace(/\s/g, "");
    if (!/^(07|01|2547|2541|\+2547|\+2541)\d{7,8}$/.test(phoneClean))
      return setError("Please enter a valid Kenyan phone number.");

    setLoading(true); setError("");

    try {
      const res  = await fetch("/api/mpesa/stk", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          phone:    phoneClean,
          plan,
          pos_type: posType,
          user_id:  user?.id,
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
  };

  if (!user) return null;

  const selectedPosLabel = POS_PRICES.find(p => p.posType === posType)?.label ?? posType;

  return (
    <>
      <style>{css}</style>

      {/* Polling overlay */}
      {polling !== "idle" && (
        <div className="polling-overlay">
          <div className="polling-card">
            {polling === "pending" && (
              <>
                <div className="spinner" />
                <div className="polling-icon pending" style={{ marginBottom: "1rem" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
                  </svg>
                </div>
                <div className="polling-title">Check your phone</div>
                <div className="polling-sub">
                  We have sent an M-Pesa STK push to <strong>{phone}</strong>.<br />
                  Enter your M-Pesa PIN to complete the payment of <strong>KES {amount.toLocaleString()}</strong>.
                </div>
                <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
              </>
            )}

            {polling === "success" && (
              <>
                <div className="polling-icon success">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div className="polling-title" style={{ color: "#16a34a" }}>Payment successful!</div>
                <div className="polling-sub">
                  Your <strong>{PLANS.find(p => p.id === plan)?.name}</strong> subscription is now active.<br />
                  Setting up your store…
                </div>
              </>
            )}

            {polling === "failed" && (
              <>
                <div className="polling-icon failed">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <div className="polling-title" style={{ color: "#dc2626" }}>Payment failed</div>
                <div className="polling-sub">{message || "The payment was not completed. Please try again."}</div>
                <button className="pay-btn" style={{ background: "#dc2626" }} onClick={handleCancel}>Try again</button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="page">
        {/* Header */}
        <div className="header">
          <div className="logo">P</div>
          <h1>Choose your plan</h1>
          <p>Subscribe to activate your POStore account. Cancel anytime.</p>
        </div>

        {/* POS Type selector */}
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

        {/* Plans */}
        <div className="plans">
          {PLANS.map(p => {
            const price      = getPrice(posType, p.id);
            const isSelected = plan === p.id;
            return (
              <div
                key={p.id}
                className={`plan-card ${isSelected ? "selected" : ""} ${p.highlight ? "highlight" : ""}`}
                onClick={() => setPlan(p.id)}
                style={{ borderColor: isSelected ? (p.highlight ? "#2563eb" : "#141410") : p.highlight ? "#2563eb" : "#e2e0d8" }}
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

        {/* Payment form */}
        <div className="pay-card">
          <div className="pay-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Complete payment
          </div>

          {/* Summary */}
          <div className="summary-row">
            <span>Plan</span>
            <span>{PLANS.find(p => p.id === plan)?.name}</span>
          </div>
          <div className="summary-row">
            <span>POS Type</span>
            <span>{selectedPosLabel}</span>
          </div>
          <div className="summary-row">
            <span>Billing</span>
            <span>Monthly</span>
          </div>
          <div className="summary-row total">
            <span>Total today</span>
            <span>KES {amount.toLocaleString()}</span>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e2e0d8", margin: "1.25rem 0" }} />

          {/* M-Pesa */}
          <div className="mpesa-logo">
            <div className="mpesa-dot" />
            <div className="mpesa-text">Pay with M-Pesa STK Push</div>
          </div>

          {error && <div className="error-box"><span>⚠</span> {error}</div>}

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
                <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Sending STK push…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
                Pay KES {amount.toLocaleString()} via M-Pesa
              </>
            )}
          </button>

          <p style={{ fontSize: 11, color: "#c8c6bc", textAlign: "center", marginTop: "0.75rem", lineHeight: 1.5 }}>
            You will receive an M-Pesa prompt on your phone.<br />Enter your PIN to confirm.
          </p>
        </div>

        <p style={{ fontSize: 12, color: "#c8c6bc", marginTop: "1.5rem" }}>
          Secured by Safaricom M-Pesa · Cancel anytime
        </p>
      </div>
    </>
  );
}