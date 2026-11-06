"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { CalendarCheck, CarFront, LayoutDashboard, Users } from "lucide-react";

const links = [
  { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Cars", href: "/admin/car", icon: CarFront },
  { name: "Bookings", href: "/admin/booking", icon: CalendarCheck },
  { name: "Users", href: "/admin/users", icon: Users },
];

export function NavLinks({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive =
          pathname === link.href ||
          (link.href !== "/admin/dashboard" &&
            pathname.startsWith(`${link.href}/`));

        return (
          <Link
            key={link.name}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex shrink-0 items-center rounded-xl font-semibold transition-colors ${
              compact
                ? "h-10 justify-center gap-1 px-1.5 text-[11px]"
                : "h-11 gap-3 px-3 text-sm"
            } ${
              isActive
                ? "bg-slate-900 text-white shadow-sm shadow-slate-900/15"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}>
            <LinkIcon className="h-4 w-4 shrink-0" />
            {link.name}
          </Link>
        );
      })}
    </>
  );
}
