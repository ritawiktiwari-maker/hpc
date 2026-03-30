"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bug,
  Shield,
  Target,
  Leaf,
  Sparkles,
  Users,
  Phone,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

interface Service {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  description: string;
  icon?: string;
  features: string[];
}

const iconMap: Record<string, React.ReactNode> = {
  Bug: <Bug className="w-7 h-7" />,
  Shield: <Shield className="w-7 h-7" />,
  Target: <Target className="w-7 h-7" />,
  Leaf: <Leaf className="w-7 h-7" />,
  Sparkles: <Sparkles className="w-7 h-7" />,
  Users: <Users className="w-7 h-7" />,
};

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
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

function RevealDiv({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
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
    <div>
      {/* Hero Banner */}
      <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2332] via-[#1e3a5f] to-[#1a2332]" />
        <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-[#42A5F5]/10 blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 rounded-full bg-[#7CB342]/10 blur-[80px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-[#7CB342]/20 text-[#7CB342] border-[#7CB342]/30 mb-4 text-sm rounded-full">
            <Shield className="w-3.5 h-3.5 mr-1.5" />
            Professional Solutions
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 animate-fade-in">
            Our Services
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto animate-fade-in-up">
            Comprehensive pest management solutions for homes, offices, and
            commercial spaces across Jharkhand.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 rounded-2xl skeleton-loading"
                />
              ))}
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, i) => (
                <RevealDiv key={service.id} delay={i * 80}>
                  <Card className="p-6 border-0 shadow-md hover-lift rounded-2xl bg-white h-full flex flex-col group">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#42A5F5]/10 to-[#7CB342]/10 flex items-center justify-center text-[#42A5F5] mb-4 group-hover:from-[#42A5F5] group-hover:to-[#1E88E5] group-hover:text-white transition-all duration-300">
                      {iconMap[service.icon || "Bug"] || (
                        <Bug className="w-7 h-7" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-[#1a2332] mb-2 group-hover:text-[#42A5F5] transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 leading-relaxed flex-1">
                      {service.shortDesc}
                    </p>

                    {service.features.length > 0 && (
                      <ul className="space-y-1.5 mb-5">
                        {service.features.slice(0, 4).map((f, fi) => (
                          <li
                            key={fi}
                            className="flex items-start gap-2 text-sm text-gray-600"
                          >
                            <CheckCircle className="w-4 h-4 text-[#7CB342] shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
                      <Link
                        href={`/services/${service.slug}`}
                        className="flex-1"
                      >
                        <Button
                          variant="outline"
                          className="w-full rounded-xl border-[#42A5F5] text-[#42A5F5] hover:bg-[#42A5F5] hover:text-white"
                        >
                          Learn More
                        </Button>
                      </Link>
                      <Link
                        href={`/contact?service=${service.slug}`}
                        className="flex-1"
                      >
                        <Button className="w-full rounded-xl bg-[#42A5F5] hover:bg-[#1E88E5] text-white btn-press">
                          Get Quote
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </RevealDiv>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Bug className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#1a2332] mb-2">
                Services Coming Soon
              </h3>
              <p className="text-gray-500 mb-6">
                Our service catalog is being updated. Please contact us directly
                for assistance.
              </p>
              <a href="tel:+917277234534">
                <Button className="bg-[#42A5F5] hover:bg-[#1E88E5] text-white rounded-full px-8 btn-press">
                  <Phone className="w-4 h-4 mr-2" />
                  Call +91-7277234534
                </Button>
              </a>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <RevealDiv>
            <h2 className="text-3xl font-extrabold text-[#1a2332] mb-4">
              Need a Custom Solution?
            </h2>
            <p className="text-gray-500 text-lg mb-8 max-w-2xl mx-auto">
              Every pest problem is unique. Contact us for a free inspection and
              a customized treatment plan tailored to your needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-[#42A5F5] hover:bg-[#1E88E5] text-white rounded-full px-8 shadow-lg shadow-blue-500/25 btn-press"
                >
                  Book Free Inspection
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="tel:+917277234534">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 border-[#1a2332] text-[#1a2332] hover:bg-[#1a2332] hover:text-white"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  +91-7277234534
                </Button>
              </a>
            </div>
          </RevealDiv>
        </div>
      </section>
    </div>
  );
}
