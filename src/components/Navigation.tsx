"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Droplets,
  AlertCircle,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

export function Navigation() {
  const pathname = usePathname();

  // Mobile: only 4 core items in bottom nav. Settings accessible via top header icon.
  const mobileLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/deliveries", label: "Deliveries", icon: Droplets },
    { href: "/customers", label: "Customers", icon: Users },
    { href: "/outstanding", label: "Dues", icon: AlertCircle },
  ];

  // Desktop sidebar: all items
  const sidebarLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/deliveries", label: "Add Delivery", icon: Droplets },
    { href: "/customers", label: "Customers", icon: Users },
    { href: "/outstanding", label: "Outstanding Dues", icon: AlertCircle },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Droplets className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">Jal Seva</span>
        </div>
        <Link href="/settings" className="ml-auto p-2">
          <Settings className="w-5 h-5 text-gray-500" />
        </Link>
      </header>

      {/* Mobile Bottom Nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex">
          {mobileLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center flex-1 py-2 gap-1 ${
                  isActive ? "text-blue-600" : "text-gray-500"
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? "text-blue-600" : "text-gray-500"
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    isActive ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col fixed inset-y-0 left-0 w-60 bg-slate-900 z-40">
        <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-800">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Droplets className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">Jal Seva</p>
            <p className="text-slate-400 text-xs">Business Manager</p>
          </div>
        </div>
        <div className="flex-1 py-4 px-3 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </nav>
    </>
  );
}
