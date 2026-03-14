/* ─── data ─────────────────────────────────────────────────── */
const barData = [
  { lbl: "Mon", v: 62 }, { lbl: "Tue", v: 80 }, { lbl: "Wed", v: 55 },
  { lbl: "Thu", v: 91 }, { lbl: "Fri", v: 78 }, { lbl: "Sat", v: 100 }, { lbl: "Sun", v: 44 },
];
const orders = [
  { id: "#4821", customer: "Amara Osei",    items: 3, total: "$84.00",  status: "ok",   statusLabel: "Paid" },
  { id: "#4820", customer: "Kofi Mensah",   items: 1, total: "$22.50",  status: "ok",   statusLabel: "Paid" },
  { id: "#4819", customer: "Zara Williams", items: 5, total: "$210.00", status: "warn", statusLabel: "Pending" },
  { id: "#4818", customer: "James Okafor",  items: 2, total: "$47.00",  status: "ok",   statusLabel: "Paid" },
  { id: "#4817", customer: "Nia Boateng",   items: 4, total: "$130.00", status: "bad",  statusLabel: "Refunded" },
];
const topProducts = [
  { emoji: "👟", name: "Air Runner Pro", cat: "Footwear",   sales: 142, rev: "$8,520" },
  { emoji: "👜", name: "Canvas Tote Bag", cat: "Accessories", sales: 98,  rev: "$4,900" },
  { emoji: "🧴", name: "Aloe Face Cream", cat: "Skincare",   sales: 87,  rev: "$3,045" },
  { emoji: "☕", name: "Brew Kit Deluxe", cat: "Kitchen",    sales: 64,  rev: "$6,400" },
];
const activity = [
  { color: "#16a34a", text: <><strong>New order #4821</strong> — Amara Osei, $84.00</>, time: "2m ago" },
  { color: "#2563eb", text: <><strong>Inventory low</strong> — Canvas Tote Bag (8 left)</>, time: "14m ago" },
  { color: "#d4522a", text: <><strong>Refund processed</strong> — Order #4817, $130.00</>, time: "1h ago" },
  { color: "#d97706", text: <><strong>Staff login</strong> — Cashier Kwame signed in</>, time: "2h ago" },
  { color: "#16a34a", text: <><strong>Day total</strong> — $2,340 from 38 transactions</>, time: "3h ago" },
];
const payMethods = [
  { color: "#141410", label: "Card",   pct: 58 },
  { color: "#d4522a", label: "Cash",   pct: 27 },
  { color: "#2563eb", label: "Mobile", pct: 15 },
];


/* ─── Donut ─────────────────────────────────────────────────── */
function DonutChart({ data }: { data: Array<{ color: string; pct: number }> }) {
  const r = 44; const cx = 56; const cy = 56;
  const circ = 2 * Math.PI * r;

  const slices = data
    .reduce(
      (acc, d) => {
        const len = (d.pct / 100) * circ;
        return {
          offset: acc.offset + len,
          slices: [...acc.slices, { offset: acc.offset, len, color: d.color }],
        };
      },
      { offset: 0, slices: [] as Array<{ offset: number; len: number; color: string }> }
    )
    .slices;

  return (
    <svg width="112" height="112" viewBox="0 0 112 112">
      {slices.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r}
          fill="none" stroke={s.color} strokeWidth="16"
          strokeDasharray={`${s.len} ${circ - s.len}`}
          strokeDashoffset={-s.offset}
          style={{ transform: "rotate(-90deg)", transformOrigin: "56px 56px" }}
        />
      ))}
      <circle cx={cx} cy={cy} r={r - 10} fill="white" />
    </svg>
  );
}

const BellIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>;

export default function AdminDashboard() {
  const maxBar = Math.max(...barData.map(d => d.v));

  const dater = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date());

  return (
    <>
      <header className="header">
        <div className="header-title">Overview</div>
        <div className="header-date">{dater}</div>
        <div className="header-bell">
          <BellIcon />
          <div className="bell-dot" />
        </div>
      </header>

      <main className="main">

        {/* stat cards */}
        <div className="stat-grid">
          {[
            { label: "Today's Revenue", value: "$2,340", change: "+12.4%", up: true,  icon: "💰", bg: "#fff4f0" },
            { label: "Orders Today",    value: "38",     change: "+4",     up: true,  icon: "🛒", bg: "#eff6ff" },
            { label: "Active Staff",    value: "6",      change: "on shift",up: true, icon: "👥", bg: "#f0fdf4" },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-card-top">
                <span className="stat-card-label">{s.label}</span>
                <div className="stat-card-icon" style={{ background: s.bg }}>
                  <span style={{ fontSize: 15 }}>{s.icon}</span>
                </div>
              </div>
              <div className="stat-card-value">{s.value}</div>
              <div className={`stat-card-change ${s.up ? "change-up" : "change-down"}`}>
                <span>{s.up ? "↑" : "↓"}</span>
                <span>{s.change} vs yesterday</span>
              </div>
            </div>
          ))}
        </div>

        {/* chart + payment methods */}
        <div className="three-col">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Weekly Revenue</span>
              <span className="card-action">Export</span>
            </div>
            <div className="card-body">
              <div className="chart-wrap">
                {barData.map(d => (
                  <div className="chart-col" key={d.lbl}>
                    <div className="chart-bar-wrap">
                      <div
                        className={`chart-bar ${d.lbl === "Sat" ? "highlight" : ""}`}
                        style={{ height: `${(d.v / maxBar) * 100}%` }}
                        title={`$${d.v * 24}`}
                      />
                    </div>
                    <span className="chart-lbl">{d.lbl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Payment Methods</span>
            </div>
            <div className="card-body">
              <div className="donut-wrap">
                <DonutChart data={payMethods} />
                <div className="donut-legend">
                  {payMethods.map(m => (
                    <div className="legend-row" key={m.label}>
                      <div className="legend-dot" style={{ background: m.color }} />
                      <span className="legend-label">{m.label}</span>
                      <span className="legend-pct">{m.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* orders + activity */}
        <div className="two-col">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Orders</span>
              <a className="card-action" href="#">View all</a>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 500, color: "var(--ink)" }}>{o.id}</td>
                    <td>{o.customer}</td>
                    <td style={{ fontWeight: 500, color: "var(--ink)" }}>{o.total}</td>
                    <td><span className={`badge ${o.status}`}><span className="badge-dot" />{o.statusLabel}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Activity Feed</span>
              <span className="card-action">Clear</span>
            </div>
            <div className="card-body" style={{ paddingTop: 0, paddingBottom: 0 }}>
              {activity.map((a, i) => (
                <div className="activity-item" key={i}>
                  <div className="activity-dot" style={{ background: a.color }} />
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* top products */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Top Products</span>
            <a className="card-action" href="#">Manage inventory</a>
          </div>
          <div className="card-body" style={{ paddingTop: 0, paddingBottom: 0 }}>
            {topProducts.map(p => (
              <div className="product-row" key={p.name}>
                <div className="product-thumb">{p.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div className="product-name">{p.name}</div>
                  <div className="product-sub">{p.cat} · {p.sales} sold</div>
                </div>
                <div className="product-val">{p.rev}</div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </>
  );
}
