"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Reveal,
  SectionHeading,
  Eyebrow,
  AnimatedCounter,
} from "@/components/website/ui";
import { siteConfig, companyStats } from "@/lib/site-config";
import { fallbackImages } from "@/components/website/site-images";
import {
  Target,
  Heart,
  Eye,
  Users,
  Award,
  Leaf,
  Clock,
  ArrowRight,
  Phone,
  CheckCircle2,
  Building2,
  TrendingUp,
  Shield,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

interface SiteImage {
  id: string;
  key: string;
  title: string;
  alt: string | null;
  section: string;
  imageData: string;
}

/* Icons paired (in order) with companyStats for the Our Story stat panel. */
const statIcons: LucideIcon[] = [Users, Shield, Clock, Award];

const values = [
  {
    icon: Heart,
    title: "Customer First",
    desc: "Every decision we make starts with our customers. Your safety, comfort, and satisfaction are our top priorities.",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Approach",
    desc: "We believe in protecting the environment while protecting your spaces. Our solutions are safe for families and pets.",
  },
  {
    icon: Award,
    title: "Excellence in Service",
    desc: "We are committed to delivering the highest quality of pest control services with professionalism and integrity.",
  },
  {
    icon: TrendingUp,
    title: "Continuous Improvement",
    desc: "We continuously invest in training, technology, and research to stay ahead in pest management solutions.",
  },
];

const trustPoints = [
  "Licensed and government-registered pest control company",
  "Trained and certified technicians with years of expertise",
  "Use of WHO-approved, eco-friendly chemicals and products",
  "Transparent pricing with no hidden costs",
  "Comprehensive warranty on all treatments",
  "Quick response time and flexible scheduling",
  "Customized solutions for every property type",
  "Dedicated post-service support and follow-ups",
];

export default function AboutPage() {
  const [aboutImages, setAboutImages] = useState<SiteImage[]>([]);

  useEffect(() => {
    fetch("/api/site-images?section=ABOUT")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setAboutImages(d);
      })
      .catch(() => {});
  }, []);

  const storyImage = aboutImages[0]?.imageData || fallbackImages.about;
  const storyAlt =
    aboutImages[0]?.alt ||
    aboutImages[0]?.title ||
    "Hygienic Pest Control team at work";

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
            <Eyebrow icon={Building2} tone="blue">
              About Us
            </Eyebrow>
          </div>
          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink text-balance animate-fade-in-up delay-100">
            About Hygienic Pest Control
          </h1>
          <p className="mt-5 text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto animate-fade-in-up delay-200">
            Your trusted partner in professional pest control services across{" "}
            {siteConfig.region} since {siteConfig.since}.
          </p>
        </div>
      </section>

      {/* ==================== OUR STORY ==================== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Copy */}
            <Reveal direction="left">
              <Eyebrow icon={Sparkles} tone="blue" className="mb-4">
                Our Story
              </Eyebrow>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink text-balance leading-[1.15]">
                From a Small Beginning to{" "}
                <span className="text-gradient-brand">
                  {siteConfig.region}&apos;s Trusted Name
                </span>
              </h2>
              <div className="mt-6 space-y-4 text-slate-600 leading-relaxed">
                <p>
                  {siteConfig.legalName} was founded in {siteConfig.since} with a
                  simple yet powerful mission: to provide {siteConfig.region} with
                  world-class pest control services that are effective,
                  affordable, and environmentally responsible.
                </p>
                <p>
                  What started as a small team of passionate professionals has
                  grown into one of the most trusted pest control companies in the
                  region. We have served over 700 residential and commercial
                  clients, handling everything from termite infestations to
                  comprehensive integrated pest management programs.
                </p>
                <p>
                  Our team is equipped with modern tools, eco-friendly products,
                  and extensive training to tackle any pest challenge. We take
                  pride in our track record of 100% customer satisfaction and our
                  commitment to making homes and businesses pest-free.
                </p>
              </div>
            </Reveal>

            {/* Visual + stats */}
            <Reveal direction="right" delay={120}>
              <div className="relative rounded-2xl overflow-hidden shadow-lg ring-1 ring-slate-200 aspect-[16/10] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={storyImage}
                  alt={storyAlt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                {companyStats.map((stat, i) => {
                  const Icon = statIcons[i] ?? Users;
                  return (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm"
                    >
                      <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-gradient-to-br from-brand/10 to-green-bright/15 grid place-items-center text-brand">
                        <Icon className="w-6 h-6" />
                      </div>
                      <AnimatedCounter
                        end={stat.value}
                        suffix={stat.suffix}
                        className="block text-2xl sm:text-3xl font-extrabold text-ink"
                      />
                      <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ==================== MISSION & VISION ==================== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our Purpose"
            eyebrowIcon={Target}
            title="Mission & Vision"
            subtitle="What guides every treatment we perform and every promise we keep."
            className="mb-12 sm:mb-14"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <Reveal direction="up">
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand/10 to-green-bright/15 grid place-items-center text-brand mb-5">
                  <Target className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-ink mb-4">Our Mission</h3>
                <p className="text-slate-600 leading-relaxed">
                  To provide the most effective, safe, and affordable pest control
                  solutions across {siteConfig.region}. We are committed to
                  protecting the health and property of our customers through
                  innovative pest management practices while being responsible
                  stewards of the environment.
                </p>
              </div>
            </Reveal>

            <Reveal direction="up" delay={120}>
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand/10 to-green-bright/15 grid place-items-center text-green-dark mb-5">
                  <Eye className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-ink mb-4">Our Vision</h3>
                <p className="text-slate-600 leading-relaxed">
                  To be the leading pest control company in {siteConfig.region},
                  recognized for our excellence in service, innovation in pest
                  management solutions, and our unwavering commitment to customer
                  satisfaction and environmental sustainability. We envision a
                  pest-free community where homes and businesses thrive.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ==================== OUR VALUES ==================== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our Values"
            eyebrowTone="green"
            title="What Drives Us Every Day"
            subtitle="The principles behind every service call, treatment, and follow-up."
            className="mb-12 sm:mb-14"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {values.map((v, i) => (
              <Reveal key={v.title} direction="up" delay={(i % 2) * 90}>
                <div className="group h-full flex items-start gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-brand/30 hover:shadow-md">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand/10 to-green-bright/15 grid place-items-center text-brand shrink-0 transition-transform group-hover:scale-110">
                    <v.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-ink mb-2">{v.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== WHY JHARKHAND TRUSTS HPC ==================== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Trusted Locally"
            eyebrowIcon={Shield}
            eyebrowTone="green"
            title={`Why ${siteConfig.region} Trusts Hygienic Pest Control`}
            subtitle={`We have earned the trust of hundreds of families and businesses in ${siteConfig.region} through consistent quality and dedication.`}
            className="mb-12 sm:mb-14"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 max-w-4xl mx-auto">
            {trustPoints.map((item, i) => (
              <Reveal key={item} direction="up" delay={(i % 2) * 80}>
                <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-dark shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-600 leading-relaxed">
                    {item}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Reveal direction="up">
            <Eyebrow icon={Sparkles} tone="green" className="mb-4">
              Get Started
            </Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink text-balance">
              Ready to Make Your Space Pest-Free?
            </h2>
            <p className="mt-4 text-slate-500 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Get in touch with our team for a free consultation and inspection.
              We are just a call away.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
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
