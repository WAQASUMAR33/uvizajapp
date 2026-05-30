"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/home", label: "Home" },
  { href: "/merchants", label: "Explore" },
  { href: "/categories", label: "Categories" },
];

export default function MainNav({ session }: { session: any }) {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-1">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
            pathname.startsWith(href) && href !== "/home"
              ? "bg-indigo-50 text-indigo-700"
              : pathname === href && href === "/home"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          )}
        >
          {label}
        </Link>
      ))}
      {session && (
        <Link
          href="/profile"
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
            pathname === "/profile"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          )}
        >
          Profile
        </Link>
      )}
    </nav>
  );
}
