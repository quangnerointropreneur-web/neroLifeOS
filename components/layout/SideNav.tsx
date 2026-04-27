"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Heart, CalendarDays, Wallet, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/",         label: "Dashboard",  icon: LayoutDashboard },
  { href: "/health",   label: "Sức Khỏe",   icon: Heart },
  { href: "/schedule", label: "Lịch",        icon: CalendarDays },
  { href: "/finance",  label: "Tài Chính",   icon: Wallet },
  { href: "/settings", label: "Cài Đặt",     icon: Settings },
];

export default function SideNav() {
  const path = usePathname();

  return (
    <aside className="desktop-sidenav">
      {/* Logo */}
      <div className="sidenav-logo">
        <div className="sidenav-logo-icon">🦁</div>
        <div>
          <div className="sidenav-logo-title">LifeOS</div>
          <div className="sidenav-logo-sub">Nero's Dashboard</div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="sidenav-menu">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = path === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidenav-item ${active ? "sidenav-item--active" : ""}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
              {active && <div className="sidenav-active-bar" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidenav-footer">
        <div className="sidenav-footer-dot" />
        <span>Online</span>
      </div>
    </aside>
  );
}
