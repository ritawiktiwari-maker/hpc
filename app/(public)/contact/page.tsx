"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EnquiryForm } from "@/components/website/enquiry-form";
import { Reveal, Eyebrow } from "@/components/website/ui";
import { siteConfig } from "@/lib/site-config";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

/* ---------- Contact info cards (built from siteConfig) ---------- */
const tileTones: Record<string, string> = {
  green: "bg-gradient-to-br from-green-bright/15 to-green-bright/5 text-green-dark",
  blue: "bg-gradient-to-br from-brand/10 to-brand/5 text-brand",
  amber: "bg-gradient-to-br from-amber-500/15 to-amber-500/5 text-amber-600",
  violet: "bg-gradient-to-br from-violet-500/15 to-violet-500/5 text-violet-600",
};

function ContactFormSection() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service") || undefined;

  return <EnquiryForm preselectedService={preselectedService} />;
}

export default function ContactPage() {
  const contactCards = [
    {
      icon: Phone,
      title: "Phone",
      tone: "green" as const,
      items: siteConfig.phones.map((p) => ({
        label: p,
        href: `tel:${p.replace(/[^+\d]/g, "")}`,
      })),
    },
    {
      icon: Mail,
      title: "Email",
      tone: "blue" as const,
      items: siteConfig.emails.map((e) => ({
        label: e,
        href: `mailto:${e}`,
      })),
    },
    {
      icon: MapPin,
      title: "Location",
      tone: "amber" as const,
      items: [
        { label: `${siteConfig.city}, ${siteConfig.region}`, href: undefined },
        { label: "India", href: undefined },
      ],
    },
    {
      icon: Clock,
      title: "Working Hours",
      tone: "violet" as const,
      items: siteConfig.hours.map((h) => ({
        label: `${h.days}: ${h.time}`,
        href: undefined,
      })),
    },
  ];

  return (
    <div className="overflow-x-clip">
      {/* ==================== HERO ==================== */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-dot-grid opacity-60" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute -bottom-10 -left-20 h-72 w-72 rounded-full bg-green-bright/10 blur-[110px]" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-slate-50" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-14 sm:pt-20 sm:pb-16 text-center">
          <div className="animate-fade-in-up">
            <Eyebrow icon={MessageCircle} tone="blue">
              Get In Touch
            </Eyebrow>
          </div>
          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink text-balance animate-fade-in-up delay-100">
            Contact Us
          </h1>
          <p className="mt-5 text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            Have a pest problem? Reach out for a free inspection and expert
            advice from our team across {siteConfig.region}. We&apos;re here to
            help!
          </p>
        </div>
      </section>

      {/* ==================== CONTACT INFO CARDS ==================== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {contactCards.map((card, i) => (
              <Reveal key={card.title} direction="up" delay={(i % 4) * 90}>
                <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center hover-lift">
                  <div
                    className={`mx-auto w-14 h-14 rounded-2xl grid place-items-center mb-5 ${
                      tileTones[card.tone]
                    }`}
                  >
                    <card.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-ink mb-2">
                    {card.title}
                  </h3>
                  <div className="space-y-1">
                    {card.items.map((item) =>
                      item.href ? (
                        <a
                          key={item.label}
                          href={item.href}
                          className="block text-sm text-slate-600 hover:text-brand transition-colors break-words"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <p
                          key={item.label}
                          className="text-sm text-slate-500 break-words"
                        >
                          {item.label}
                        </p>
                      )
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FORM + MAP ==================== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
            {/* Enquiry form */}
            <div className="lg:col-span-3">
              <Reveal direction="up">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                  <h2 className="text-2xl font-bold text-ink">
                    Send Us an Enquiry
                  </h2>
                  <p className="mt-1 text-sm text-slate-400 mb-6">
                    Fill out the form below and our team will get back to you
                    within 24 hours.
                  </p>
                  <Suspense
                    fallback={
                      <div className="space-y-4">
                        <div className="h-11 skeleton-loading rounded-xl" />
                        <div className="h-11 skeleton-loading rounded-xl" />
                        <div className="h-11 skeleton-loading rounded-xl" />
                      </div>
                    }
                  >
                    <ContactFormSection />
                  </Suspense>
                </div>
              </Reveal>
            </div>

            {/* Location map */}
            <div className="lg:col-span-2">
              <Reveal direction="up" delay={120} className="h-full">
                <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="p-5 border-b border-slate-100">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-ink">
                      <MapPin className="w-5 h-5 text-brand" />
                      Our Location
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {siteConfig.address}
                    </p>
                  </div>
                  <div className="flex-1 min-h-[320px] bg-slate-100">
                    <iframe
                      src="https://www.google.com/maps?q=Ranchi%2C%20Jharkhand&output=embed"
                      className="w-full h-full min-h-[320px] border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Our location"
                    />
                  </div>
                  <div className="p-5 border-t border-slate-100">
                    <a href={`tel:${siteConfig.telPrimary}`} className="block">
                      <Button className="w-full h-12 rounded-full px-6 bg-brand hover:bg-brand-dark text-white shadow-lg shadow-brand/25 btn-press">
                        <Phone className="w-5 h-5" />
                        Call {siteConfig.phones[0]}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
