"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Target,
  Heart,
  Eye,
  Users,
  Award,
  Leaf,
  Clock,
  ArrowRight,
  Phone,
  CheckCircle,
  Building2,
  TrendingUp,
} from "lucide-react";

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

export default function AboutPage() {
  const stats = [
    {
      icon: <Users className="w-6 h-6" />,
      value: "700+",
      label: "Happy Customers",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      value: "15+",
      label: "Services Offered",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      value: "5+",
      label: "Years of Experience",
    },
    {
      icon: <Award className="w-6 h-6" />,
      value: "100%",
      label: "Satisfaction Rate",
    },
  ];

  const values = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Customer First",
      desc: "Every decision we make starts with our customers. Your safety, comfort, and satisfaction are our top priorities.",
    },
    {
      icon: <Leaf className="w-6 h-6" />,
      title: "Eco-Friendly Approach",
      desc: "We believe in protecting the environment while protecting your spaces. Our solutions are safe for families and pets.",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Excellence in Service",
      desc: "We are committed to delivering the highest quality of pest control services with professionalism and integrity.",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Continuous Improvement",
      desc: "We continuously invest in training, technology, and research to stay ahead in pest management solutions.",
    },
  ];

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2332] via-[#1e3a5f] to-[#1a2332]" />
        <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full bg-[#7CB342]/10 blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 rounded-full bg-[#42A5F5]/10 blur-[80px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-[#7CB342]/20 text-[#7CB342] border-[#7CB342]/30 mb-4 text-sm rounded-full">
            <Building2 className="w-3.5 h-3.5 mr-1.5" />
            About Us
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 animate-fade-in">
            About Hygienic Pest Control
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto animate-fade-in-up">
            Your trusted partner in professional pest control services in
            Ranchi, Jharkhand since 2019.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <RevealDiv>
              <div>
                <Badge className="bg-blue-50 text-[#42A5F5] border-blue-200 mb-4 text-sm rounded-full">
                  Our Story
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1a2332] mb-6">
                  From a Small Beginning to
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#42A5F5] to-[#7CB342]">
                    Ranchi&apos;s Trusted Name
                  </span>
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Hygienic Pest Control Pvt Ltd was founded in 2019 with a simple
                    yet powerful mission: to provide Ranchi and Jharkhand with
                    world-class pest control services that are effective,
                    affordable, and environmentally responsible.
                  </p>
                  <p>
                    What started as a small team of passionate professionals has
                    grown into one of the most trusted pest control companies in
                    the region. We have served over 700 residential and
                    commercial clients, handling everything from termite
                    infestations to comprehensive integrated pest management
                    programs.
                  </p>
                  <p>
                    Our team is equipped with modern tools, eco-friendly
                    products, and extensive training to tackle any pest challenge.
                    We take pride in our track record of 100% customer
                    satisfaction and our commitment to making homes and businesses
                    pest-free.
                  </p>
                </div>
              </div>
            </RevealDiv>

            <RevealDiv delay={200}>
              <div className="relative">
                <div className="bg-gradient-to-br from-[#42A5F5]/5 to-[#7CB342]/5 rounded-3xl p-8 border border-gray-100">
                  <div className="grid grid-cols-2 gap-6">
                    {stats.map((stat, i) => (
                      <div
                        key={stat.label}
                        className="text-center stagger-item"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#42A5F5]/10 to-[#7CB342]/10 flex items-center justify-center text-[#42A5F5] mx-auto mb-3">
                          {stat.icon}
                        </div>
                        <div className="text-2xl font-extrabold text-[#1a2332]">
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Decorative element */}
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-[#7CB342]/10 blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-[#42A5F5]/10 blur-xl" />
              </div>
            </RevealDiv>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <RevealDiv>
              <div className="bg-white rounded-2xl p-8 shadow-md h-full border border-gray-100">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#42A5F5] to-[#1E88E5] flex items-center justify-center text-white mb-5">
                  <Target className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-[#1a2332] mb-4">
                  Our Mission
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  To provide the most effective, safe, and affordable pest
                  control solutions in Ranchi and across Jharkhand. We are
                  committed to protecting the health and property of our
                  customers through innovative pest management practices while
                  being responsible stewards of the environment.
                </p>
              </div>
            </RevealDiv>

            <RevealDiv delay={150}>
              <div className="bg-white rounded-2xl p-8 shadow-md h-full border border-gray-100">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7CB342] to-[#558B2F] flex items-center justify-center text-white mb-5">
                  <Eye className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-[#1a2332] mb-4">
                  Our Vision
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  To be the leading pest control company in Jharkhand, recognized
                  for our excellence in service, innovation in pest management
                  solutions, and our unwavering commitment to customer
                  satisfaction and environmental sustainability. We envision a
                  pest-free community where homes and businesses thrive.
                </p>
              </div>
            </RevealDiv>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealDiv>
            <div className="text-center mb-14">
              <Badge className="bg-green-50 text-[#7CB342] border-green-200 mb-4 text-sm rounded-full">
                Our Values
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1a2332] mb-4">
                What Drives Us Every Day
              </h2>
            </div>
          </RevealDiv>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <RevealDiv key={v.title} delay={i * 100}>
                <div className="flex items-start gap-5 p-6 rounded-2xl border border-gray-100 hover:border-[#42A5F5]/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#42A5F5]/10 to-[#7CB342]/10 flex items-center justify-center text-[#42A5F5] shrink-0">
                    {v.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1a2332] mb-2">
                      {v.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Why Ranchi Trusts HPC */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealDiv>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1a2332] mb-4">
                Why Ranchi Trusts Hygienic Pest Control
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                We have earned the trust of hundreds of families and businesses
                in Ranchi through consistent quality and dedication.
              </p>
            </div>
          </RevealDiv>

          <RevealDiv>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {[
                "Licensed and government-registered pest control company",
                "Trained and certified technicians with years of expertise",
                "Use of WHO-approved, eco-friendly chemicals and products",
                "Transparent pricing with no hidden costs",
                "Comprehensive warranty on all treatments",
                "Quick response time and flexible scheduling",
                "Customized solutions for every property type",
                "Dedicated post-service support and follow-ups",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl stagger-item"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <CheckCircle className="w-5 h-5 text-[#7CB342] shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </RevealDiv>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2332] via-[#1e3a5f] to-[#1a2332]" />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#42A5F5]/10 blur-[100px]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <RevealDiv>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Ready to Make Your Space Pest-Free?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Get in touch with our team for a free consultation and inspection.
              We are just a call away.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-[#42A5F5] hover:bg-[#1E88E5] text-white rounded-full px-8 shadow-xl shadow-blue-500/30 btn-press"
                >
                  Book Free Inspection
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="tel:+917277234534">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 border-white/30 text-white hover:bg-white/10 hover:text-white"
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
