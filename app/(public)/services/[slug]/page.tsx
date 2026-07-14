"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal, ServiceIcon, Eyebrow } from "@/components/website/ui";
import { siteConfig } from "@/lib/site-config";
import { serviceFallbackImage } from "@/components/website/site-images";
import {
  Bug,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Phone,
  Sparkles,
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

export default function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [service, setService] = useState<Service | null>(null);
  const [relatedServices, setRelatedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/services?slug=${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((d) => setService(d))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setRelatedServices(d.filter((s: Service) => s.slug !== slug).slice(0, 3));
        }
      })
      .catch(() => {});
  }, [slug]);

  /* ---------------------- Loading skeleton (light) ---------------------- */
  if (loading) {
    return (
      <div className="overflow-x-clip">
        <section className="relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-dot-grid opacity-60" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-14 sm:pt-20 sm:pb-16">
            <div className="h-4 w-36 rounded-full bg-slate-100 animate-pulse mb-8" />
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-9 w-64 max-w-full rounded-lg bg-slate-100 animate-pulse" />
                <div className="h-5 w-full max-w-md rounded bg-slate-100 animate-pulse" />
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 sm:py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
                <div className="h-7 w-48 rounded-lg bg-slate-100 animate-pulse" />
                <div className="space-y-2.5">
                  <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
                  <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
                  <div className="h-4 w-2/3 rounded bg-slate-100 animate-pulse" />
                </div>
              </div>
              <div className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* ---------------------- Not found (light) ---------------------- */
  if (notFound || !service) {
    return (
      <div className="overflow-x-clip">
        <section className="relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-dot-grid opacity-60" />
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand/10 blur-[120px]" />
          <div className="absolute -bottom-10 -left-20 h-72 w-72 rounded-full bg-green-bright/10 blur-[110px]" />
          <div className="relative mx-auto max-w-md px-4 sm:px-6 lg:px-8 pt-24 pb-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand/10 to-green-bright/15 grid place-items-center text-brand mx-auto mb-5">
              <Bug className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink mb-3">
              Service Not Found
            </h1>
            <p className="text-slate-500 leading-relaxed mb-8">
              The service you are looking for does not exist or has been removed.
            </p>
            <Link href="/services">
              <Button className="h-12 rounded-full px-6 bg-brand hover:bg-brand-dark text-white shadow-lg shadow-brand/25 btn-press">
                <ArrowLeft className="w-4 h-4" />
                View All Services
              </Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const serviceImage = service.image || serviceFallbackImage(service.slug);

  return (
    <div className="overflow-x-clip">
      {/* ==================== HERO (light) ==================== */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-dot-grid opacity-60" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute -bottom-10 -left-20 h-72 w-72 rounded-full bg-green-bright/10 blur-[110px]" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-slate-50" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-14 sm:pt-20 sm:pb-16">
          <Reveal direction="down">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Services
            </Link>
          </Reveal>

          <Reveal direction="up" delay={80}>
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand/10 to-green-bright/15 grid place-items-center text-brand shrink-0">
                <ServiceIcon name={service.icon} className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
              <div className="min-w-0">
                <Eyebrow icon={Sparkles} tone="green" className="mb-3">
                  Professional Service
                </Eyebrow>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink text-balance">
                  {service.name}
                </h1>
                <p className="mt-3 text-base sm:text-lg text-slate-500 leading-relaxed text-pretty max-w-2xl">
                  {service.shortDesc}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================== CONTENT ==================== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
            {/* Main */}
            <div className="lg:col-span-2">
              <Reveal direction="up">
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={serviceImage}
                    alt={service.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
              </Reveal>

              <Reveal direction="up" delay={80} className="mt-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink mb-4">
                  About This Service
                </h2>
                <div
                  className="text-slate-600 leading-relaxed whitespace-pre-line text-pretty"
                  dangerouslySetInnerHTML={{ __html: service.description }}
                />
              </Reveal>

              {service.features.length > 0 && (
                <Reveal direction="up" delay={120} className="mt-10">
                  <h3 className="text-xl sm:text-2xl font-bold text-ink mb-5">
                    What&apos;s Included
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.features.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5"
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-dark shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600">{f}</span>
                      </div>
                    ))}
                  </div>
                </Reveal>
              )}
            </div>

            {/* Sidebar CTA */}
            <div className="lg:col-span-1">
              <Reveal direction="up" delay={80}>
                <div className="rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white p-6 shadow-lg shadow-brand/25 sticky top-24">
                  <h3 className="text-xl font-bold mb-3">Book This Service</h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-6">
                    Get a free inspection and a customized quote for{" "}
                    {service.name.toLowerCase()}. Our experts are ready to help.
                  </p>
                  <Link href={`/contact?service=${service.slug}`} className="block">
                    <Button className="w-full h-12 rounded-full bg-white text-brand hover:bg-slate-50 font-semibold shadow-sm btn-press mb-3">
                      Get Free Quote
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <a href={`tel:${siteConfig.telPrimary}`} className="block">
                    <Button className="w-full h-12 rounded-full bg-white/15 text-white border border-white/30 hover:bg-white/25 font-semibold btn-press">
                      <Phone className="w-4 h-4" />
                      Call Now
                    </Button>
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== RELATED SERVICES ==================== */}
      {relatedServices.length > 0 && (
        <section className="py-16 sm:py-20 lg:py-24 bg-slate-50 border-t border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal direction="up">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-ink text-center text-balance mb-12 sm:mb-14">
                Other Services You May Need
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedServices.map((rs, i) => (
                <Reveal key={rs.id} direction="up" delay={(i % 3) * 90}>
                  <div className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover-lift">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand/10 to-green-bright/15 grid place-items-center text-brand shrink-0 transition-colors group-hover:from-brand group-hover:to-brand-dark group-hover:text-white">
                        <ServiceIcon name={rs.icon} className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-ink group-hover:text-brand transition-colors">
                        {rs.name}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed mb-5 line-clamp-3">
                      {rs.shortDesc}
                    </p>
                    <Link href={`/services/${rs.slug}`} className="mt-auto">
                      <Button
                        variant="outline"
                        className="w-full rounded-full border-brand text-brand hover:bg-brand hover:text-white"
                      >
                        Learn More
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
