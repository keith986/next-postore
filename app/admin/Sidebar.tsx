"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navMain = [
  { href: "/admin/dashboard", icon: "grid", label: "Overview", badge: "" },
  { href: "/admin/orders", icon: "cart", label: "Orders", badge: "5" },
  { href: "/admin/inventory", icon: "box", label: "Inventory" },
  { href: "/admin/customers", icon: "users", label: "Customers" },
  { href: "/admin/analytics", icon: "chart", label: "Analytics" },
];

const navStore = [
  { href: "/admin/products", icon: "tag", label: "Products" },
  { href: "/admin/staff", icon: "staff", label: "Staff" },
  { href: "/admin/settings", icon: "cog", label: "Settings" },
];

const iconPaths: Record<string, string> = {
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  cart: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0",
  box: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  chart: "M18 20V10M12 20V4M6 20v-6",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
  staff: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  cog: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
};

function Icon({ type }: { type: string }) {
  const d = iconPaths[type];
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );  
}

export default function Sidebar() {
  const pathname = usePathname() || "/admin/dashboard";

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === href || pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">P</div>
        <span className="sidebar-logo-name">POStore</span>
      </div>

      <div className="sidebar-section">Main</div>
      {navMain.map(({ href, icon, label, badge }) => (
        <Link key={href} href={href} className={`nav-item ${isActive(href) ? "active" : ""}`}>
          <Icon type={icon} />
          {label}
          {badge ? <span className="nav-badge">{badge}</span> : null}
        </Link>
      ))}

      <div className="sidebar-section">Store</div>
      {navStore.map(({ href, icon, label }) => (
        <Link key={href} href={href} className={`nav-item ${isActive(href) ? "active" : ""}`}>
          <Icon type={icon} />
          {label}
        </Link>
      ))}

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">JA</div>
          <div>
            <div className="sidebar-user-name">Jane Admin</div>
            <div className="sidebar-user-role">Super Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
