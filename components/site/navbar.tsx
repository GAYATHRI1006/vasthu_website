import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between">
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
          <a href="#about">About</a>
          <a href="#benefits">Benefits</a>
          <a href="#trainer">Trainer</a>
          <a href="#gallery">Gallery</a>
          <a href="#register">Register</a>
        </nav>
        <Button asChild className="hidden md:inline-flex">
          <a href="#register">Reserve Your Seat</a>
        </Button>
      </div>
    </header>
  );
}
