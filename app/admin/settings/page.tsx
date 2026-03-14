"use client";

import { useState, useEffect, useCallback } from "react";

/* ── Types ── */
interface StoreSettings {
  store_name:  string;
  domain:      string;
  email:       string;
  phone:       string;
  address:     string;
  currency:    string;
  timezone:    string;
}
interface TaxSettings {
  tax_enabled:    boolean;
  tax_rate:       string;
  tax_name:       string;
  tax_inclusive:  boolean;
  receipt_footer: string;
}
interface NotifSettings {
  notif_new_order:    boolean;
  notif_low_stock:    boolean;
  notif_daily_report: boolean;
  notif_staff_login:  boolean;
  notif_email:        string;
}
interface SecurityForm {
  currentPassword: string;
  newPassword:     string;
  confirmPassword: string;
}
interface ProfileForm {
  firstName: string;
  lastName:  string;
  email:     string;
  phone:     string;
}
interface StoredUser {
  id:         string;
  full_name:  string;
  email:      string;
  role:       string;
  store_name: string | null;
  domain:     string | null;
  phone:      string | null;
  address:    string | null;
}
interface ConfirmState {
  open:     boolean;
  title:    string;
  message:  string;
  danger:   boolean;
  onConfirm: () => void;
}

const TABS = ["Store", "Profile", "Tax & Billing", "Notifications", "Security", "Danger Zone"] as const;
type Tab = typeof TABS[number];

/* ── Helpers ── */
function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/* ── Shared styles ── */
const fieldStyle: React.CSSProperties = {
  width: "100%", background: "#f5f4f0",
  border: "1px solid #c8c6bc", borderRadius: 8,
  padding: "9px 12px", color: "#141410",
  fontFamily: "inherit", fontSize: 14, outline: "none",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 500,
  letterSpacing: "0.5px", textTransform: "uppercase",
  color: "#4a4a40", marginBottom: 5,
};
const sectionStyle: React.CSSProperties  = { display: "flex", flexDirection: "column", gap: "1.1rem" };
const rowStyle: React.CSSProperties      = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" };
const cardStyle: React.CSSProperties     = { background: "#fff", border: "1px solid #e2e0d8", borderRadius: 12, overflow: "hidden" };
const cardHeaderStyle: React.CSSProperties = { padding: "1rem 1.25rem", borderBottom: "1px solid #e2e0d8", display: "flex", alignItems: "center", justifyContent: "space-between" };
const cardBodyStyle: React.CSSProperties = { padding: "1.25rem" };

/* ─────────────────────────────────────────
   CONFIRM MODAL
───────────────────────────────────────── */
function ConfirmModal({ state, onCancel }: { state: ConfirmState; onCancel: () => void }) {
  if (!state.open) return null;
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 1000,
          animation: "fadeIn 0.15s ease",
        }}
      />
      {/* Dialog */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        background: "#fff",
        borderRadius: 14,
        padding: "1.75rem",
        width: "100%", maxWidth: 400,
        zIndex: 1001,
        boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
        animation: "slideUp 0.2s ease",
      }}>
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: state.danger ? "#fef2f2" : "#f5f4f0",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, marginBottom: "1rem",
        }}>
          {state.danger ? "⚠️" : "💾"}
        </div>

        <div style={{ fontSize: 15, fontWeight: 600, color: "#141410", marginBottom: 8 }}>
          {state.title}
        </div>
        <div style={{ fontSize: 13, color: "#9a9a8e", lineHeight: 1.6, marginBottom: "1.5rem" }}>
          {state.message}
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 18px", background: "#fff",
              color: "#4a4a40", border: "1px solid #c8c6bc",
              borderRadius: 8, fontSize: 13, cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => { state.onConfirm(); onCancel(); }}
            style={{
              padding: "8px 18px",
              background: state.danger ? "#dc2626" : "#141410",
              color: "#fff", border: "none",
              borderRadius: 8, fontSize: 13, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {state.danger ? "Yes, proceed" : "Confirm"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translate(-50%,-46%)} to{opacity:1;transform:translate(-50%,-50%)} }
      `}</style>
    </>
  );
}

/* ── Toast ── */
function Toast({ msg, type = "success" }: { msg: string; type?: "success" | "error" }) {
  return (
    <div style={{
      position: "fixed", bottom: "2rem", right: "2rem",
      background: type === "error" ? "#dc2626" : "#141410",
      color: "#fff", padding: "0.85rem 1.25rem", borderRadius: 10,
      fontSize: 13, display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
      animation: "toastIn 0.3s ease", zIndex: 1100,
    }}>
      <span style={{ fontSize: 16 }}>{type === "error" ? "❌" : "✅"}</span> {msg}
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

/* ── Toggle ── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{ width: 44, height: 24, borderRadius: 100, background: checked ? "#141410" : "#e2e0d8", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 3, left: checked ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

/* ── Save Button ── */
function SaveButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <button
      onClick={onClick} disabled={loading}
      style={{ padding: "9px 24px", background: loading ? "#9a9a8e" : "#141410", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "background 0.15s" }}
      onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#2a2a22"; }}
      onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#141410"; }}
    >
      {loading ? "Saving…" : "Save Changes"}
    </button>
  );
}

/* ── Spinner ── */
function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem", color: "#9a9a8e", fontSize: 13, gap: 10 }}>
      <div style={{ width: 18, height: 18, border: "2px solid #e2e0d8", borderTopColor: "#141410", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      Loading settings…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function AdminSettingsPage() {
  const [activeTab,  setActiveTab]  = useState<Tab>("Store");
  const [toast,      setToast]      = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [saving,     setSaving]     = useState(false);
  const [fetching,   setFetching]   = useState(true);

  /* ── Confirm modal state ── */
  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false, title: "", message: "", danger: false, onConfirm: () => {},
  });

  const openConfirm = (title: string, message: string, danger: boolean, onConfirm: () => void) => {
    setConfirm({ open: true, title, message, danger, onConfirm });
  };
  const closeConfirm = () => setConfirm(c => ({ ...c, open: false }));

  const user = getStoredUser();

  /* ── Form state — store pre-filled from localStorage ── */
  const [store, setStore] = useState<StoreSettings>({
    store_name: user?.store_name ?? "",
    domain:     user?.domain     ?? "",
    email:      user?.email      ?? "",
    phone:      user?.phone      ?? "",
    address:    user?.address    ?? "",
    currency:   "KES",
    timezone:   "Africa/Nairobi",
  });
  const [tax, setTax] = useState<TaxSettings>({
    tax_enabled: true, tax_rate: "16", tax_name: "VAT", tax_inclusive: false, receipt_footer: "",
  });
  const [notif, setNotif] = useState<NotifSettings>({
    notif_new_order: true, notif_low_stock: true, notif_daily_report: false, notif_staff_login: false, notif_email: "",
  });
  const [profile, setProfile] = useState<ProfileForm>({
    firstName: "", lastName: "", email: "", phone: "",
  });
  const [security, setSecurity] = useState<SecurityForm>({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });

  /* ── Toast helper ── */
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Fetch settings ── */
  const fetchSettings = useCallback(async () => {
    setFetching(true);
    try {
      const res  = await fetch("/api/settings");
      const data = await res.json();
      // Store info: prefer localStorage for user-specific fields, API for regional settings
      setStore({
        store_name: user?.store_name ?? data.store_name ?? "",
        domain:     user?.domain     ?? data.domain     ?? "",
        email:      user?.email      ?? data.email      ?? "",
        phone:      user?.phone      ?? data.phone      ?? "",
        address:    data.address     ?? user?.address   ?? "",
        currency:   data.currency    ?? "KES",
        timezone:   data.timezone    ?? "Africa/Nairobi",
      });
      setTax({ tax_enabled: !!data.tax_enabled, tax_rate: String(data.tax_rate ?? "16"), tax_name: data.tax_name ?? "VAT", tax_inclusive: !!data.tax_inclusive, receipt_footer: data.receipt_footer ?? "" });
      setNotif({ notif_new_order: !!data.notif_new_order, notif_low_stock: !!data.notif_low_stock, notif_daily_report: !!data.notif_daily_report, notif_staff_login: !!data.notif_staff_login, notif_email: data.notif_email ?? "" });
      if (user) {
        const parts = user.full_name.split(" ");
        setProfile({ firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") ?? "", email: user.email ?? "", phone: "" });
      }
    } catch {
      showToast("Failed to load settings", "error");
    } finally {
      setFetching(false);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  /* ── Actual save actions (called after confirm) ── */
  const doSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...store, ...tax, ...notif }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Keep localStorage in sync with updated store fields
      const updatedUser = getStoredUser();
      if (updatedUser) {
        localStorage.setItem("user", JSON.stringify({
          ...updatedUser,
          store_name: store.store_name,
          domain:     store.domain,
          email:      store.email,
          phone:      store.phone,
          address:    store.address,
        }));
      }
      showToast("Settings saved successfully");
    } catch (err) {
      showToast((err as Error).message || "Failed to save", "error");
    } finally { setSaving(false); }
  };

  const doSaveProfile = async () => {
    if (!user) return showToast("Not logged in", "error");
    setSaving(true);
    try {
      const res = await fetch("/api/settings/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: user.id, full_name: `${profile.firstName} ${profile.lastName}`.trim(), email: profile.email, phone: profile.phone }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem("user", JSON.stringify({ ...user, ...data.user }));
      showToast("Profile updated successfully");
    } catch (err) {
      showToast((err as Error).message || "Failed to update profile", "error");
    } finally { setSaving(false); }
  };

  const doChangePassword = async () => {
    if (!user) return showToast("Not logged in", "error");
    setSaving(true);
    try {
      const res = await fetch("/api/settings/password", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: user.id, currentPassword: security.currentPassword, newPassword: security.newPassword }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("Password updated successfully");
      setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      showToast((err as Error).message || "Failed to update password", "error");
    } finally { setSaving(false); }
  };

  /* ── Confirm wrappers (open modal → then do action) ── */
  const handleSave = () =>
    openConfirm("Save Settings", "Are you sure you want to save these changes?", false, doSave);

  const handleSaveProfile = () =>
    openConfirm("Update Profile", "This will update your name, email and phone number.", false, doSaveProfile);

  const handleChangePassword = () => {
    if (!security.currentPassword || !security.newPassword) return showToast("Please fill in all password fields.", "error");
    if (security.newPassword !== security.confirmPassword) return showToast("New passwords do not match.", "error");
    if (security.newPassword.length < 8) return showToast("Password must be at least 8 characters.", "error");
    openConfirm("Change Password", "Are you sure you want to change your password? You will need to use the new password on your next login.", false, doChangePassword);
  };

  const initials = user
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "—";

  const dater = new Intl.DateTimeFormat("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  }).format(new Date());

  return (
    <>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <ConfirmModal state={confirm} onCancel={closeConfirm} />

      <header className="header">
        <div className="header-title">Settings</div>
        <div className="header-date">{dater}</div>
      </header>

      <main className="main">

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 2, background: "#fff", border: "1px solid #e2e0d8", borderRadius: 10, padding: 4, width: "fit-content", flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: "7px 16px", border: "none", borderRadius: 7,
              fontFamily: "inherit", fontSize: 13, cursor: "pointer", transition: "all 0.15s",
              background: activeTab === t ? (t === "Danger Zone" ? "#dc2626" : "#141410") : "transparent",
              color: activeTab === t ? "#fff" : (t === "Danger Zone" ? "#dc2626" : "#9a9a8e"),
              fontWeight: activeTab === t ? 500 : 400,
            }}>
              {t}
            </button>
          ))}
        </div>

        {fetching ? <Spinner /> : (
          <>
            {/* ══ STORE ══ */}
            {activeTab === "Store" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={cardStyle}>
                  <div style={cardHeaderStyle}><span style={{ fontSize: 13, fontWeight: 500 }}>Store Information</span></div>
                  <div style={cardBodyStyle}>
                    <div style={sectionStyle}>
                      <div style={rowStyle}>
                        <div>
                          <label style={labelStyle}>Store Name</label>
                          <input style={fieldStyle} value={store.store_name} onChange={e => setStore(s => ({ ...s, store_name: e.target.value }))} />
                        </div>
                        <div>
                          <label style={labelStyle}>Domain</label>
                          <div style={{ display: "flex", alignItems: "stretch", background: "#f5f4f0", border: "1px solid #c8c6bc", borderRadius: 8, overflow: "hidden" }}>
                            <input style={{ ...fieldStyle, border: "none", background: "transparent", flex: 1 }} value={store.domain} onChange={e => setStore(s => ({ ...s, domain: e.target.value }))} />
                            <span style={{ padding: "0 12px", background: "#e2e0d8", fontSize: 12, fontWeight: 500, color: "#4a4a40", display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>.postore.app</span>
                          </div>
                        </div>
                      </div>
                      <div style={rowStyle}>
                        <div>
                          <label style={labelStyle}>Contact Email</label>
                          <input style={fieldStyle} type="email" value={store.email} onChange={e => setStore(s => ({ ...s, email: e.target.value }))} />
                        </div>
                        <div>
                          <label style={labelStyle}>Phone Number</label>
                          <input style={fieldStyle} value={store.phone} onChange={e => setStore(s => ({ ...s, phone: e.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Address</label>
                        <input style={fieldStyle} value={store.address} onChange={e => setStore(s => ({ ...s, address: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={cardStyle}>
                  <div style={cardHeaderStyle}><span style={{ fontSize: 13, fontWeight: 500 }}>Regional Settings</span></div>
                  <div style={cardBodyStyle}>
                    <div style={rowStyle}>
                      <div>
                        <label style={labelStyle}>Currency</label>
                        <select style={{ ...fieldStyle, cursor: "pointer" }} value={store.currency} onChange={e => setStore(s => ({ ...s, currency: e.target.value }))}>
                          <option value="KES">KES — Kenyan Shilling</option>
                          <option value="USD">USD — US Dollar</option>
                          <option value="EUR">EUR — Euro</option>
                          <option value="GBP">GBP — British Pound</option>
                          <option value="UGX">UGX — Ugandan Shilling</option>
                          <option value="TZS">TZS — Tanzanian Shilling</option>
                          <option value="NGN">NGN — Nigerian Naira</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Timezone</label>
                        <select style={{ ...fieldStyle, cursor: "pointer" }} value={store.timezone} onChange={e => setStore(s => ({ ...s, timezone: e.target.value }))}>
                          <option value="Africa/Nairobi">Africa/Nairobi (EAT +3)</option>
                          <option value="Africa/Lagos">Africa/Lagos (WAT +1)</option>
                          <option value="Africa/Cairo">Africa/Cairo (EET +2)</option>
                          <option value="Europe/London">Europe/London (GMT +0)</option>
                          <option value="America/New_York">America/New_York (EST -5)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <SaveButton onClick={handleSave} loading={saving} />
                </div>
              </div>
            )}

            {/* ══ PROFILE ══ */}
            {activeTab === "Profile" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={cardStyle}>
                  <div style={cardHeaderStyle}><span style={{ fontSize: 13, fontWeight: 500 }}>Admin Profile</span></div>
                  <div style={cardBodyStyle}>
                    <div style={sectionStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.5rem 0" }}>
                        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#141410", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 500, flexShrink: 0 }}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>{user?.full_name ?? "Admin"}</div>
                          <div style={{ fontSize: 12, color: "#9a9a8e", marginTop: 2 }}>{user?.role ?? "admin"} · {user?.email ?? ""}</div>
                        </div>
                      </div>
                      <div style={{ height: 1, background: "#e2e0d8" }} />
                      <div style={rowStyle}>
                        <div>
                          <label style={labelStyle}>First Name</label>
                          <input style={fieldStyle} value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} />
                        </div>
                        <div>
                          <label style={labelStyle}>Last Name</label>
                          <input style={fieldStyle} value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} />
                        </div>
                      </div>

                      <div>
                        <label style={labelStyle}>Role</label>
                        <input style={{ ...fieldStyle, background: "#e2e0d8", color: "#9a9a8e", cursor: "not-allowed" }} value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Admin"} readOnly />
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <SaveButton onClick={handleSaveProfile} loading={saving} />
                </div>
              </div>
            )}

            {/* ══ TAX & BILLING ══ */}
            {activeTab === "Tax & Billing" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={cardStyle}>
                  <div style={cardHeaderStyle}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>Tax Configuration</span>
                    <Toggle checked={tax.tax_enabled} onChange={() => setTax(t => ({ ...t, tax_enabled: !t.tax_enabled }))} />
                  </div>
                  <div style={{ ...cardBodyStyle, opacity: tax.tax_enabled ? 1 : 0.4, pointerEvents: tax.tax_enabled ? "auto" : "none", transition: "opacity 0.2s" }}>
                    <div style={sectionStyle}>
                      <div style={rowStyle}>
                        <div>
                          <label style={labelStyle}>Tax Name</label>
                          <input style={fieldStyle} value={tax.tax_name} onChange={e => setTax(t => ({ ...t, tax_name: e.target.value }))} placeholder="e.g. VAT, GST" />
                        </div>
                        <div>
                          <label style={labelStyle}>Tax Rate (%)</label>
                          <input style={fieldStyle} type="number" min="0" max="100" value={tax.tax_rate} onChange={e => setTax(t => ({ ...t, tax_rate: e.target.value }))} />
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: "#f5f4f0", borderRadius: 8 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>Tax Inclusive Pricing</div>
                          <div style={{ fontSize: 12, color: "#9a9a8e", marginTop: 2 }}>Product prices already include tax</div>
                        </div>
                        <Toggle checked={tax.tax_inclusive} onChange={() => setTax(t => ({ ...t, tax_inclusive: !t.tax_inclusive }))} />
                      </div>
                      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.75rem 1rem", fontSize: 12, color: "#1e40af" }}>
                        💡 With {tax.tax_name || "tax"} at {tax.tax_rate || 0}%, a $100 item will show ${(100 * (1 + Number(tax.tax_rate) / 100)).toFixed(2)} at checkout.
                      </div>
                    </div>
                  </div>
                </div>
                <div style={cardStyle}>
                  <div style={cardHeaderStyle}><span style={{ fontSize: 13, fontWeight: 500 }}>Receipt Settings</span></div>
                  <div style={cardBodyStyle}>
                    <div style={sectionStyle}>
                      <div>
                        <label style={labelStyle}>Receipt Footer Message</label>
                        <textarea style={{ ...fieldStyle, resize: "vertical", minHeight: 80 } as React.CSSProperties} value={tax.receipt_footer} onChange={e => setTax(t => ({ ...t, receipt_footer: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <SaveButton onClick={handleSave} loading={saving} />
                </div>
              </div>
            )}

            {/* ══ NOTIFICATIONS ══ */}
            {activeTab === "Notifications" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={cardStyle}>
                  <div style={cardHeaderStyle}><span style={{ fontSize: 13, fontWeight: 500 }}>Email Notifications</span></div>
                  <div style={cardBodyStyle}>
                    {[
                      { key: "notif_new_order",    label: "New Order",      desc: "Get notified whenever a new sale is recorded" },
                      { key: "notif_low_stock",    label: "Low Stock Alert", desc: "Alert when a product drops below 10 units" },
                      { key: "notif_daily_report", label: "Daily Summary",   desc: "Receive a daily sales report every morning" },
                      { key: "notif_staff_login",  label: "Staff Login",     desc: "Alert when a staff member signs in" },
                    ].map(({ key, label, desc }) => (
                      <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem 0", borderBottom: "1px solid #e2e0d8" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
                          <div style={{ fontSize: 12, color: "#9a9a8e", marginTop: 2 }}>{desc}</div>
                        </div>
                        <Toggle
                          checked={notif[key as keyof NotifSettings] as boolean}
                          onChange={() => setNotif(n => ({ ...n, [key]: !n[key as keyof NotifSettings] }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div style={cardStyle}>
                  <div style={cardHeaderStyle}><span style={{ fontSize: 13, fontWeight: 500 }}>Notification Email</span></div>
                  <div style={cardBodyStyle}>
                    <label style={labelStyle}>Send notifications to</label>
                    <input style={fieldStyle} type="email" value={notif.notif_email} onChange={e => setNotif(n => ({ ...n, notif_email: e.target.value }))} />
                    <p style={{ fontSize: 12, color: "#9a9a8e", marginTop: 6 }}>You can add multiple emails separated by commas.</p>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <SaveButton onClick={handleSave} loading={saving} />
                </div>
              </div>
            )}

            {/* ══ SECURITY ══ */}
            {activeTab === "Security" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={cardStyle}>
                  <div style={cardHeaderStyle}><span style={{ fontSize: 13, fontWeight: 500 }}>Change Password</span></div>
                  <div style={cardBodyStyle}>
                    <div style={sectionStyle}>
                      <div>
                        <label style={labelStyle}>Current Password</label>
                        <input style={fieldStyle} type="password" placeholder="Enter current password" value={security.currentPassword} onChange={e => setSecurity(s => ({ ...s, currentPassword: e.target.value }))} />
                      </div>
                      <div style={rowStyle}>
                        <div>
                          <label style={labelStyle}>New Password</label>
                          <input style={fieldStyle} type="password" placeholder="Min. 8 characters" value={security.newPassword} onChange={e => setSecurity(s => ({ ...s, newPassword: e.target.value }))} />
                        </div>
                        <div>
                          <label style={labelStyle}>Confirm New Password</label>
                          <input
                            style={{ ...fieldStyle, borderColor: security.confirmPassword && security.confirmPassword !== security.newPassword ? "#dc2626" : security.confirmPassword ? "#16a34a" : "#c8c6bc" }}
                            type="password" placeholder="Repeat new password"
                            value={security.confirmPassword}
                            onChange={e => setSecurity(s => ({ ...s, confirmPassword: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          onClick={handleChangePassword}
                          disabled={saving}
                          style={{ padding: "9px 20px", background: saving ? "#9a9a8e" : "#141410", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                        >
                          {saving ? "Updating…" : "Update Password"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={cardStyle}>
                  <div style={cardHeaderStyle}><span style={{ fontSize: 13, fontWeight: 500 }}>Active Sessions</span></div>
                  <div style={cardBodyStyle}>
                    {[
                      { device: "Chrome on Windows", location: "Nairobi, Kenya", time: "Now",         current: true  },
                      { device: "Safari on iPhone",  location: "Nairobi, Kenya", time: "2 hours ago", current: false },
                    ].map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.75rem 0", borderBottom: i === 0 ? "1px solid #e2e0d8" : "none" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f5f4f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                          {s.device.includes("iPhone") ? "📱" : "💻"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{s.device}</div>
                          <div style={{ fontSize: 12, color: "#9a9a8e" }}>{s.location} · {s.time}</div>
                        </div>
                        {s.current
                          ? <span style={{ fontSize: 11, background: "#f0fdf4", color: "#16a34a", padding: "2px 8px", borderRadius: 100, fontWeight: 500 }}>Current</span>
                          : (
                            <button
                              onClick={() =>
                                openConfirm(
                                  "Revoke Session",
                                  `Are you sure you want to revoke the session for "${s.device}"? That device will be signed out immediately.`,
                                  true,
                                  () => showToast("Session revoked")
                                )
                              }
                              style={{ fontSize: 12, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}
                            >
                              Revoke
                            </button>
                          )
                        }
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ DANGER ZONE ══ */}
            {activeTab === "Danger Zone" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ ...cardStyle, border: "1px solid #fecaca" }}>
                  <div style={{ ...cardHeaderStyle, background: "#fef2f2", borderBottom: "1px solid #fecaca" }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#dc2626" }}>⚠ Danger Zone</span>
                    <span style={{ fontSize: 12, color: "#dc2626" }}>These actions are irreversible</span>
                  </div>
                  <div style={cardBodyStyle}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                      {[
                        {
                          title: "Clear All Sales Data",
                          desc:  "Permanently delete all sales records and transaction history. This cannot be undone.",
                          btn:   "Clear Sales Data",
                          endpoint: "/api/admin/clear-sales",
                          confirmMsg: "This will permanently delete ALL sales records and transaction history. This action cannot be reversed. Are you absolutely sure?",
                        },
                        {
                          title: "Reset Inventory",
                          desc:  "Reset all product stock levels to zero. Product listings will remain intact.",
                          btn:   "Reset Inventory",
                          endpoint: "/api/admin/reset-inventory",
                          confirmMsg: "This will reset ALL product stock levels to zero. You will need to manually restock every item. Are you sure?",
                        },
                      ].map(({ title, desc, btn, endpoint, confirmMsg }) => (
                        <div key={title} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "#fff5f5", borderRadius: 8, border: "1px solid #fecaca", gap: "1rem" }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
                            <div style={{ fontSize: 12, color: "#9a9a8e", marginTop: 3, maxWidth: 400 }}>{desc}</div>
                          </div>
                          <button
                            onClick={() =>
                              openConfirm(title, confirmMsg, true, async () => {
                                try {
                                  const res = await fetch(endpoint, { method: "DELETE" });
                                  if (!res.ok) throw new Error("Failed");
                                  showToast(`${btn} completed`);
                                } catch {
                                  showToast(`${btn} failed`, "error");
                                }
                              })
                            }
                            style={{ padding: "8px 16px", background: "#fff", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}
                          >
                            {btn}
                          </button>
                        </div>
                      ))}

                      {/* Delete store */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "#fff5f5", borderRadius: 8, border: "1px solid #fecaca", gap: "1rem" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#dc2626" }}>Delete Store Account</div>
                          <div style={{ fontSize: 12, color: "#9a9a8e", marginTop: 3, maxWidth: 400 }}>
                            Permanently delete your store, all data, staff accounts, and customer records. This action cannot be reversed.
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            openConfirm(
                              "Delete Store Account",
                              "This will permanently delete your entire store, including all products, sales, staff accounts, and customer data. This is irreversible. Are you absolutely sure?",
                              true,
                              () => showToast("Store deletion scheduled")
                            )
                          }
                          style={{ padding: "8px 16px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}
                        >
                          Delete Store
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}