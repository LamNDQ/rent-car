"use client";

import { House, CalendarCheck, Users, Car } from "lucide-react";
import Link from "next/link";

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: "Home", href: "/", icon: House },
  { name: "Car", href: "/admin/car", icon: House },
  { name: "Booking", href: "/admin/booking", icon: CalendarCheck },
  { name: "Users", href: "/admin/users", icon: Users },
];

export function NavLinks() {
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className="flex h-12 grow items-center justify-center gap-2 rounded-md --color-b p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3 text-zinc-800 bg-zinc-200">
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
