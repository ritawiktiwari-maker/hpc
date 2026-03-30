"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Phone, Menu, X, ChevronRight } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src="/images/logo-20hpc.png"
                alt="Hygienic Pest Control"
                width={44}
                height={44}
                className="rounded-lg"
              />
              <div className="hidden sm:block">
                <span
                  className={`text-lg font-bold leading-tight transition-colors duration-300 ${
                    scrolled ? "text-[#1a2332]" : "text-white"
                  }`}
                >
                  Hygienic Pest Control
                </span>
                <span
                  className={`block text-[10px] font-medium tracking-wider uppercase transition-colors duration-300 ${
                    scrolled ? "text-[#7CB342]" : "text-green-300"
                  }`}
                >
                  Professional Pest Control
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 ${
                    scrolled
                      ? "text-[#1a2332] hover:text-[#42A5F5] hover:bg-blue-50"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Right Actions */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="tel:+917277234534"
                className={`flex items-center gap-2 text-sm font-semibold transition-all duration-300 rounded-full px-4 py-2 ${
                  scrolled
                    ? "bg-[#7CB342]/10 text-[#7CB342] hover:bg-[#7CB342]/20"
                    : "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm"
                }`}
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#7CB342] text-white animate-pulse">
                  <Phone className="w-3.5 h-3.5" />
                </span>
                <span>Call Us</span>
                <span className="hidden lg:inline">+91-7277234534</span>
              </a>
              <Link href="/contact">
                <Button className="bg-[#42A5F5] hover:bg-[#1E88E5] text-white rounded-full px-5 shadow-lg shadow-blue-500/25 btn-press">
                  Book Free Inspection
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Mobile Right Actions */}
            <div className="flex md:hidden items-center gap-2">
              <a
                href="tel:+917277234534"
                className={`p-2 rounded-lg transition-colors ${
                  scrolled
                    ? "text-[#7CB342] hover:bg-green-50"
                    : "text-green-300 hover:bg-white/10"
                }`}
                aria-label="Call us"
              >
                <Phone className="w-5 h-5" />
              </a>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  scrolled
                    ? "text-[#1a2332] hover:bg-gray-100"
                    : "text-white hover:bg-white/10"
                }`}
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 right-0 w-80 max-w-[85vw] h-full bg-white shadow-2xl animate-slide-in-left">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/logo-20hpc.png"
                  alt="HPC"
                  width={36}
                  height={36}
                  className="rounded-lg"
                />
                <span className="font-bold text-[#1a2332]">
                  Hygienic Pest Control
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-[#1a2332] font-medium hover:bg-blue-50 hover:text-[#42A5F5] transition-colors"
                >
                  {link.label}
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </Link>
              ))}
            </div>
            <div className="p-4 space-y-3 border-t">
              <a
                href="tel:+917277234534"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 text-green-700 font-medium"
              >
                <Phone className="w-5 h-5" />
                +91-7277234534
              </a>
              <Link href="/contact" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-[#42A5F5] hover:bg-[#1E88E5] text-white rounded-xl h-12 shadow-lg">
                  Book Free Inspection
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
