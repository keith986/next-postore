"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

/* ── Icon paths ── */
const iconPaths: Record<string, string> = {
  grid:      "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  cart:      "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0",
  box:       "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12",
  users:     "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  chart:     "M18 20V10M12 20V4M6 20v-6",
  tag:       "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
  staff:     "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  cog:       "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  logout:    "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  calendar:  "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  utensils:  "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zM21 22v-7",
  clipboard: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  truck:     "M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  layers:    "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  scissors:  "M6 9a3 3 0 100-6 3 3 0 000 6zM6 21a3 3 0 100-6 3 3 0 000 6zM20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12",
  package:   "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12",
  pill:      "M10.5 4.5a6 6 0 000 12h3a6 6 0 000-12h-3zM7.5 10.5h9",
  flask:     "M9 3h6M9 3v5l-4 9a1 1 0 00.9 1.5h12.2a1 1 0 00.9-1.5L15 8V3",
  heart:     "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
  switch:    "M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4",
  chevron:   "M6 9l6 6 6-6",
};

type NavItem    = { href: string; icon: string; label: string };
type NavSection = { title: string; items: NavItem[] };
type PosType    = "retail" | "restaurant" | "salon" | "wholesale" | "pharmacy";

/* ── Nav per POS type ── */
/* ── Shared base nav — present in ALL pos types ── */
const BASE_MAIN: NavItem[] = [
  { href: "/admin/dashboard", icon: "grid",  label: "Overview"  },
  { href: "/admin/orders",    icon: "cart",  label: "Orders"    },
  { href: "/admin/inventory", icon: "box",   label: "Inventory" },
  { href: "/admin/customers", icon: "users", label: "Customers" },
  { href: "/admin/analytics", icon: "chart", label: "Analytics" },
];

const BASE_STORE: NavItem[] = [
  { href: "/admin/products",  icon: "tag",   label: "Products"  },
  { href: "/admin/staff",     icon: "staff", label: "Staff"     },
  { href: "/admin/settings",  icon: "cog",   label: "Settings"  },
];

const NAV_CONFIG: Record<PosType, NavSection[]> = {
  /* ── RETAIL: base only ── */
  retail: [
    { title: "Main",  items: BASE_MAIN },
    { title: "Store", items: BASE_STORE },
  ],

  /* ── RESTAURANT: base + Tables / Menu ── */
  restaurant: [
    { title: "Main", items: [
      ...BASE_MAIN,
      { href: "/admin/tables", icon: "utensils", label: "Tables" },
    ]},
    { title: "Kitchen", items: [
      { href: "/admin/menu", icon: "clipboard", label: "Menu" },
      ...BASE_STORE,
    ]},
  ],

  /* ── SALON: base + Appointments / Services ── */
  salon: [
    { title: "Main", items: [
      BASE_MAIN[0],                                                    // Overview
      { href: "/admin/appointments", icon: "calendar", label: "Appointments" },
      { href: "/admin/orders",       icon: "cart",     label: "Sales"        },
      { href: "/admin/customers", icon: "users", label: "Clients" },
      BASE_MAIN[4],                                                    // Analytics
    ]},
    { title: "Business", items: [
      { href: "/admin/services", icon: "scissors", label: "Services" },
      ...BASE_STORE,
    ]},
  ],

  /* ── WHOLESALE: base + Suppliers / Price Tiers ── */
  wholesale: [
    { title: "Main",      items: BASE_MAIN },
    { title: "Wholesale", items: [
      ...BASE_STORE.slice(0, 1),                                       // Products
      { href: "/admin/suppliers",   icon: "truck",  label: "Suppliers"   },
      { href: "/admin/price-tiers", icon: "layers", label: "Price Tiers" },
      ...BASE_STORE.slice(1),                                          // Staff + Settings
    ]},
  ],

  /* ── PHARMACY: base (Customers→Patients) + Prescriptions / Drugs ── */
  pharmacy: [
    { title: "Main", items: [
      BASE_MAIN[0],                                                    // Overview
      { href: "/admin/orders",    icon: "cart",  label: "Sales"     },
      BASE_MAIN[2],                                                    // Inventory
      { href: "/admin/customers", icon: "users", label: "Patients"  },
      BASE_MAIN[4],                                                    // Analytics
    ]},
    { title: "Pharmacy", items: [
      { href: "/admin/products",      icon: "pill",  label: "Drugs"         },
      { href: "/admin/prescriptions", icon: "flask", label: "Prescriptions" },
      ...BASE_STORE.slice(1),                                          // Staff + Settings
    ]},
  ],
};

const POS_TYPES_META: { id: PosType; label: string; svgIcon: string; accent: string; bg: string }[] = [
  { id: "retail",     label: "Retail Store",     svgIcon: "tag",      accent: "#2563eb", bg: "#eff6ff" },
  { id: "restaurant", label: "Restaurant",       svgIcon: "utensils", accent: "#d97706", bg: "#fffbeb" },
  { id: "salon",      label: "Salon & Services", svgIcon: "scissors", accent: "#7c3aed", bg: "#f5f3ff" },
  { id: "wholesale",  label: "Wholesale",        svgIcon: "package",  accent: "#16a34a", bg: "#f0fdf4" },
  { id: "pharmacy",   label: "Pharmacy",         svgIcon: "pill",     accent: "#0891b2", bg: "#ecfeff" },
];

interface User {
  id:        string;
  full_name: string;
  email:     string;
  role:      string;
  store_name: string | null;
  pos_type?: PosType;
  domain?:    string;
}

function Icon({ type }: { type: string }) {
  const d = iconPaths[type] ?? iconPaths.cog;
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

/* ── POS Switcher Modal ── */
function SwitcherModal({
  current, onClose, onSwitch,
}: {
  current:  PosType;
  onClose:  () => void;
  onSwitch: (t: PosType) => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 2000 }}
      />
      {/* Modal */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        background: "#1a1a14", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16, padding: "1.5rem",
        width: "100%", maxWidth: 380,
        zIndex: 2001,
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        animation: "switcherIn 0.2s ease",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <style>{`@keyframes switcherIn{from{opacity:0;transform:translate(-50%,-46%)}to{opacity:1;transform:translate(-50%,-50%)}}`}</style>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Switch POS Type</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              Changes your dashboard and sidebar navigation
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, lineHeight: 1 }}>
            ×
          </button>
        </div>

        {/* POS type list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {POS_TYPES_META.map(type => {
            const isCurrent = type.id === current;
            return (
              <button
                key={type.id}
                onClick={() => !isCurrent && onSwitch(type.id)}
                disabled={isCurrent}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "0.75rem 1rem",
                  background: isCurrent ? `${type.accent}22` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${isCurrent ? type.accent + "55" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 10,
                  cursor: isCurrent ? "default" : "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                  width: "100%",
                  textAlign: "left",
                }}
                onMouseEnter={e => {
                  if (!isCurrent) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.09)";
                }}
                onMouseLeave={e => {
                  if (!isCurrent) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                }}
              >
                {/* Icon */}
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${type.accent}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: type.accent }}>
                  <Icon type={type.svgIcon} />
                </div>

                {/* Label */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: isCurrent ? "#fff" : "rgba(255,255,255,0.75)" }}>
                    {type.label}
                  </div>
                </div>

                {/* Current badge / arrow */}
                {isCurrent ? (
                  <span style={{ fontSize: 10, fontWeight: 600, color: type.accent, background: `${type.accent}22`, padding: "2px 8px", borderRadius: 100 }}>
                    Active
                  </span>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: "1rem", marginBottom: 0, textAlign: "center" }}>
          Your data is preserved when switching types
        </p>
      </div>
    </>
  );
}

export default function Sidebar() {
  const pathname = usePathname() || "/admin/dashboard";
  const router   = useRouter();
  const [user,            setUser]           = useState<User | null>(null);
  const [pendingOrders,   setPendingOrders]  = useState(0);
  const [switcherOpen,    setSwitcherOpen]   = useState(false);
  const [switching,       setSwitching]      = useState(false);
  const [logoutConfirm,   setLogoutConfirm]  = useState(false);

  useEffect(() => {
  const stored = localStorage.getItem("user");
  if (!stored) { 
    window.location.href = "https://pos.upendoapps.com";
    return; 
  }
  try {
    const parsed = JSON.parse(stored) as User;
    if (!parsed.id || !parsed.full_name) throw new Error();

    // Check subscription before allowing access
    fetch(`/api/subscription/status?user_id=${parsed.id}`)
      .then(r => r.json())
      .then(d => {
        if (!d.active) {
          window.location.href = "https://pos.upendoapps.com/payment";
          return;
        }
        if (!parsed.pos_type) {
          window.location.href = "https://pos.upendoapps.com/onboarding";
          return;
        }
        setUser(parsed);
      })
      .catch(() => {
        // Silent fail — allow access on network error
        if (!parsed.pos_type) {
          window.location.href = "https://pos.upendoapps.com/onboarding";
          return;
        }
        setUser(parsed);
      });
  } catch {
    localStorage.removeItem("user");
    window.location.href = "https://pos.upendoapps.com";
  }
}, [router]);

  const fetchPendingCount = useCallback(async (id: string) => {
    try {
      const res  = await fetch(`/api/orders/pending-count?admin_id=${id}`);
      const data = await res.json();
      if (res.ok && typeof data.count === "number") setPendingOrders(data.count);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetchPendingCount(user.id);
    const t = setInterval(() => fetchPendingCount(user.id), 60000);
    return () => clearInterval(t);
  }, [user?.id, fetchPendingCount]);

  /* ── Switch POS type ── */
  const handleSwitch = async (newType: PosType) => {
    if (!user) return;
    setSwitching(true);
    try {
      const res = await fetch("/api/onboarding", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ admin_id: user.id, pos_type: newType }),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = { ...user, pos_type: newType };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
      setSwitcherOpen(false);
      router.push("/admin/dashboard");
    } catch { /* silent — switcher stays open */ }
    finally { setSwitching(false); }
  };

  const isActive = (href: string) =>
    href === '/admin/dashboard'
      ? pathname === href || pathname === '/admin'
      : pathname.startsWith(href);

  const doLogout    = () => { localStorage.removeItem("user"); localStorage.removeItem("read_notifs"); window.location.href = "https://pos.upendoapps.com?logout=true"; };
  const handleLogout = () => setLogoutConfirm(true);

  const posType  = (user?.pos_type ?? "retail") as PosType;
  const sections = NAV_CONFIG[posType] ?? NAV_CONFIG.retail;
  const posMeta  = POS_TYPES_META.find(t => t.id === posType);

  if (!user) return null;

  return (
    <>
      {switcherOpen && user && (
        <SwitcherModal
          current={posType}
          onClose={() => setSwitcherOpen(false)}
          onSwitch={handleSwitch}
        />
      )}

      {/* ── Logout Confirm Modal ── */}
      {logoutConfirm && (
        <>
          <div onClick={() => setLogoutConfirm(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 2000 }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#1a1a14", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16, padding: "1.75rem",
            width: "100%", maxWidth: 340,
            zIndex: 2001,
            boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
            animation: "switcherIn 0.2s ease",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {/* Icon */}
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(220,38,38,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </div>

            <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 8 }}>
              Sign out?
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              You will be redirected to the login page. Any unsaved changes will be lost.
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setLogoutConfirm(false)}
                style={{ flex: 1, padding: "9px 0", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 13, color: "rgba(255,255,255,0.7)", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"}
              >
                Cancel
              </button>
              <button
                onClick={doLogout}
                style={{ flex: 1, padding: "9px 0", background: "#dc2626", border: "none", borderRadius: 8, fontSize: 13, color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#b91c1c"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "#dc2626"}
              >
                Sign out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Logout confirm modal */}
      {logoutConfirm && (
        <>
          <div onClick={() => setLogoutConfirm(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 2000 }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "#1a1a14", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: "1.75rem", width: "100%", maxWidth: 340, zIndex: 2001, boxShadow: "0 24px 60px rgba(0,0,0,0.5)", animation: "switcherIn 0.2s ease", fontFamily: "'DM Sans', sans-serif" }}>
            {/* Icon */}
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.1rem", color: "#ef4444" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={iconPaths.logout} />
              </svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 6 }}>Sign out?</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              You will be returned to the login screen. Any unsaved changes will be lost.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setLogoutConfirm(false)} style={{ flex: 1, padding: "9px 0", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, fontSize: 13, color: "rgba(255,255,255,0.7)", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
                Cancel
              </button>
              <button onClick={doLogout} style={{ flex: 1, padding: "9px 0", background: "#dc2626", border: "none", borderRadius: 9, fontSize: 13, color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                Sign out
              </button>
            </div>
          </div>
        </>
      )}

      <aside className="sidebar">
        {/* Logo + POS type badge — clickable to open switcher */}
        <div className="sidebar-logo" style={{ cursor: "pointer" }} onClick={() => setSwitcherOpen(true)}>
          <div className="sidebar-logo-mark">
            {user?.store_name?.charAt(0).toUpperCase() ?? "P"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="sidebar-logo-name">
              {user
                ? (user.store_name?.charAt(0).toUpperCase() ?? "") + (user.store_name?.slice(1).toLowerCase() ?? "")
                : "POStore"}
            </span>
            {posMeta && (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ display: "inline-flex", alignItems: "center", opacity: 0.6 }}><Icon type={posMeta.svgIcon} /></span>
                <span>{posMeta.label}</span>
              </div>
            )}
          </div>
          {/* Switch indicator */}
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", color: "rgba(255,255,255,0.25)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d={iconPaths.chevron} />
            </svg>
          </div>
        </div>

        {/* Dynamic nav sections */}
        {sections.map(section => (
          <div key={section.title}>
            <div className="sidebar-section">{section.title}</div>
            {section.items.map(({ href, icon, label }) => (
              <Link key={href} href={href} className={`nav-item ${isActive(href) ? "active" : ""}`}>
                <Icon type={icon} />
                {label}
                {href === "/admin/orders" && pendingOrders > 0 && (
                  <span className="nav-badge">{pendingOrders > 99 ? "99+" : pendingOrders}</span>
                )}
              </Link>
            ))}
          </div>
        ))}

        {/* Switch POS type button */}
        <div style={{ padding: "0 0.75rem", marginTop: "0.5rem" }}>
          <button
            onClick={() => setSwitcherOpen(true)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 9,
              padding: "0.6rem 0.85rem",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, cursor: "pointer", fontFamily: "inherit",
              color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 500,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.85)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={iconPaths.switch} />
            </svg>
            {switching ? "Switching…" : "Switch POS Type"}
            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", opacity: 0.6 }}><Icon type={posMeta?.svgIcon ?? "cog"} /></span>
          </button>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user ? getInitials(user.full_name) : "—"}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-user-name">{user?.full_name || "Loading…"}</div>
              <div className="sidebar-user-role">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""}</div>
            </div>
            <button onClick={handleLogout} title="Sign out" style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", borderRadius: "5px", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", transition: "color 0.15s, background 0.15s", flexShrink: 0 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#fff"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)"; (e.currentTarget as HTMLButtonElement).style.background = "none"; }}>
              <Icon type="logout" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}