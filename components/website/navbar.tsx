"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Phone, Menu, X, ChevronRight, ArrowRight } from "lucide-react";
import { siteConfig, navLinks } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/90 backdrop-blur-md shadow-[0_1px_0_0_rgba(15,23,42,0.06),0_8px_24px_-16px_rgba(15,23,42,0.25)] border-b border-slate-200/70"
            : "bg-white/70 backdrop-blur-sm border-b border-transparent"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[4.5rem]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <Image
                src="/images/logo-20hpc.png"
                alt="Hygienic Pest Control"
                width={44}
                height={44}
                className="rounded-lg h-10 w-10 sm:h-11 sm:w-11 transition-transform group-hover:scale-105"
                priority
              />
              <div className="leading-tight">
                <span className="block text-[15px] sm:text-lg font-extrabold text-ink tracking-tight">
                  {siteConfig.name}
                </span>
                <span className="block text-[9px] sm:text-[10px] font-semibold tracking-[0.14em] uppercase text-green-dark">
                  {siteConfig.tagline}
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "text-brand"
                      : "text-slate-600 hover:text-brand hover:bg-brand/5"
                  )}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute inset-x-3.5 -bottom-px h-0.5 rounded-full bg-brand" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-2.5">
              <a
                href={`tel:${siteConfig.telPrimary}`}
                className="flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold text-green-dark bg-green-bright/10 hover:bg-green-bright/20 transition-colors"
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-bright text-white">
                  <Phone className="w-3.5 h-3.5" />
                </span>
                <span className="hidden lg:inline">{siteConfig.phones[0]}</span>
                <span className="lg:hidden">Call</span>
              </a>
              <Link href="/contact">
                <Button className="rounded-full px-5 h-10 bg-brand hover:bg-brand-dark text-white shadow-lg shadow-brand/25 btn-press">
                  Free Inspection
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Mobile actions */}
            <div className="flex md:hidden items-center gap-1">
              <a
                href={`tel:${siteConfig.telPrimary}`}
                className="p-2.5 rounded-lg text-green-dark hover:bg-green-bright/10 transition-colors"
                aria-label="Call us"
              >
                <Phone className="w-5 h-5" />
              </a>
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2.5 rounded-lg text-ink hover:bg-slate-100 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 right-0 w-80 max-w-[86vw] h-full bg-white shadow-2xl animate-slide-in-left flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/images/logo-20hpc.png"
                  alt="HPC"
                  width={36}
                  height={36}
                  className="rounded-lg"
                />
                <span className="font-extrabold text-ink text-[15px] leading-tight">
                  {siteConfig.name}
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-brand/10 text-brand"
                      : "text-slate-700 hover:bg-slate-50 hover:text-brand"
                  )}
                >
                  {link.label}
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </Link>
              ))}
            </nav>

            <div className="p-4 space-y-3 border-t border-slate-100">
              <a
                href={`tel:${siteConfig.telPrimary}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-bright/10 text-green-dark font-semibold"
              >
                <Phone className="w-5 h-5" />
                {siteConfig.phones[0]}
              </a>
              <Link href="/contact" onClick={() => setMobileOpen(false)}>
                <Button className="w-full h-12 rounded-xl bg-brand hover:bg-brand-dark text-white shadow-lg shadow-brand/25 text-base">
                  Book Free Inspection
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
