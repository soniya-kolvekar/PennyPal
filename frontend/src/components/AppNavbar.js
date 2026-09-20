"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "../../lib/auth";
import { LogOut, LayoutDashboard, Calendar as CalendarIcon, Target, Swords, UploadCloud, Settings as SettingsIcon, MessageSquare } from "lucide-react";

export default function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Calendar", href: "/calendar" },
    { label: "Goals", href: "/goals" },
    { label: "Boss Battles", href: "/boss/history" },
    { label: "Upload", href: "/upload" },
    { label: "Settings", href: "/settings" },
    { label: "Chat", href: "/chat" },
  ];

  const isLinkActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/boss/history") return pathname.startsWith("/boss");
    if (href === "/goals") return pathname.startsWith("/goals");
    return pathname === href;
  };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#FAF9FF]/90 border-b border-[#EAE3FA]/80 px-6 sm:px-12 py-2 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo (Links to /dashboard for signed-in users) */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/logoo.png"
            alt="PennyPal Logo"
            width={160}
            height={50}
            style={{ width: "auto", height: "auto" }}
            className="h-9 sm:h-10 object-contain"
            priority
          />
        </Link>

        {/* Centered Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-sm sm:text-base font-bold text-[#5B3F91]">
          {navItems.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-all py-1 border-b-2 ${
                  active
                    ? "text-[#8064C8] font-extrabold border-[#8064C8]"
                    : "border-transparent hover:text-[#8064C8] hover:border-[#EAE3FA]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right Action: Logout Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 bg-white hover:bg-rose-50 border border-[#EAE3FA] hover:border-rose-200 text-[#5B3F91] hover:text-rose-600 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            title="Sign out of PennyPal"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
