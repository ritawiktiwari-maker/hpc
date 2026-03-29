import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  ChevronRight,
  Shield,
} from "lucide-react";

const services = [
  { name: "General Pest Control", href: "/services/general-pest-control" },
  { name: "Termite Treatment", href: "/services/termite-treatment" },
  { name: "Mosquito Control", href: "/services/mosquito-control" },
  { name: "Rodent Control", href: "/services/rodent-control" },
  { name: "Cockroach Control", href: "/services/cockroach-control" },
  { name: "Bed Bug Treatment", href: "/services/bed-bug-treatment" },
];

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Our Services", href: "/services" },
  { name: "Contact Us", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="bg-[#1a2332] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo-20hpc.png"
                alt="HPC Pest Lifecare"
                width={44}
                height={44}
                className="rounded-lg"
              />
              <div>
                <h3 className="text-lg font-bold">HPC Pest Lifecare</h3>
                <p className="text-xs text-green-400 font-medium tracking-wider uppercase">
                  Pvt Ltd
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Professional pest control services in Ranchi, Jharkhand.
              Protecting homes and businesses since 2019 with eco-friendly and
              effective solutions.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#42A5F5] transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#42A5F5] transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#42A5F5] transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Our Services */}
          <div>
            <h4 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#42A5F5]" />
              Our Services
            </h4>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.href}>
                  <Link
                    href={service.href}
                    className="flex items-center gap-2 text-gray-400 text-sm hover:text-[#42A5F5] transition-colors group"
                  >
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-gray-400 text-sm hover:text-[#42A5F5] transition-colors group"
                  >
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-base font-semibold mb-4">Contact Us</h4>
            <div className="space-y-4">
              <a
                href="tel:+917277234534"
                className="flex items-start gap-3 text-gray-400 text-sm hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 mt-0.5 text-[#7CB342] shrink-0" />
                <div>
                  <p>+91-7277234534</p>
                  <p>+91-9523591904</p>
                </div>
              </a>
              <a
                href="mailto:hpcplranchi@gmail.com"
                className="flex items-start gap-3 text-gray-400 text-sm hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 mt-0.5 text-[#7CB342] shrink-0" />
                <div>
                  <p>hpcplranchi@gmail.com</p>
                  <p>info@hpcpltd.in</p>
                </div>
              </a>
              <div className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-[#7CB342] shrink-0" />
                <p>Ranchi, Jharkhand, India</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-500">
            <p>
              &copy; {new Date().getFullYear()} HPC Pest Lifecare Pvt Ltd. All
              rights reserved.
            </p>
            <p>
              Serving Ranchi, Jharkhand with professional pest control since
              2019.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
