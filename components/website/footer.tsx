import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  ChevronRight,
  Shield,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig, navLinks, footerServices } from "@/lib/site-config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-slate-50 text-slate-600 border-t border-slate-200">
      {/* Brand accent line */}
      <div className="h-1 w-full brand-accent-bar" />

      {/* CTA strip */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-px overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-dark px-6 py-8 sm:px-10 sm:py-10 my-10 sm:my-12 shadow-xl shadow-brand/20">
          <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-green-bright/20 blur-2xl" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white text-balance">
                Got a pest problem? Let&apos;s solve it.
              </h3>
              <p className="mt-2 text-blue-50/90 text-sm sm:text-base">
                Book a free inspection today — no obligation, no hidden charges.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link href="/contact">
                <Button className="h-12 rounded-full px-6 bg-white text-brand hover:bg-blue-50 font-semibold shadow-lg btn-press">
                  Book Free Inspection
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href={`tel:${siteConfig.telPrimary}`}>
                <Button className="h-12 rounded-full px-6 bg-white/15 text-white border border-white/30 hover:bg-white/25 font-semibold btn-press">
                  <Phone className="w-4 h-4" />
                  Call Now
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-6 pt-2 sm:pt-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Company */}
          <div className="col-span-2 lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/images/logo-20hpc.png"
                alt="Hygienic Pest Control"
                width={44}
                height={44}
                className="rounded-lg h-11 w-11"
              />
              <div className="leading-tight">
                <span className="block text-base font-extrabold text-ink">
                  {siteConfig.name}
                </span>
                <span className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-green-dark">
                  Pvt Ltd
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500 max-w-xs">
              Professional, eco-friendly pest control in {siteConfig.region}.
              Protecting homes and businesses since {siteConfig.since}.
            </p>
            <div className="flex gap-2.5">
              {[
                { icon: Facebook, href: siteConfig.social.facebook, label: "Facebook" },
                { icon: Instagram, href: siteConfig.social.instagram, label: "Instagram" },
                { icon: Twitter, href: siteConfig.social.twitter, label: "Twitter" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-white hover:bg-brand hover:border-brand transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-bold text-ink mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand" />
              Our Services
            </h4>
            <ul className="space-y-2.5">
              {footerServices.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand transition-colors"
                  >
                    <ChevronRight className="w-3 h-3 -ml-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-bold text-ink mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand transition-colors"
                  >
                    <ChevronRight className="w-3 h-3 -ml-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-ink mb-4">Contact Us</h4>
            <div className="space-y-3.5">
              <a
                href={`tel:${siteConfig.telPrimary}`}
                className="flex items-start gap-3 text-sm text-slate-500 hover:text-brand transition-colors"
              >
                <Phone className="w-4 h-4 mt-0.5 text-green-dark shrink-0" />
                <span>
                  {siteConfig.phones.map((p) => (
                    <span key={p} className="block">
                      {p}
                    </span>
                  ))}
                </span>
              </a>
              <a
                href={`mailto:${siteConfig.emailPrimary}`}
                className="flex items-start gap-3 text-sm text-slate-500 hover:text-brand transition-colors"
              >
                <Mail className="w-4 h-4 mt-0.5 text-green-dark shrink-0" />
                <span>
                  {siteConfig.emails.map((e) => (
                    <span key={e} className="block break-all">
                      {e}
                    </span>
                  ))}
                </span>
              </a>
              <div className="flex items-start gap-3 text-sm text-slate-500">
                <MapPin className="w-4 h-4 mt-0.5 text-green-dark shrink-0" />
                <span>{siteConfig.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-slate-400">
            <p>
              &copy; {year} {siteConfig.legalName}. All rights reserved.
            </p>
            <p>
              Serving {siteConfig.region} with professional pest control since{" "}
              {siteConfig.since}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
