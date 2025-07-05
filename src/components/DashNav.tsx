"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx"; // Install with: npm install clsx

export default function DashNav() {
  const pathname = usePathname();

  const links = [
    { href: "/app/home", label: "Home" },
    { href: "/app/bible", label: "Bible" },
    { href: "/app/friends", label: "Friends" },
    { href: "/app/chat", label: "Chat" },
    { href: "/app/jam", label: "Jam" },
    { href: "/app/calendar", label: "Calendar" },
    { href: "/app/admin", label: "Admin" },
  ];

  return (
    <nav className="h-full w-full bg-white border-r shadow-sm p-4 flex flex-col gap-4">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={clsx(
            "font-medium px-3 py-2 rounded-md transition-colors",
            pathname === href
              ? "bg-amber-100 text-amber-700 font-semibold"
              : "text-gray-700 hover:bg-gray-100 hover:text-amber-600"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
