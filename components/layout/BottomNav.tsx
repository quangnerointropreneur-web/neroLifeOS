"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Heart, CalendarDays, Wallet, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/",          label: "Home",     icon: LayoutDashboard },
  { href: "/health",    label: "Sức Khỏe", icon: Heart },
  { href: "/schedule",  label: "Lịch",     icon: CalendarDays },
  { href: "/finance",   label: "Tài Chính",icon: Wallet },
  { href: "/settings",  label: "Cài Đặt",  icon: Settings },
];

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 480,
        background: "rgba(18,20,31,0.92)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        zIndex: 100,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
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
              color: active ? "#818cf8" : "rgba(255,255,255,0.35)",
              transition: "color 0.2s",
              gap: 3,
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
                  background: "#818cf8",
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
