"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnquiryForm } from "@/components/website/enquiry-form";
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
  Users,
  Sparkles,
  Bug,
  ChevronRight,
  Mail,
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

/* ---------- Icon Map ---------- */
const iconMap: Record<string, React.ReactNode> = {
  Bug: <Bug className="w-6 h-6" />,
  Shield: <Shield className="w-6 h-6" />,
  Target: <Target className="w-6 h-6" />,
  Leaf: <Leaf className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Users: <Users className="w-6 h-6" />,
};

/* ---------- Animated Counter ---------- */
function AnimatedCounter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const step = Math.max(1, Math.floor(end / (duration / 16)));
          let current = 0;
          const timer = setInterval(() => {
            current += step;
            if (current >= end) {
              current = end;
              clearInterval(timer);
            }
            setCount(current);
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
      {count}
      {suffix}
    </div>
  );
}

/* ---------- Scroll Reveal with Direction ---------- */
type SlideDirection = "up" | "down" | "left" | "right" | "scale" | "blur";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

const directionClasses: Record<SlideDirection, { hidden: string; visible: string }> = {
  up: { hidden: "opacity-0 translate-y-10", visible: "opacity-100 translate-y-0" },
  down: { hidden: "opacity-0 -translate-y-10", visible: "opacity-100 translate-y-0" },
  left: { hidden: "opacity-0 -translate-x-12", visible: "opacity-100 translate-x-0" },
  right: { hidden: "opacity-0 translate-x-12", visible: "opacity-100 translate-x-0" },
  scale: { hidden: "opacity-0 scale-90", visible: "opacity-100 scale-100" },
  blur: { hidden: "opacity-0 blur-sm scale-95", visible: "opacity-100 blur-0 scale-100" },
};

function Section({
  children,
  className = "",
  direction = "up",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: SlideDirection;
  delay?: number;
}) {
  const { ref, visible } = useScrollReveal();
  const cls = directionClasses[direction];
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? cls.visible : cls.hidden
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ========== HOMEPAGE ========== */
export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/services").then((r) => r.json()).catch(() => []),
      fetch("/api/testimonials").then((r) => r.json()).catch(() => []),
    ]).then(([s, t]) => {
      if (Array.isArray(s)) setServices(s);
      if (Array.isArray(t)) setTestimonials(t);
      setLoading(false);
    });
  }, []);


  const whyChooseUs = [
    {
      icon: <BadgeCheck className="w-7 h-7" />,
      title: "Certified Professionals",
      desc: "Our technicians are trained and certified with years of experience in pest management.",
    },
    {
      icon: <Leaf className="w-7 h-7" />,
      title: "Eco-Friendly Solutions",
      desc: "We use environmentally safe products that are effective yet harmless to your family and pets.",
    },
    {
      icon: <Clock className="w-7 h-7" />,
      title: "24/7 Support",
      desc: "Round-the-clock customer support. We are always available when you need us most.",
    },
    {
      icon: <Sparkles className="w-7 h-7" />,
      title: "Affordable Pricing",
      desc: "Competitive pricing with no hidden charges. Quality pest control within your budget.",
    },
    {
      icon: <Target className="w-7 h-7" />,
      title: "Guaranteed Results",
      desc: "We guarantee pest-free results. If pests return within the warranty period, so do we.",
    },
    {
      icon: <Cpu className="w-7 h-7" />,
      title: "Modern Equipment",
      desc: "State-of-the-art equipment and latest techniques for thorough pest elimination.",
    },
  ];

  return (
    <div>
      {/* ==================== HERO ==================== */}
      <section className="hero-section relative flex items-center overflow-hidden">
        {/* Background - GPU composited layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1a0f] via-[#1a2332] to-[#0f1d12] will-change-auto" />
        {/* Animated CSS Video-like Background */}
        <div className="absolute inset-0 hero-bg-animation will-change-[opacity]" />
        {/* Crawling bugs silhouettes - hidden on small screens for performance */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none will-change-transform hidden sm:block">
          <div className="hero-bug hero-bug-1">🐛</div>
          <div className="hero-bug hero-bug-2">🪲</div>
          <div className="hero-bug hero-bug-3">🐜</div>
          <div className="hero-bug hero-bug-4">🦟</div>
          <div className="hero-bug hero-bug-5">🪳</div>
          <div className="hero-bug hero-bug-6">🐜</div>
          <div className="hero-bug hero-bug-7">🦗</div>
          <div className="hero-bug hero-bug-8">🪲</div>
        </div>
        {/* Floating particles - hidden on small screens */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none will-change-transform hidden sm:block">
          <div className="hero-particle hero-particle-1" />
          <div className="hero-particle hero-particle-2" />
          <div className="hero-particle hero-particle-3" />
          <div className="hero-particle hero-particle-4" />
          <div className="hero-particle hero-particle-5" />
          <div className="hero-particle hero-particle-6" />
        </div>
        {/* Hex grid overlay */}
        <div className="absolute inset-0 hero-hex-grid opacity-[0.04]" />
        {/* Accent glows - responsive sizes */}
        <div className="absolute top-1/4 right-0 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full bg-[#7CB342]/10 blur-[100px] sm:blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 rounded-full bg-[#42A5F5]/8 blur-[80px] sm:blur-[120px]" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 rounded-full bg-red-500/5 blur-[60px] sm:blur-[100px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6 sm:pt-24 sm:pb-8 lg:pt-16 lg:pb-6 w-full flex flex-col justify-center min-h-0">
          <div className="max-w-3xl">
            <div className="hero-fade hero-fade-1">
              <Badge className="bg-[#7CB342]/20 text-[#7CB342] border-[#7CB342]/30 mb-3 sm:mb-4 lg:mb-5 text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-full">
                <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                Trusted Pest Control in Ranchi
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-3 sm:mb-4 lg:mb-5 hero-fade hero-fade-2">
              Protecting Your Home &amp;
              <br />
              Business from Pests
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#42A5F5] to-[#7CB342]">
                Since 2019
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mb-4 sm:mb-6 lg:mb-6 max-w-xl leading-relaxed hero-fade hero-fade-3">
              Professional, eco-friendly pest control services in Ranchi,
              Jharkhand. We eliminate termites, cockroaches, mosquitoes, rodents
              and more with guaranteed results.
            </p>

            <div className="flex flex-row flex-wrap gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8 lg:mb-10 hero-fade hero-fade-4">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-[#42A5F5] hover:bg-[#1E88E5] text-white rounded-full px-5 sm:px-8 h-10 sm:h-12 lg:h-13 text-sm sm:text-base shadow-xl shadow-blue-500/30 btn-press"
                >
                  Book Free Inspection
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2" />
                </Button>
              </Link>
              <a href="tel:+917277234534">
                <Button
                  size="lg"
                  className="rounded-full px-5 sm:px-8 h-10 sm:h-12 lg:h-13 text-sm sm:text-base bg-[#7CB342] hover:bg-[#689F38] text-white shadow-xl shadow-green-500/30 btn-press"
                >
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                  Call Now
                </Button>
              </a>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {[
              { value: 700, suffix: "+", label: "Happy Customers" },
              { value: 15, suffix: "+", label: "Services" },
              { value: 5, suffix: "+", label: "Years Experience" },
              { value: 100, suffix: "%", label: "Satisfaction" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 lg:p-5 text-center hero-fade hero-fade-${5 + i}`}
              >
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SERVICES ==================== */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section direction="down">
            <div className="text-center mb-8 sm:mb-12 lg:mb-14">
              <Badge className="bg-blue-50 text-[#42A5F5] border-blue-200 mb-3 sm:mb-4 text-sm rounded-full">
                What We Offer
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1a2332] mb-3 sm:mb-4">
                Our Professional Services
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-base sm:text-lg">
                Comprehensive pest control solutions for residential and
                commercial properties across Ranchi.
              </p>
            </div>
          </Section>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-52 rounded-2xl skeleton-loading" />
              ))}
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, i) => (
                <Section
                  key={service.id}
                  direction={i % 3 === 0 ? "left" : i % 3 === 1 ? "up" : "right"}
                  delay={i * 100}
                >
                  <Card
                    className="p-6 border-0 shadow-md hover-lift cursor-pointer group bg-white rounded-2xl overflow-hidden"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#42A5F5]/10 to-[#7CB342]/10 flex items-center justify-center text-[#42A5F5] mb-4 group-hover:from-[#42A5F5] group-hover:to-[#1E88E5] group-hover:text-white transition-all duration-300">
                      {iconMap[service.icon || "Bug"] || (
                        <Bug className="w-6 h-6" />
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-[#1a2332] mb-2 group-hover:text-[#42A5F5] transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                      {service.shortDesc}
                    </p>
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex items-center text-[#42A5F5] text-sm font-semibold hover:gap-2 transition-all"
                    >
                      Learn More
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Card>
                </Section>
              ))}
            </div>
          ) : (
            <Section direction="scale">
              <div className="text-center py-12">
                <Bug className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400">
                  Our services are being updated. Please call us for details.
                </p>
                <a href="tel:+917277234534">
                  <Button className="mt-4 bg-[#42A5F5] hover:bg-[#1E88E5] text-white rounded-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Call +91-7277234534
                  </Button>
                </a>
              </div>
            </Section>
          )}

          <Section direction="up" delay={200}>
            <div className="text-center mt-10">
              <Link href="/services">
                <Button
                  variant="outline"
                  className="rounded-full px-8 border-[#42A5F5] text-[#42A5F5] hover:bg-[#42A5F5] hover:text-white"
                >
                  View All Services
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </Section>
        </div>
      </section>

      {/* ==================== WHY CHOOSE US ==================== */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section direction="left">
            <div className="text-center mb-8 sm:mb-12 lg:mb-14">
              <Badge className="bg-green-50 text-[#7CB342] border-green-200 mb-3 sm:mb-4 text-sm rounded-full">
                Why Us
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1a2332] mb-3 sm:mb-4">
                Why Choose Hygienic Pest Control?
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-base sm:text-lg">
                We are Ranchi&apos;s trusted pest control partner, delivering
                excellence with every service.
              </p>
            </div>
          </Section>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((item, i) => (
              <Section
                key={item.title}
                direction={i < 3 ? "up" : "scale"}
                delay={i * 100}
              >
                <div
                  className="group p-6 rounded-2xl border border-gray-100 hover:border-[#42A5F5]/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#42A5F5]/10 to-[#7CB342]/10 flex items-center justify-center text-[#42A5F5] mb-4 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#1a2332] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section direction="right">
            <div className="text-center mb-8 sm:mb-12 lg:mb-14">
              <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200 mb-3 sm:mb-4 text-sm rounded-full">
                <Star className="w-3.5 h-3.5 mr-1.5" />
                Reviews
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1a2332] mb-3 sm:mb-4">
                What Our Customers Say
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-base sm:text-lg">
                Hear from our satisfied customers across Ranchi and Jharkhand.
              </p>
            </div>
          </Section>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 rounded-2xl skeleton-loading" />
              ))}
            </div>
          ) : testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <Section
                  key={t.id}
                  direction={i % 2 === 0 ? "left" : "right"}
                  delay={i * 120}
                >
                  <Card
                    className="p-6 border-0 shadow-md rounded-2xl bg-white"
                  >
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star
                          key={si}
                          className={`w-4 h-4 ${
                            si < t.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#42A5F5] to-[#7CB342] flex items-center justify-center text-white font-bold text-sm">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#1a2332] text-sm">
                          {t.name}
                        </p>
                        {t.location && (
                          <p className="text-gray-400 text-xs">{t.location}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                </Section>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2332] via-[#1e3a5f] to-[#1a2332]" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#42A5F5]/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#7CB342]/10 blur-[100px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <Section direction="left">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4 sm:mb-6">
                  Ready to Get Rid of Pests?
                </h2>
                <p className="text-gray-300 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">
                  Don&apos;t let pests take over your home or business. Contact
                  us today for a free inspection and customized treatment plan.
                </p>
                <div className="space-y-4 mb-8">
                  <a
                    href="tel:+917277234534"
                    className="flex items-center gap-3 text-white hover:text-[#42A5F5] transition-colors"
                  >
                    <span className="w-10 h-10 rounded-full bg-[#7CB342] flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </span>
                    <span>
                      <span className="block text-sm text-gray-400">
                        Call us anytime
                      </span>
                      <span className="font-semibold">
                        +91-7277234534 / +91-9523591904
                      </span>
                    </span>
                  </a>
                  <a
                    href="mailto:hpcplranchi@gmail.com"
                    className="flex items-center gap-3 text-white hover:text-[#42A5F5] transition-colors"
                  >
                    <span className="w-10 h-10 rounded-full bg-[#42A5F5] flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </span>
                    <span>
                      <span className="block text-sm text-gray-400">
                        Email us
                      </span>
                      <span className="font-semibold">
                        hpcplranchi@gmail.com
                      </span>
                    </span>
                  </a>
                </div>
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="bg-[#42A5F5] hover:bg-[#1E88E5] text-white rounded-full px-8 shadow-xl shadow-blue-500/30 btn-press"
                  >
                    Book Free Inspection
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </Section>

            <Section direction="right" delay={200}>
              <Card className="p-6 sm:p-8 rounded-2xl border-0 shadow-2xl bg-white">
                <h3 className="text-xl font-bold text-[#1a2332] mb-1">
                  Quick Enquiry
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  Fill out the form and we will get back to you within 24 hours.
                </p>
                <EnquiryForm compact />
              </Card>
            </Section>
          </div>
        </div>
      </section>
    </div>
  );
}
