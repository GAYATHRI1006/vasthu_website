"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#benefits", label: "Benefits" },
  { href: "#trainer", label: "Trainer" },
  { href: "#gallery", label: "Gallery" },
  { href: "#register", label: "Register" }
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-white shadow-soft">
            HV
          </div>
          <div>
            <p className="font-serif text-xl text-primary">{siteConfig.name}</p>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
              Premium Workshop Registration
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Button asChild variant="outline">
            <Link href="/admin/login" prefetch>
              Admin Login
            </Link>
          </Button>
          <Button asChild>
            <a href="#register">Reserve Your Seat</a>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-white text-primary shadow-sm transition hover:border-primary/40 hover:bg-primary/5 md:hidden"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200/80 bg-white/95 md:hidden">
          <div className="container space-y-3 py-4">
            <div className="grid gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-primary"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="grid gap-3 pt-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/login" prefetch onClick={closeMobileMenu}>
                  Admin Login
                </Link>
              </Button>
              <Button asChild className="w-full">
                <a href="#register" onClick={closeMobileMenu}>
                  Reserve Your Seat
                </a>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
