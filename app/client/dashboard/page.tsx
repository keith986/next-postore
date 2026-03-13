"use client";
import { useState } from "react";
import Link from "next/link";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #f5f4f0;
    --surface:   #ffffff;
    --ink:       #141410;
    --ink2:      #4a4a40;
    --muted:     #9a9a8e;
    --border:    #e2e0d8;
    --border2:   #c8c6bc;
    --accent:    #d4522a;
    --accent-bg: #fff4f0;
    --ok:        #16a34a;
    --ok-bg:     #f0fdf4;
    --warn:      #d97706;
    --warn-bg:   #fffbeb;
    --info:      #2563eb;
    --info-bg:   #eff6ff;
    --sidebar-w: 220px;
    --header-h:  60px;
  }

  html, body { height: 100%; }
  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--ink);
    min-height: 100vh;
  }

  .shell {
    display: grid;
    grid-template-columns: var(--sidebar-w) 1fr;
    grid-template-rows: var(--header-h) 1fr;
    min-height: 100vh;
  }

  /* ── SIDEBAR ─────────────────────────── */
  .sidebar {
    grid-row: 1 / 3;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    position: sticky; top: 0;
    height: 100vh;
    overflow-y: auto;
  }

  .sidebar-logo {
    display: flex; align-items: center; gap: 10px;
    padding: 0 1.25rem;
    height: var(--header-h);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .sidebar-logo-mark {
    width: 30px; height: 30px;
    background: var(--ink);
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 500; color: #fff;
  }
  .sidebar-logo-name { font-size: 14px; font-weight: 500; }

  .sidebar-section {
    padding: 1.25rem 1rem 0.5rem;
    font-size: 10px; font-weight: 500;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--muted);
  }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 0.6rem 1rem;
    margin: 1px 0.5rem;
    border-radius: 7px;
    font-size: 13px; color: var(--ink2);
    cursor: pointer; text-decoration: none;
    transition: background 0.15s, color 0.15s;
  }
  .nav-item:hover { background: var(--bg); color: var(--ink); }
  .nav-item.active { background: var(--accent-bg); color: var(--accent); font-weight: 500; }
  .nav-item svg { flex-shrink: 0; }

  .nav-badge {
    margin-left: auto;
    background: var(--accent);
    color: #fff;
    font-size: 10px; font-weight: 500;
    padding: 1px 6px; border-radius: 100px;
  }

  .sidebar-footer {
    margin-top: auto;
    padding: 1rem;
    border-top: 1px solid var(--border);
  }
  .sidebar-user { display: flex; align-items: center; gap: 10px; }
  .sidebar-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--accent-bg);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 500; color: var(--accent);
    border: 1.5px solid var(--accent);
    flex-shrink: 0;
  }
  .sidebar-user-name { font-size: 13px; font-weight: 500; }
  .sidebar-user-role { font-size: 11px; color: var(--muted); }

  /* ── HEADER ─────────────────────────── */
  .header {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center;
    padding: 0 1.75rem; gap: 1rem;
    position: sticky; top: 0; z-index: 10;
  }
  .header-title { font-size: 15px; font-weight: 500; flex: 1; }
  .header-store {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; color: var(--muted);
  }
  .store-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ok); }
  .header-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 12px;
    background: var(--accent); color: #fff;
    border: none; border-radius: 7px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 500;
    cursor: pointer; transition: background 0.15s;
  }
  .header-btn:hover { background: #bc4422; }

  /* ── MAIN ─────────────────────────── */
  .main {
    padding: 1.75rem;
    overflow-y: auto;
    display: flex; flex-direction: column; gap: 1.5rem;
  }

  /* ── WELCOME BANNER ─────────────────── */
  .welcome-banner {
    background: var(--ink);
    border-radius: 14px;
    padding: 1.5rem 2rem;
    display: flex; align-items: center; justify-content: space-between;
    color: #fff;
    position: relative; overflow: hidden;
  }
  .welcome-banner::before {
    content: '';
    position: absolute; top: -60px; right: -60px;
    width: 200px; height: 200px; border-radius: 50%;
    background: rgba(212,82,42,0.2);
  }
  .welcome-title { font-size: 18px; font-weight: 500; margin-bottom: 4px; }
  .welcome-sub { font-size: 13px; color: rgba(255,255,255,0.5); }
  .welcome-points {
    background: rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 0.75rem 1.25rem;
    text-align: center;
    position: relative; z-index: 1;
  }
  .points-num { font-size: 28px; font-weight: 500; }
  .points-lbl { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px; }

  /* ── STAT CARDS ─────────────────────── */
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.25rem;
    display: flex; flex-direction: column; gap: 0.5rem;
  }
  .stat-label { font-size: 12px; color: var(--muted); }
  .stat-value { font-size: 22px; font-weight: 500; letter-spacing: -0.5px; }
  .stat-sub { font-size: 11px; color: var(--muted); }

  /* ── GRID ─────────────────────────── */
  .two-col { display: grid; grid-template-columns: 1.4fr 1fr; gap: 1rem; }

  /* ── CARD ─────────────────────────── */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
  }
  .card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border);
  }
  .card-title { font-size: 13px; font-weight: 500; }
  .card-action {
    font-size: 12px; color: var(--accent);
    cursor: pointer; text-decoration: none;
    transition: opacity 0.15s;
  }
  .card-action:hover { opacity: 0.7; }
  .card-body { padding: 1.25rem; }

  /* ── ORDER TIMELINE ─────────────────── */
  .order-row {
    display: flex; align-items: center; gap: 14px;
    padding: 0.9rem 1.25rem;
    border-bottom: 1px solid var(--border);
    transition: background 0.15s;
    cursor: pointer;
  }
  .order-row:last-child { border-bottom: none; }
  .order-row:hover { background: var(--bg); }
  .order-icon {
    width: 36px; height: 36px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }
  .order-id { font-size: 13px; font-weight: 500; }
  .order-meta { font-size: 11px; color: var(--muted); }
  .order-right { margin-left: auto; text-align: right; }
  .order-total { font-size: 13px; font-weight: 500; }

  /* ── BADGE ─────────────────────────── */
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 100px;
    font-size: 11px; font-weight: 500;
  }
  .badge-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
  .badge.ok   { background: var(--ok-bg);   color: var(--ok); }
  .badge.warn { background: var(--warn-bg); color: var(--warn); }
  .badge.bad  { background: var(--accent-bg); color: var(--accent); }
  .badge.info { background: var(--info-bg); color: var(--info); }

  /* ── LOYALTY PROGRESS ─────────────────── */
  .loyalty-track {
    background: var(--bg);
    border-radius: 100px;
    height: 8px; overflow: hidden;
    margin: 0.75rem 0;
  }
  .loyalty-fill {
    height: 100%; border-radius: 100px;
    background: var(--accent);
    transition: width 0.6s ease;
  }
  .loyalty-steps {
    display: flex; justify-content: space-between;
    font-size: 11px; color: var(--muted);
  }
  .loyalty-reward {
    display: flex; align-items: center; gap: 10px;
    padding: 0.75rem;
    background: var(--bg);
    border-radius: 10px;
    margin-top: 0.75rem;
    font-size: 12px; color: var(--ink2);
  }
  .reward-icon { font-size: 20px; }

  /* ── QUICK ACTIONS ─────────────────── */
  .quick-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  .quick-btn {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 1rem;
    display: flex; flex-direction: column; align-items: flex-start; gap: 6px;
    cursor: pointer; text-align: left;
    transition: border-color 0.15s, background 0.15s;
  }
  .quick-btn:hover { border-color: var(--border2); background: #eee; }
  .quick-icon { font-size: 20px; }
  .quick-label { font-size: 12px; font-weight: 500; color: var(--ink); }
  .quick-sub   { font-size: 11px; color: var(--muted); }

  /* ── STORE INFO ─────────────────────── */
  .store-info-row {
    display: flex; align-items: center; gap: 12px;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
  }
  .store-info-row:last-child { border-bottom: none; }
  .store-info-label { color: var(--muted); min-width: 100px; font-size: 12px; }
  .store-info-val { font-weight: 500; flex: 1; }

  @media (max-width: 1000px) {
    .stat-grid { grid-template-columns: repeat(2,1fr); }
    .two-col { grid-template-columns: 1fr; }
  }
  @media (max-width: 700px) {
    :root { --sidebar-w: 0px; }
    .sidebar { display: none; }
    .shell { grid-template-columns: 1fr; }
    .stat-grid { grid-template-columns: 1fr 1fr; }
  }
`;

const recentOrders = [
  { id: "#4821", items: "Air Runner Pro, Tote Bag", date: "13 Mar 2026", total: "$106.50", status: "ok",   statusLabel: "Delivered",  icon: "📦", bg: "#f0fdf4" },
  { id: "#4790", items: "Aloe Face Cream ×2",       date: "9 Mar 2026",  total: "$70.00",  status: "ok",   statusLabel: "Delivered",  icon: "📦", bg: "#f0fdf4" },
  { id: "#4764", items: "Brew Kit Deluxe",           date: "2 Mar 2026",  total: "$100.00", status: "warn", statusLabel: "Processing", icon: "⏳", bg: "#fffbeb" },
  { id: "#4740", items: "Canvas Tote Bag",           date: "22 Feb 2026", total: "$50.00",  status: "bad",  statusLabel: "Refunded",   icon: "↩️", bg: "#fff4f0" },
];


/* ─── Icons ─────────────────────────────────────────────────── */
const I = (d) => () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const GridIcon = I("M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z");
const CartIcon = I("M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0");
const TagIcon  = I("M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01");
const StarIcon = I("M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z");
const UserIcon = I("M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z");

const navItems = [
  { icon: GridIcon,  label: "Dashboard",  active: true },
  { icon: CartIcon,  label: "My Orders",  badge: "1" },
  { icon: TagIcon,   label: "Browse Products" },
  { icon: StarIcon,  label: "Loyalty Rewards" },
  { icon: UserIcon,  label: "My Profile" },
];

export default function ClientDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");

  return (
    <>
      <style>{css}</style>
      <div className="shell">

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-logo-mark">V</div>
            <span className="sidebar-logo-name">VendX POS</span>
          </div>

          <div className="sidebar-section">Menu</div>
          {navItems.map(({ icon: Icon, label, badge }) => (
            <a key={label}
              className={`nav-item ${activeNav === label ? "active" : ""}`}
              onClick={() => setActiveNav(label)} href="#">
              <Icon />
              {label}
              {badge && <span className="nav-badge">{badge}</span>}
            </a>
          ))}

          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="sidebar-avatar">AO</div>
              <div>
                <div className="sidebar-user-name">Amara Osei</div>
                <div className="sidebar-user-role">Gold Member</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── HEADER ── */}
        <header className="header">
          <div className="header-title">My Dashboard</div>
          <div className="header-store">
            <div className="store-dot" />
            Jane's Boutique · Downtown
          </div>
          <button className="header-btn">
            Shop Now
          </button>
        </header>

        {/* ── MAIN ── */}
        <main className="main">

          {/* welcome banner */}
          <div className="welcome-banner">
            <div style={{ position: "relative", zIndex: 1 }}>
              <div className="welcome-title">Welcome back, Amara 👋</div>
              <div className="welcome-sub">You're a Gold member. 320 points until Platinum!</div>
            </div>
            <div className="welcome-points">
              <div className="points-num">1,680</div>
              <div className="points-lbl">Loyalty Points</div>
            </div>
          </div>

          {/* stat cards */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Total Orders</div>
              <div className="stat-value">24</div>
              <div className="stat-sub">Since Jan 2025</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Spent</div>
              <div className="stat-value">$1,840</div>
              <div className="stat-sub">Lifetime value</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pending Orders</div>
              <div className="stat-value">1</div>
              <div className="stat-sub">In processing</div>
            </div>
          </div>

          {/* orders + sidebar */}
          <div className="two-col">

            {/* recent orders */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Recent Orders</span>
                <a className="card-action" href="#">View all</a>
              </div>
              {recentOrders.map(o => (
                <div className="order-row" key={o.id}>
                  <div className="order-icon" style={{ background: o.bg }}>{o.icon}</div>
                  <div>
                    <div className="order-id">{o.id}</div>
                    <div className="order-meta">{o.items}</div>
                    <div className="order-meta">{o.date}</div>
                  </div>
                  <div className="order-right">
                    <div className="order-total">{o.total}</div>
                    <div style={{ marginTop: 4 }}>
                      <span className={`badge ${o.status}`}>
                        <span className="badge-dot" />{o.statusLabel}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* right col */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

              {/* loyalty */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Loyalty Progress</span>
                  <span className="card-action">Redeem</span>
                </div>
                <div className="card-body">
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                    <span>Gold</span><span>Platinum</span>
                  </div>
                  <div className="loyalty-track">
                    <div className="loyalty-fill" style={{ width: "84%" }} />
                  </div>
                  <div className="loyalty-steps">
                    <span>1,680 pts</span>
                    <span>2,000 pts</span>
                  </div>
                  <div className="loyalty-reward">
                    <span className="reward-icon">🎁</span>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 12 }}>320 pts to go</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>Unlock Platinum — free shipping &amp; 10% off</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* quick actions */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Quick Actions</span>
                </div>
                <div className="card-body">
                  <div className="quick-grid">
                    {[
                      { icon: "🛍️", label: "Browse Store",    sub: "Shop products" },
                      { icon: "📦", label: "Track Order",     sub: "Live updates" },
                      { icon: "↩️", label: "Request Refund",  sub: "Easy returns" },
                      { icon: "💬", label: "Get Support",     sub: "Chat with us" },
                    ].map(q => (
                      <button className="quick-btn" key={q.label}>
                        <span className="quick-icon">{q.icon}</span>
                        <span className="quick-label">{q.label}</span>
                        <span className="quick-sub">{q.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* store info */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Your Store</span>
                </div>
                <div className="card-body" style={{ paddingTop: 0, paddingBottom: 0 }}>
                  {[
                    { label: "Store name",  val: "Jane's Boutique" },
                    { label: "Domain",      val: "janes.vendx.app" },
                    { label: "Location",    val: "Downtown, Nairobi" },
                    { label: "Hours",       val: "Mon–Sat 9am–7pm" },
                  ].map(s => (
                    <div className="store-info-row" key={s.label}>
                      <span className="store-info-label">{s.label}</span>
                      <span className="store-info-val">{s.val}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}
