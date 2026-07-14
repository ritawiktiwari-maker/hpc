"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Reveal,
  SectionHeading,
  Eyebrow,
  ServiceIcon,
} from "@/components/website/ui";
import { siteConfig } from "@/lib/site-config";
import { serviceFallbackImage } from "@/components/website/site-images";
import {
  Shield,
  Sparkles,
  Phone,
  ArrowRight,
  CheckCircle2,
  Bug,
} from "lucide-react";

interface Service {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  description: string;
  icon?: string;
  image?: string | null;
  features: string[];
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setServices(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="overflow-x-clip">
      {/* ==================== HERO ==================== */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-dot-grid opacity-60" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute -bottom-10 -left-20 h-72 w-72 rounded-full bg-green-bright/10 blur-[110px]" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-slate-50" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-14 sm:pt-20 sm:pb-16 text-center">
          <Reveal direction="down">
            <Eyebrow icon={Shield} tone="green" className="mb-5">
              Professional Solutions
            </Eyebrow>
          </Reveal>
          <Reveal direction="up" delay={60}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink text-balance">
              Our Services
            </h1>
          </Reveal>
          <Reveal direction="up" delay={120}>
            <p className="mt-5 mx-auto max-w-2xl text-slate-500 text-lg leading-relaxed text-pretty">
              Comprehensive pest management for homes, offices, and commercial
              spaces across {siteConfig.region}. Eco-friendly treatments,
              guaranteed results, and support whenever you need it.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ==================== SERVICES GRID ==================== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-96 rounded-2xl skeleton-loading" />
              ))}
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, i) => (
                <Reveal key={service.id} direction="up" delay={(i % 3) * 90}>
                  <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover-lift">
                    {/* Image */}
                    <div className="relative h-44 overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={service.image || serviceFallbackImage(service.slug)}
                        alt={service.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent" />
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand/10 to-green-bright/15 text-brand transition-colors group-hover:from-brand group-hover:to-brand-dark group-hover:text-white">
                        <ServiceIcon name={service.icon} className="h-6 w-6" />
                      </div>
                      <h3 className="mb-2 text-lg font-bold text-ink transition-colors group-hover:text-brand">
                        {service.name}
                      </h3>
                      <p className="mb-4 text-sm leading-relaxed text-slate-500 line-clamp-3">
                        {service.shortDesc}
                      </p>

                      {service.features.length > 0 && (
                        <ul className="mb-6 space-y-2">
                          {service.features.slice(0, 4).map((f, fi) => (
                            <li
                              key={fi}
                              className="flex items-start gap-2 text-sm text-slate-600"
                            >
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-dark" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="mt-auto flex gap-3 border-t border-slate-100 pt-5">
                        <Link href={`/services/${service.slug}`} className="flex-1">
                          <Button
                            variant="outline"
                            className="w-full rounded-full border-brand text-brand hover:bg-brand hover:text-white"
                          >
                            Learn More
                          </Button>
                        </Link>
                        <Link
                          href={`/contact?service=${service.slug}`}
                          className="flex-1"
                        >
                          <Button className="w-full rounded-full bg-brand hover:bg-brand-dark text-white shadow-lg shadow-brand/25 btn-press">
                            Get Quote
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bug className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <h3 className="mb-2 text-xl font-bold text-ink">
                Services Coming Soon
              </h3>
              <p className="mb-6 text-slate-400">
                Our service catalog is being updated. Please call us for details.
              </p>
              <a href={`tel:${siteConfig.telPrimary}`}>
                <Button className="h-12 rounded-full px-6 bg-brand hover:bg-brand-dark text-white shadow-lg shadow-brand/25 btn-press">
                  <Phone className="h-4 w-4" />
                  Call {siteConfig.phones[0]}
                </Button>
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Reveal direction="up">
            <Eyebrow icon={Sparkles} tone="green" className="mb-4">
              Get Started
            </Eyebrow>
          </Reveal>
          <Reveal direction="up" delay={60}>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink text-balance">
              Need a Custom Solution?
            </h2>
          </Reveal>
          <Reveal direction="up" delay={120}>
            <p className="mt-4 mx-auto max-w-2xl text-slate-500 text-base sm:text-lg leading-relaxed text-pretty">
              Every pest problem is unique. Contact us for a free inspection and a
              customized treatment plan tailored to your property across{" "}
              {siteConfig.region}.
            </p>
          </Reveal>
          <Reveal direction="up" delay={180}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="h-12 rounded-full px-6 bg-brand hover:bg-brand-dark text-white shadow-lg shadow-brand/25 btn-press text-base"
                >
                  Book Free Inspection
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href={`tel:${siteConfig.telPrimary}`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full px-6 border-green-bright/40 text-green-dark hover:bg-green-bright/10 btn-press text-base"
                >
                  <Phone className="h-5 w-5" />
                  {siteConfig.phones[0]}
                </Button>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
