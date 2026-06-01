"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  PlusCircle,
  Users,
  History,
  Activity,
  Globe,
  Menu,
  X,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Navbar() {
  const { t, lang, toggleLang, dir } = useLanguage();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { name: t.nav.dashboard, href: "/", icon: Home },
    { name: t.nav.addMedication, href: "/add-medication", icon: PlusCircle },
    { name: t.nav.familyProfiles, href: "/family", icon: Users },
    { name: t.nav.history, href: "/history", icon: History },
  ];

  return (
    <nav className="bg-white text-slate-800 shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center overflow-hidden">
            <Link
              href="/"
              className="flex-shrink-0 flex items-center group"
            >
              <div className="flex items-center justify-center">
                <Image
                  src="/images/logo-text.png"
                  alt="Family Health Companion Logo"
                  width={180}
                  height={50}
                  draggable={false}
                  className="object-contain mix-blend-multiply select-none"
                />
              </div>
            </Link>
          </div>

          {/* Mobile Hamburger Icon */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 hover:text-blue-600 focus:outline-none p-2 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4 md:space-x-reverse rtl:space-x-reverse">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${dir === "rtl" ? "ml-2" : "mr-2"} ${isActive ? "text-blue-600" : "text-slate-400"}`}
                  />
                  {link.name}
                </Link>
              );
            })}

            {/* Disabled / Coming Soon tab */}
            <div className="relative group flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed">
              <Activity
                className={`h-4 w-4 ${dir === "rtl" ? "ml-2" : "mr-2"}`}
              />
              {t.nav.labDecoder}
              <span className="absolute top-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {t.nav.comingSoon}
              </span>
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleLang}
              className="ml-4 rtl:mr-4 rtl:ml-0 flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              aria-label="Toggle Language"
            >
              <Globe
                className={`h-4 w-4 ${dir === "rtl" ? "ml-2" : "mr-2"} text-slate-400`}
              />
              {lang === "en" ? "العربية" : "English"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 shadow-lg absolute w-full left-0 top-16">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${dir === "rtl" ? "ml-3" : "mr-3"} ${isActive ? "text-blue-600" : "text-slate-400"}`}
                  />
                  {link.name}
                </Link>
              );
            })}
            <div className="pt-2 mt-2 border-t border-slate-100">
              <button
                onClick={() => { toggleLang(); setIsMobileMenuOpen(false); }}
                className="flex w-full items-center px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all duration-200 focus:outline-none"
              >
                <Globe className={`h-5 w-5 ${dir === "rtl" ? "ml-3" : "mr-3"} text-slate-400`} />
                {lang === "en" ? "العربية" : "English"}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
