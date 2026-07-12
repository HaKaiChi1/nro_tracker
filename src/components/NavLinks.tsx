"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Tổng quan" },
  { href: "/statistics", label: "Thống kê" },
  { href: "/search", label: "Tìm kiếm" },
  { href: "/players", label: "Người nhặt đồ" },
  { href: "/alerts", label: "Cảnh báo Email" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {LINKS.map((link) => {
        const isActive =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={isActive ? "nav-link nav-link-active" : "nav-link"}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
