"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Calendar,
  ShoppingBag,
  Users,
  Settings,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { section: "Main", links: [
    { href: "/feed", label: "Campus Feed", icon: Home },
    { href: "/resources", label: "Resources", icon: FileText },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  ]},
  { section: "Community", links: [
    { href: "/clubs", label: "Clubs", icon: Users },
    { href: "/trending", label: "Trending", icon: TrendingUp },
  ]},
  { section: "Other", links: [
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/help", label: "Help & FAQ", icon: HelpCircle },
  ]},
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="flex flex-col gap-6 p-4">
        {sidebarLinks.map(({ section, links }) => (
          <div key={section}>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {section}
            </p>
            <div className="space-y-0.5">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname.startsWith(href)
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
