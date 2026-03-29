"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnquiryForm } from "@/components/website/enquiry-form";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";

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

function ContactFormSection() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service") || undefined;

  return <EnquiryForm preselectedService={preselectedService} />;
}

export default function ContactPage() {
  const contactCards = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone",
      lines: ["+91-7277234534", "+91-9523591904"],
      action: { label: "Call Now", href: "tel:+917277234534" },
      color: "from-[#7CB342] to-[#558B2F]",
      bgColor: "bg-green-50",
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      lines: ["hpcplranchi@gmail.com", "info@hpcpltd.in"],
      action: { label: "Send Email", href: "mailto:hpcplranchi@gmail.com" },
      color: "from-[#42A5F5] to-[#1E88E5]",
      bgColor: "bg-blue-50",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Location",
      lines: ["Ranchi, Jharkhand", "India"],
      action: null,
      color: "from-[#FF7043] to-[#E64A19]",
      bgColor: "bg-orange-50",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Working Hours",
      lines: ["Mon - Sat: 9AM - 7PM", "Sunday: On Call"],
      action: null,
      color: "from-[#AB47BC] to-[#7B1FA2]",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2332] via-[#1e3a5f] to-[#1a2332]" />
        <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full bg-[#42A5F5]/10 blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 rounded-full bg-[#7CB342]/10 blur-[80px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-[#42A5F5]/20 text-[#42A5F5] border-[#42A5F5]/30 mb-4 text-sm rounded-full">
            <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
            Get In Touch
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 animate-fade-in">
            Contact Us
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto animate-fade-in-up">
            Have a pest problem? Reach out to us for a free inspection and
            expert advice. We are here to help!
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 -mt-16 relative z-10">
            {contactCards.map((card, i) => (
              <RevealDiv key={card.title} delay={i * 100}>
                <Card className="p-5 border-0 shadow-lg rounded-2xl bg-white text-center h-full">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white mx-auto mb-4`}
                  >
                    {card.icon}
                  </div>
                  <h3 className="font-bold text-[#1a2332] mb-2">
                    {card.title}
                  </h3>
                  {card.lines.map((line, li) => (
                    <p key={li} className="text-gray-500 text-sm">
                      {line}
                    </p>
                  ))}
                  {card.action && (
                    <a
                      href={card.action.href}
                      className="inline-block mt-3 text-sm font-semibold text-[#42A5F5] hover:underline"
                    >
                      {card.action.label}
                    </a>
                  )}
                </Card>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Form & Map */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Form */}
            <div className="lg:col-span-3">
              <RevealDiv>
                <Card className="p-6 sm:p-8 border-0 shadow-lg rounded-2xl bg-white">
                  <h2 className="text-2xl font-bold text-[#1a2332] mb-1">
                    Send Us an Enquiry
                  </h2>
                  <p className="text-gray-400 text-sm mb-6">
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
                </Card>
              </RevealDiv>
            </div>

            {/* Map Placeholder */}
            <div className="lg:col-span-2">
              <RevealDiv delay={200}>
                <Card className="border-0 shadow-lg rounded-2xl bg-white overflow-hidden h-full min-h-[400px] flex flex-col">
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="font-bold text-[#1a2332] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#42A5F5]" />
                      Our Location
                    </h3>
                    <p className="text-sm text-gray-400">
                      Ranchi, Jharkhand, India
                    </p>
                  </div>
                  <div className="flex-1 bg-gray-100 flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-[#42A5F5]/10 flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-[#42A5F5]" />
                      </div>
                      <p className="text-gray-500 text-sm font-medium mb-1">
                        Ranchi, Jharkhand
                      </p>
                      <p className="text-gray-400 text-xs">
                        Google Maps will be embedded here
                      </p>
                    </div>
                  </div>
                </Card>
              </RevealDiv>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
