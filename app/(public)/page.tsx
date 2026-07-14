"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EnquiryForm } from "@/components/website/enquiry-form";
import {
  Reveal,
  SectionHeading,
  Eyebrow,
  ServiceIcon,
  AnimatedCounter,
} from "@/components/website/ui";
import { siteConfig, companyStats } from "@/lib/site-config";
import { fallbackImages, serviceFallbackImage } from "@/components/website/site-images";
import {
  Phone,
  ArrowRight,
  Shield,
  Leaf,
  Clock,
  BadgeCheck,
  Target,
  Cpu,
  Star,
  Sparkles,
  Bug,
  ChevronRight,
  Mail,
  CheckCircle2,
  CalendarCheck,
  ClipboardCheck,
  SprayCan,
  ShieldCheck,
} from "lucide-react";

/* ---------- Types ---------- */
interface Service {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  icon?: string;
  features: string[];
}
interface Testimonial {
  id: string;
  name: string;
  location?: string;
  rating: number;
  text: string;
  service?: string;
}
interface SiteImage {
  id: string;
  key: string;
  title: string;
  alt: string | null;
  section: string;
  imageData: string;
  sortOrder: number;
}

const whyChooseUs = [
  {
    icon: BadgeCheck,
    title: "Certified Professionals",
    desc: "Trained, certified technicians with years of hands-on experience in pest management.",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Solutions",
    desc: "WHO-approved products that are tough on pests yet safe for your family and pets.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    desc: "Round-the-clock customer support — we're always available when you need us most.",
  },
  {
    icon: Sparkles,
    title: "Affordable Pricing",
    desc: "Competitive, transparent pricing with no hidden charges. Quality within your budget.",
  },
  {
    icon: Target,
    title: "Guaranteed Results",
    desc: "We stand behind our work. If pests return within the warranty period, so do we.",
  },
  {
    icon: Cpu,
    title: "Modern Equipment",
    desc: "State-of-the-art equipment and the latest techniques for thorough elimination.",
  },
];

const process = [
  { icon: CalendarCheck, title: "Book Inspection", desc: "Call or fill the form — pick a time that suits you." },
  { icon: ClipboardCheck, title: "Free Assessment", desc: "We inspect, identify the pest and its source." },
  { icon: SprayCan, title: "Custom Treatment", desc: "Targeted, eco-friendly treatment for your property." },
  { icon: ShieldCheck, title: "Follow-up & Warranty", desc: "Scheduled follow-ups backed by our warranty." },
];

const trustPoints = [
  "Licensed & Government-Registered",
  "Eco-Friendly Chemicals",
  "Same-Day Service Available",
  "Warranty-Backed Treatments",
];

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [siteImages, setSiteImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/services").then((r) => r.json()).catch(() => []),
      fetch("/api/testimonials").then((r) => r.json()).catch(() => []),
      fetch("/api/site-images").then((r) => r.json()).catch(() => []),
    ]).then(([s, t, imgs]) => {
      if (Array.isArray(s)) setServices(s);
      if (Array.isArray(t)) setTestimonials(t);
      if (Array.isArray(imgs)) setSiteImages(imgs);
      setLoading(false);
    });
  }, []);

  const heroAdmin = siteImages.find((i) => i.section === "HERO");
  const heroImage = heroAdmin?.imageData || fallbackImages.hero;

  const adminGallery = siteImages.filter((i) => i.section === "GALLERY");
  const galleryImages =
    adminGallery.length > 0
      ? adminGallery.map((i) => ({ src: i.imageData, title: i.title }))
      : fallbackImages.gallery.map((src, i) => ({ src, title: `Our Work ${i + 1}` }));

  return (
    <div className="overflow-x-clip">
      {/* ==================== HERO ==================== */}
      <section className="relative overflow-hidden bg-white">
        {/* Soft light background */}
        <div className="absolute inset-0 bg-dot-grid opacity-60" />
        <div className="absolute -top-24 -right-24 h-[26rem] w-[26rem] rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute top-40 -left-24 h-80 w-80 rounded-full bg-green-bright/10 blur-[110px]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-slate-50" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-14 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Copy */}
            <div className="max-w-xl">
              <div className="animate-fade-in-up">
                <Eyebrow icon={Shield} tone="green">
                  Trusted Pest Control in {siteConfig.region}
                </Eyebrow>
              </div>
              <h1 className="mt-5 text-[2rem] leading-[1.08] sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink text-balance animate-fade-in-up delay-100">
                Protecting your home &amp; business from pests{" "}
                <span className="text-gradient-brand">since {siteConfig.since}</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg animate-fade-in-up delay-200">
                Professional, eco-friendly pest control across {siteConfig.region}.
                We eliminate termites, cockroaches, mosquitoes, rodents and more —
                with guaranteed results.
              </p>

              <div className="mt-7 flex flex-wrap gap-3 animate-fade-in-up delay-300">
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="h-12 rounded-full px-6 bg-brand hover:bg-brand-dark text-white shadow-lg shadow-brand/25 btn-press text-base"
                  >
                    Book Free Inspection
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <a href={`tel:${siteConfig.telPrimary}`}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-full px-6 border-green-bright/40 text-green-dark hover:bg-green-bright/10 btn-press text-base"
                  >
                    <Phone className="w-5 h-5" />
                    Call Now
                  </Button>
                </a>
              </div>

              {/* Rating / trust */}
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 animate-fade-in-up delay-400">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-ink">4.9/5</span>
                  <span className="text-sm text-slate-400">rated service</span>
                </div>
                <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-ink">700+</span> customers
                  served in {siteConfig.region}
                </p>
              </div>
            </div>

            {/* Visual */}
            <div className="relative animate-fade-in-up delay-200">
              <div className="relative rounded-[1.75rem] overflow-hidden shadow-2xl shadow-brand/15 ring-1 ring-slate-200/80 aspect-[4/3] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImage}
                  alt={heroAdmin?.alt || "Professional pest control technician at work"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
              </div>

              {/* Floating accent cards (desktop) */}
              <div className="hidden sm:flex absolute -bottom-5 -left-4 lg:-left-6 items-center gap-3 rounded-2xl bg-white shadow-xl ring-1 ring-slate-100 px-4 py-3 animate-float">
                <span className="grid place-items-center w-10 h-10 rounded-xl bg-green-bright/15 text-green-dark">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-bold text-ink">100% Guarantee</p>
                  <p className="text-xs text-slate-400">Pest-free or we return</p>
                </div>
              </div>
              <div className="hidden sm:flex absolute -top-4 -right-3 lg:-right-5 items-center gap-2.5 rounded-2xl bg-white shadow-xl ring-1 ring-slate-100 px-4 py-3 animate-float-slow">
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-brand/10 text-brand">
                  <Leaf className="w-5 h-5" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-bold text-ink">Eco-Friendly</p>
                  <p className="text-xs text-slate-400">Family &amp; pet safe</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-14 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {companyStats.map((stat) => (
              <Reveal
                key={stat.label}
                direction="up"
                className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 text-center shadow-sm"
              >
                <AnimatedCounter
                  end={stat.value}
                  suffix={stat.suffix}
                  className="block text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink"
                />
                <p className="mt-1 text-xs sm:text-sm text-slate-500">{stat.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TRUST STRIP ==================== */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3">
            {trustPoints.map((point) => (
              <div key={point} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-green-dark shrink-0" />
                <span className="text-sm font-medium text-slate-600">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SERVICES ==================== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What We Offer"
            title="Our Professional Services"
            subtitle={`Comprehensive pest control solutions for homes and businesses across ${siteConfig.region}.`}
            className="mb-12 sm:mb-14"
          />

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 rounded-2xl skeleton-loading" />
              ))}
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, i) => (
                <Reveal key={service.id} direction="up" delay={(i % 3) * 90}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="group block h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover-lift"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand/10 to-green-bright/15 grid place-items-center text-brand mb-5 transition-colors group-hover:from-brand group-hover:to-brand-dark group-hover:text-white">
                      <ServiceIcon name={service.icon} className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-ink mb-2 group-hover:text-brand transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-3">
                      {service.shortDesc}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
                      Learn More
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bug className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">
                Our services are being updated. Please call us for details.
              </p>
              <a href={`tel:${siteConfig.telPrimary}`}>
                <Button className="bg-brand hover:bg-brand-dark text-white rounded-full">
                  <Phone className="w-4 h-4" />
                  Call {siteConfig.phones[0]}
                </Button>
              </a>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/services">
              <Button
                variant="outline"
                className="rounded-full px-8 h-11 border-brand text-brand hover:bg-brand hover:text-white"
              >
                View All Services
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== WHY CHOOSE US ==================== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why Us"
            eyebrowTone="green"
            title="Why Choose Hygienic Pest Control?"
            subtitle={`We're ${siteConfig.region}'s trusted pest control partner, delivering excellence with every service.`}
            className="mb-12 sm:mb-14"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {whyChooseUs.map((item, i) => (
              <Reveal key={item.title} direction="up" delay={(i % 3) * 90}>
                <div className="group h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-brand/30 hover:shadow-md">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand/10 to-green-bright/15 grid place-items-center text-brand mb-5 transition-transform group-hover:scale-110">
                    <item.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-ink mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PROCESS ==================== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How It Works"
            title="Pest-Free in 4 Simple Steps"
            subtitle="From your first call to a lasting, warranty-backed result — here's what to expect."
            className="mb-12 sm:mb-16"
          />
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {/* connecting line (desktop) */}
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-brand/20 via-green-bright/30 to-brand/20" />
            {process.map((step, i) => (
              <Reveal key={step.title} direction="up" delay={i * 100} className="relative text-center">
                <div className="relative mx-auto w-16 h-16 rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm grid place-items-center text-brand">
                  <step.icon className="w-7 h-7" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand text-white text-xs font-bold grid place-items-center shadow">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed max-w-[15rem] mx-auto">
                  {step.desc}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      {(loading || testimonials.length > 0) && (
        <section className="py-16 sm:py-20 lg:py-24 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Reviews"
              eyebrowIcon={Star}
              eyebrowTone="amber"
              title="What Our Customers Say"
              subtitle={`Hear from our satisfied customers across ${siteConfig.region}.`}
              className="mb-12 sm:mb-14"
            />
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-52 rounded-2xl skeleton-loading" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((t, i) => (
                  <Reveal key={t.id} direction="up" delay={(i % 3) * 90}>
                    <figure className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex gap-1 mb-3">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <Star
                            key={si}
                            className={`w-4 h-4 ${
                              si < t.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <blockquote className="text-sm text-slate-600 leading-relaxed mb-5">
                        &ldquo;{t.text}&rdquo;
                      </blockquote>
                      <figcaption className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-green-bright grid place-items-center text-white font-bold text-sm">
                          {t.name.charAt(0)}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-ink">
                            {t.name}
                          </span>
                          {t.location && (
                            <span className="block text-xs text-slate-400">
                              {t.location}
                            </span>
                          )}
                        </span>
                      </figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ==================== GALLERY ==================== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our Work"
            title="See Our Work in Action"
            subtitle={`Real results from our professional pest control treatments across ${siteConfig.region}.`}
            className="mb-12 sm:mb-14"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {galleryImages.map((img, i) => (
              <Reveal key={i} direction="scale" delay={(i % 4) * 70}>
                <div className="group relative overflow-hidden rounded-2xl aspect-square bg-slate-100 ring-1 ring-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 sm:p-4">
                    <p className="text-white text-sm font-medium">{img.title}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA + ENQUIRY ==================== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <Reveal direction="left">
              <Eyebrow icon={Sparkles} tone="green" className="mb-4">
                Get Started
              </Eyebrow>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink text-balance">
                Ready to get rid of pests for good?
              </h2>
              <p className="mt-4 text-slate-500 text-base sm:text-lg leading-relaxed max-w-lg">
                Don&apos;t let pests take over your home or business. Contact us
                today for a free inspection and a customized treatment plan.
              </p>

              <div className="mt-8 space-y-4">
                <a
                  href={`tel:${siteConfig.telPrimary}`}
                  className="flex items-center gap-3.5 group"
                >
                  <span className="w-11 h-11 rounded-xl bg-green-bright/15 text-green-dark grid place-items-center shrink-0 transition-colors group-hover:bg-green-bright group-hover:text-white">
                    <Phone className="w-5 h-5" />
                  </span>
                  <span>
                    <span className="block text-xs text-slate-400">Call us anytime</span>
                    <span className="block font-semibold text-ink">
                      {siteConfig.phones.join(" / ")}
                    </span>
                  </span>
                </a>
                <a
                  href={`mailto:${siteConfig.emailPrimary}`}
                  className="flex items-center gap-3.5 group"
                >
                  <span className="w-11 h-11 rounded-xl bg-brand/10 text-brand grid place-items-center shrink-0 transition-colors group-hover:bg-brand group-hover:text-white">
                    <Mail className="w-5 h-5" />
                  </span>
                  <span>
                    <span className="block text-xs text-slate-400">Email us</span>
                    <span className="block font-semibold text-ink break-all">
                      {siteConfig.emailPrimary}
                    </span>
                  </span>
                </a>
              </div>
            </Reveal>

            <Reveal direction="right" delay={120}>
              <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xl ring-1 ring-slate-100">
                <h3 className="text-xl font-bold text-ink">Quick Enquiry</h3>
                <p className="mt-1 text-sm text-slate-400 mb-6">
                  Fill out the form and we&apos;ll get back to you within 24 hours.
                </p>
                <EnquiryForm compact />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
