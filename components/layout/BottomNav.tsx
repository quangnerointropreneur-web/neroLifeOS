"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Heart, CalendarDays, Wallet, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/",          label: "Home",      icon: LayoutDashboard },
  { href: "/health",    label: "Sức Khỏe",  icon: Heart },
  { href: "/schedule",  label: "Lịch",      icon: CalendarDays },
  { href: "/finance",   label: "Tài Chính", icon: Wallet },
  { href: "/settings",  label: "Cài Đặt",   icon: Settings },
];

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav className="mobile-nav">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = path === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 0 6px",
              textDecoration: "none",
              color: active ? "var(--accent-violet)" : "var(--text-muted)",
              transition: "color 0.2s",
              gap: 3,
              position: "relative",
            }}
          >
            <Icon size={22} />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>
              {item.label}
            </span>
            {active && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  width: 30,
                  height: 2,
                  borderRadius: "0 0 2px 2px",
                  background: "var(--accent-violet)",
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
