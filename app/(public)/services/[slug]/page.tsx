"use client";

import { useState, useEffect, useRef, use } from "react";
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
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Phone,
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

const iconMap: Record<string, React.ReactNode> = {
  Bug: <Bug className="w-8 h-8" />,
  Shield: <Shield className="w-8 h-8" />,
  Target: <Target className="w-8 h-8" />,
  Leaf: <Leaf className="w-8 h-8" />,
  Sparkles: <Sparkles className="w-8 h-8" />,
  Users: <Users className="w-8 h-8" />,
};

const smallIconMap: Record<string, React.ReactNode> = {
  Bug: <Bug className="w-5 h-5" />,
  Shield: <Shield className="w-5 h-5" />,
  Target: <Target className="w-5 h-5" />,
  Leaf: <Leaf className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
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
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
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

  if (loading) {
    return (
      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="h-10 w-64 skeleton-loading mb-4" />
          <div className="h-6 w-full skeleton-loading mb-2" />
          <div className="h-6 w-3/4 skeleton-loading mb-8" />
          <div className="h-48 skeleton-loading rounded-2xl" />
        </div>
      </div>
    );
  }

  if (notFound || !service) {
    return (
      <div className="pt-32 pb-20 text-center">
        <div className="max-w-md mx-auto px-4">
          <Bug className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1a2332] mb-2">
            Service Not Found
          </h1>
          <p className="text-gray-500 mb-6">
            The service you are looking for does not exist or has been removed.
          </p>
          <Link href="/services">
            <Button className="bg-[#42A5F5] hover:bg-[#1E88E5] text-white rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              View All Services
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-24 pb-10 sm:pt-32 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2332] via-[#1e3a5f] to-[#1a2332]" />
        <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-[#42A5F5]/10 blur-[100px]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-[#42A5F5] shrink-0">
              {iconMap[service.icon || "Bug"] || <Bug className="w-8 h-8" />}
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 animate-fade-in">
                {service.name}
              </h1>
              <p className="text-gray-300 text-lg animate-fade-in-up">
                {service.shortDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Service image from admin */}
              {service.image && (
                <RevealDiv className="mb-8">
                  <div className="rounded-2xl overflow-hidden shadow-md">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-48 sm:h-64 lg:h-72 object-cover"
                    />
                  </div>
                </RevealDiv>
              )}
              <RevealDiv>
                <div className="prose prose-gray max-w-none">
                  <h2 className="text-2xl font-bold text-[#1a2332] mb-4">
                    About This Service
                  </h2>
                  <div
                    className="text-gray-600 leading-relaxed whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: service.description }}
                  />
                </div>
              </RevealDiv>

              {service.features.length > 0 && (
                <RevealDiv className="mt-10">
                  <h3 className="text-xl font-bold text-[#1a2332] mb-5">
                    What&apos;s Included
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.features.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 stagger-item"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <CheckCircle className="w-5 h-5 text-[#7CB342] shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{f}</span>
                      </div>
                    ))}
                  </div>
                </RevealDiv>
              )}
            </div>

            {/* Sidebar CTA */}
            <div>
              <RevealDiv>
                <Card className="p-6 rounded-2xl border-0 shadow-lg bg-gradient-to-br from-[#42A5F5] to-[#1E88E5] text-white sticky top-28">
                  <h3 className="text-xl font-bold mb-3">
                    Book This Service
                  </h3>
                  <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                    Get a free inspection and customized quote for{" "}
                    {service.name.toLowerCase()}. Our experts are ready to help.
                  </p>
                  <Link href={`/contact?service=${service.slug}`}>
                    <Button className="w-full bg-white text-[#42A5F5] hover:bg-blue-50 rounded-xl h-12 font-semibold btn-press mb-3">
                      Get Free Quote
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <a href="tel:+917277234534" className="block">
                    <Button
                      className="w-full rounded-xl h-12 bg-white/15 text-white border border-white/30 hover:bg-white/25 font-semibold btn-press"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                  </a>
                </Card>
              </RevealDiv>
            </div>
          </div>
        </div>
      </section>

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <section className="py-10 sm:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RevealDiv>
              <h2 className="text-2xl font-bold text-[#1a2332] mb-8 text-center">
                Other Services You May Need
              </h2>
            </RevealDiv>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedServices.map((rs, i) => (
                <RevealDiv key={rs.id}>
                  <Card
                    className="p-5 border-0 shadow-md hover-lift rounded-2xl bg-white stagger-item"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#42A5F5]/10 flex items-center justify-center text-[#42A5F5]">
                        {smallIconMap[rs.icon || "Bug"] || (
                          <Bug className="w-5 h-5" />
                        )}
                      </div>
                      <h3 className="font-bold text-[#1a2332]">{rs.name}</h3>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">{rs.shortDesc}</p>
                    <Link href={`/services/${rs.slug}`}>
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border-[#42A5F5] text-[#42A5F5] hover:bg-[#42A5F5] hover:text-white text-sm"
                      >
                        Learn More
                      </Button>
                    </Link>
                  </Card>
                </RevealDiv>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
