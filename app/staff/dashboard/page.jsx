"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/app/staff/component/Sidebar";
import staffCss from "@/app/staff/component/staffStyles";

/* ─── DATA ─────────────────────────────────────────────────── */
const PRODUCTS = [
  { id: 1,  emoji: "👟", name: "Air Runner Pro",   cat: "Footwear",    price: 60.00,  stock: 24, sku: "FW-001" },
  { id: 2,  emoji: "👜", name: "Canvas Tote Bag",  cat: "Accessories", price: 50.00,  stock: 8,  sku: "AC-012" },
  { id: 3,  emoji: "🧴", name: "Aloe Face Cream",  cat: "Skincare",    price: 35.00,  stock: 42, sku: "SK-003" },
  { id: 4,  emoji: "☕", name: "Brew Kit Deluxe",  cat: "Kitchen",     price: 100.00, stock: 11, sku: "KT-007" },
  { id: 5,  emoji: "🧢", name: "Classic Cap",      cat: "Accessories", price: 25.00,  stock: 5,  sku: "AC-014" },
  { id: 6,  emoji: "🕶️", name: "Shades UV400",     cat: "Accessories", price: 45.00,  stock: 19, sku: "AC-015" },
  { id: 7,  emoji: "📓", name: "Leather Journal",  cat: "Stationery",  price: 22.00,  stock: 30, sku: "ST-002" },
  { id: 8,  emoji: "🧣", name: "Merino Scarf",     cat: "Apparel",     price: 38.00,  stock: 0,  sku: "AP-009" },
  { id: 9,  emoji: "🕯️", name: "Soy Candle Set",   cat: "Home",        price: 28.00,  stock: 15, sku: "HM-005" },
  { id: 10, emoji: "🎒", name: "Daypack 20L",      cat: "Bags",        price: 85.00,  stock: 7,  sku: "BG-003" },
];

const INIT_SALES = [
  { id: "S-0041", time: "09:14", items: "Air Runner Pro ×2",   total: 120.00, method: "Card",   status: "ok"   },
  { id: "S-0040", time: "08:52", items: "Soy Candle Set",      total: 28.00,  method: "Cash",   status: "ok"   },
  { id: "S-0039", time: "08:31", items: "Aloe Face Cream ×3",  total: 105.00, method: "Mobile", status: "ok"   },
  { id: "S-0038", time: "08:10", items: "Classic Cap, Shades", total: 70.00,  method: "Card",   status: "warn" },
];

const CATEGORIES = ["All", "Footwear", "Accessories", "Skincare", "Kitchen", "Apparel", "Stationery", "Home", "Bags"];
const TABS = ["Dashboard", "Record Sale", "Products", "Sales History"];
const HEADER_TITLES = {
  "Dashboard":     "Staff Dashboard",
  "Record Sale":   "Record a Sale",
  "Products":      "Product Catalogue",
  "Sales History": "Sales History",
};

/* ─── ICON ──────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
  </svg>
);

/* ─── PAGE ──────────────────────────────────────────────────── */
export default function StaffDashboard() {
  const [activeTab, setActiveTab]   = useState("Dashboard");
  const [search, setSearch]         = useState("");
  const [catFilter, setCatFilter]   = useState("All");
  const [cart, setCart]             = useState([]);
  const [payMethod, setPayMethod]   = useState("Card");
  const [sales, setSales]           = useState(INIT_SALES);
  const [toast, setToast]           = useState(null);
  const [saleIdCounter, setSaleId]  = useState(42);
  const [shiftTotal, setShiftTotal] = useState(323.00);

  /* product filter */
  const filtered = useMemo(() => PRODUCTS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All" || p.cat === catFilter;
    return matchSearch && matchCat;
  }), [search, catFilter]);

  /* cart helpers */

  const addToCart = (product) => {
    if (product.stock === 0) return;
    setCart(c => {
      const ex = c.find(i => i.id === product.id);
      if (ex) return c.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { ...product, qty: 1 }];
    });
    setActiveTab("Record Sale");
  };
 
  const updateQty  = (id, delta) => setCart(c => c.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  const removeItem = (id) => setCart(c => c.filter(i => i.id !== id));
 
  const subtotal  = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax       = subtotal * 0.16;
  const total     = subtotal + tax;
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
 
  const completeSale = () => {
    if (!cart.length) return;
    const id   = `S-0${saleIdCounter}`;
    const desc = cart.map(i => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ""}`).join(", ");
    setSales(s => [{ id, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), items: desc, total, method: payMethod, status: "ok" }, ...s]);
    setShiftTotal(t => t + total);
    setSaleId(n => n + 1);
    setCart([]);
    showToast(`Sale ${id} recorded — $${total.toFixed(2)} via ${payMethod}`);
  };
 
  const showToast  = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
  const stockClass = (s) => s === 0 ? "badge bad" : s <= 8 ? "badge warn" : "badge ok";
  const stockLabel = (s) => s === 0 ? "Out of stock" : s <= 8 ? `Low — ${s} left` : `${s} in stock`;

  return (
    <>
      <style>{staffCss}</style>

      {toast && (
        <div className="staff-toast">
          <span className="staff-toast-icon">✅</span>
          {toast}
        </div>
      )}

      <div className="staff-shell">

        {/* ── SIDEBAR — separate component ── */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          cartCount={cartCount}
        />

        {/* ── HEADER ── */}
        <header className="staff-header">
          <div className="hdr-title">{HEADER_TITLES[activeTab]}</div>
          <div className="hdr-shift-pill">
            <div className="hdr-shift-dot" />
            Shift active — 07:00 AM
          </div>
          <div className="hdr-time">Fri, 13 Mar 2026</div>
          <button className="hdr-btn" onClick={() => setActiveTab("Record Sale")}>
            + New Sale
          </button>
        </header>

        {/* ── MAIN ── */}
        <main className="staff-main">

          {/* Tab bar */}
          <div className="staff-tabs">
            {TABS.map(t => (
              <button
                key={t}
                className={`staff-tab-btn ${activeTab === t ? "active" : ""}`}
                onClick={() => setActiveTab(t)}
              >
                {t}
                {t === "Record Sale" && cartCount > 0 && (
                  <span className="staff-tab-count">{cartCount}</span>
                )}
              </button>
            ))}
          </div>

          {/* ══ DASHBOARD ══ */}
          {activeTab === "Dashboard" && (
            <>
              <div className="stat-strip">
                {[
                  { label: "Shift Sales",   value: `$${shiftTotal.toFixed(2)}`,                                      sub: "Today on your shift" },
                  { label: "Transactions",  value: String(sales.length),                                              sub: "This shift" },
                  { label: "Items in Cart", value: String(cartCount),                                                 sub: "Pending sale" },
                  { label: "Low Stock",     value: String(PRODUCTS.filter(p => p.stock > 0 && p.stock <= 8).length), sub: "Products" },
                ].map(s => (
                  <div className="stat-card" key={s.label}>
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-sub">{s.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Recent Sales</span>
                    <span className="card-meta">{sales.length} this shift</span>
                  </div>
                  <table className="tbl">
                    <thead><tr><th>ID</th><th>Items</th><th>Total</th><th>Method</th></tr></thead>
                    <tbody>
                      {sales.slice(0, 4).map(s => (
                        <tr key={s.id}>
                          <td style={{ fontWeight: 500, color: "var(--ink)" }}>{s.id}</td>
                          <td style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.items}</td>
                          <td style={{ fontWeight: 500, color: "var(--ink)" }}>${s.total.toFixed(2)}</td>
                          <td><span className="badge info"><span className="badge-dot" />{s.method}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Stock Alerts</span>
                    <span className="card-meta">View only</span>
                  </div>
                  <div style={{ paddingBottom: "0.5rem" }}>
                    {PRODUCTS.filter(p => p.stock <= 8).map(p => (
                      <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.7rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
                        <span style={{ fontSize: 20 }}>{p.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>{p.sku}</div>
                        </div>
                        <span className={stockClass(p.stock)}><span className="badge-dot" />{stockLabel(p.stock)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ══ RECORD SALE ══ */}
          {activeTab === "Record Sale" && (
            <div className="sale-layout">
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Add Products to Sale</span>
                    <span className="card-meta">Click a product to add</span>
                  </div>
                  <div className="toolbar">
                    <div className="search-wrap">
                      <SearchIcon />
                      <input placeholder="Search by name or SKU…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: "0.75rem", padding: "1rem" }}>
                    {filtered.filter(p => p.stock > 0).map(p => (
                      <button key={p.id} onClick={() => addToCart(p)} style={{
                        background: cart.find(i => i.id === p.id) ? "var(--accent-bg)" : "var(--bg)",
                        border: cart.find(i => i.id === p.id) ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                        borderRadius: 10, padding: "0.75rem", cursor: "pointer",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                        transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif",
                      }}>
                        <span style={{ fontSize: 28 }}>{p.emoji}</span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink)", textAlign: "center" }}>{p.name}</span>
                        <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>${p.price.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Current Sale</span>
                    <span className="card-meta">{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
                  </div>
                  {cart.length === 0 ? (
                    <div className="empty-cart">
                      <div className="empty-cart-icon">🛒</div>
                      No items yet — add products above
                    </div>
                  ) : (
                    cart.map(item => (
                      <div className="sale-item-row" key={item.id}>
                        <span className="sale-emoji">{item.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div className="sale-item-name">{item.name}</div>
                          <div className="sale-item-price">${item.price.toFixed(2)} each</div>
                        </div>
                        <div className="qty-ctrl">
                          <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                          <span className="qty-num">{item.qty}</span>
                          <button className="qty-btn" onClick={() => updateQty(item.id, +1)}>+</button>
                        </div>
                        <div style={{ fontWeight: 500, minWidth: 60, textAlign: "right", fontSize: 13 }}>
                          ${(item.price * item.qty).toFixed(2)}
                        </div>
                        <button className="remove-btn" onClick={() => removeItem(item.id)}>×</button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-header">Sale Summary</div>
                <div className="summary-body">
                  <div className="summary-row"><span className="label">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className="summary-row"><span className="label">Tax (16%)</span><span>${tax.toFixed(2)}</span></div>
                  <div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>Payment Method</div>
                    <select className="payment-select" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                      <option>Card</option>
                      <option>Cash</option>
                      <option>Mobile</option>
                    </select>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", background: "var(--bg)", borderRadius: 7, padding: "0.6rem 0.75rem", lineHeight: 1.5 }}>
                    Staff: <strong style={{ color: "var(--ink)" }}>Kwame Asante</strong><br />
                    Time: <strong style={{ color: "var(--ink)" }}>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
                  </div>
                  <button className="complete-btn" onClick={completeSale} disabled={cart.length === 0}>
                    {cart.length === 0 ? "Add items to complete" : `Complete Sale — $${total.toFixed(2)}`}
                  </button>
                  {cart.length > 0 && (
                    <button onClick={() => setCart([])} style={{ width: "100%", padding: "8px", background: "none", border: "1px solid var(--border2)", borderRadius: 8, fontSize: 12, color: "var(--muted)", cursor: "pointer" }}>
                      Clear cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══ PRODUCTS ══ */}
          {activeTab === "Products" && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Product Catalogue</span>
                <span className="card-meta">View only — contact admin to add/edit</span>
              </div>
              <div className="toolbar" style={{ flexWrap: "wrap" }}>
                <div className="search-wrap" style={{ minWidth: 200 }}>
                  <SearchIcon />
                  <input placeholder="Search name or SKU…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {CATEGORIES.map(c => (
                    <button key={c} className={`filter-btn ${catFilter === c ? "active" : ""}`} onClick={() => setCatFilter(c)}>{c}</button>
                  ))}
                </div>
              </div>
              <div className="product-grid">
                {filtered.map(p => (
                  <div className="product-card" key={p.id}>
                    <div className="product-thumb">
                      {p.emoji}
                      <span className={`${stockClass(p.stock)} product-stock-badge`}>{stockLabel(p.stock)}</span>
                    </div>
                    <div className="product-info">
                      <div className="product-name">{p.name}</div>
                      <div className="product-cat">{p.cat} · {p.sku}</div>
                      <div className="product-price">${p.price.toFixed(2)}</div>
                      <div className="product-stock-row">
                        <span className="product-stock-num">{p.stock} units</span>
                        <button className="add-to-sale-btn" disabled={p.stock === 0} onClick={() => addToCart(p)}>
                          {p.stock === 0 ? "Out" : "+ Sale"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "2rem", color: "var(--muted)", fontSize: 13 }}>
                    No products match your search.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ SALES HISTORY ══ */}
          {activeTab === "Sales History" && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Sales History — Today</span>
                <span className="card-meta">{sales.length} transactions · ${sales.reduce((s, r) => s + r.total, 0).toFixed(2)} total</span>
              </div>
              <table className="tbl">
                <thead>
                  <tr><th>Sale ID</th><th>Time</th><th>Items</th><th>Total</th><th>Method</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {sales.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500, color: "var(--ink)" }}>{s.id}</td>
                      <td>{s.time}</td>
                      <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.items}</td>
                      <td style={{ fontWeight: 500, color: "var(--ink)" }}>${s.total.toFixed(2)}</td>
                      <td><span className="badge info"><span className="badge-dot" />{s.method}</span></td>
                      <td>
                        <span className={`badge ${s.status}`}>
                          <span className="badge-dot" />
                          {s.status === "ok" ? "Completed" : "Flagged"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </main>
      </div>
    </>
  );
}