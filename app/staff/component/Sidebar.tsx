"use client";

/* ─────────────────────────────────────────────────────────────
   Sidebar — Staff navigation
   Props:
     activeTab   : string  — currently active tab/page
     setActiveTab: fn      — setter to change active tab
     cartCount   : number  — items in cart (shown as badge on Record Sale)
───────────────────────────────────────────────────────────── */

// eslint-disable-next-line react/display-name
const Ic = (d : string) => () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const GridIcon = Ic("M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z");
const SaleIcon = Ic("M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0");
const BoxIcon  = Ic("M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12");
const HistIcon = Ic("M12 8v4l3 3M3.05 11a9 9 0 1 0 .5-3M3 4v4h4");

const NAV = [
  { icon: GridIcon, label: "Dashboard" },
  { icon: SaleIcon, label: "Record Sale" },
  { icon: BoxIcon,  label: "Products" },
  { icon: HistIcon, label: "Sales History" },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount?: number;
}

const sidebarCss = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700&display=swap');

  .sidebar {
    grid-row: 1 / 3;
    background: #141410;
    color: #fff;
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    width: 220px;
    flex-shrink: 0;
  }

  .sb-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 1.25rem;
    height: 60px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    flex-shrink: 0;
  }
  .sb-logo-mark {
    width: 30px; height: 30px;
    background: #2563eb;
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 500; color: #fff;
    font-family: 'DM Sans', sans-serif;
  }
  .sb-logo-name {
    font-size: 14px; font-weight: 500; color: #fff;
    font-family: 'DM Sans', sans-serif;
  }

  .sb-section {
    padding: 1.2rem 1rem 0.4rem;
    font-size: 10px; font-weight: 500;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: rgba(255,255,255,0.28);
    font-family: 'DM Sans', sans-serif;
  }

  .sb-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 0.6rem 1rem;
    margin: 1px 0.5rem;
    border-radius: 7px;
    font-size: 13px;
    color: rgba(255,255,255,0.55);
    cursor: pointer;
    text-decoration: none;
    transition: background 0.15s, color 0.15s;
    font-family: 'DM Sans', sans-serif;
    position: relative;
  }
  .sb-nav-item:hover { background: rgba(255,255,255,0.07); color: #fff; }
  .sb-nav-item.active {
    background: rgba(37,99,235,0.25);
    color: #93c5fd;
    font-weight: 500;
  }
  .sb-nav-item svg { flex-shrink: 0; opacity: 0.75; }
  .sb-nav-item.active svg { opacity: 1; }

  .sb-nav-lock {
    margin-left: auto;
    font-size: 10px;
    background: rgba(255,255,255,0.1);
    padding: 2px 6px; border-radius: 4px;
    color: rgba(255,255,255,0.3);
    font-family: 'DM Sans', sans-serif;
  }

  .sb-cart-badge {
    margin-left: auto;
    background: #2563eb;
    color: #fff;
    font-size: 10px; font-weight: 600;
    padding: 1px 7px; border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
  }

  .sb-footer {
    margin-top: auto;
    padding: 1rem;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  .sb-user { display: flex; align-items: center; gap: 10px; }
  .sb-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: #2563eb;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 500; color: #fff;
    flex-shrink: 0;
    font-family: 'DM Sans', sans-serif;
  }
  .sb-name {
    font-size: 13px; font-weight: 500; color: #fff;
    font-family: 'DM Sans', sans-serif;
  }
  .sb-role {
    font-size: 11px; color: rgba(255,255,255,0.38);
    font-family: 'DM Sans', sans-serif;
  }
  .sb-on-shift {
    margin-left: auto;
    background: #f0fdf4; color: #16a34a;
    font-size: 10px; font-weight: 500;
    padding: 2px 7px; border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
  }

  @media (max-width: 700px) {
    .sidebar { display: none; }
  }
`;

export default function Sidebar({ activeTab, setActiveTab, cartCount = 0 }: SidebarProps) {
  return (
    <>
      <style>{sidebarCss}</style>
      <aside className="sidebar">
        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-logo-mark">P</div>
          <span className="sb-logo-name">POStore</span>
        </div>

        {/* Nav */}
        <div className="sb-section">Staff Menu</div>
        {NAV.map(({ icon: Icon, label }) => (
          <a
            key={label}
            className={`sb-nav-item ${activeTab === label ? "active" : ""}`}
            onClick={(e) => { e.preventDefault(); setActiveTab(label); }}
            href="#"
          >
            <Icon />
            {label}
            {label === "Record Sale" && cartCount > 0 && (
              <span className="sb-cart-badge">{cartCount}</span>
            )}
          </a>
        ))}

        {/* Footer / user */}
        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">KA</div>
            <div>
              <div className="sb-name">Kwame Asante</div>
              <div className="sb-role">Cashier</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}