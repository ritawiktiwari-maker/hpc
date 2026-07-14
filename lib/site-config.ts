/**
 * Central config for the public marketing website.
 * Keep all company facts / contact details here so every page stays in sync.
 */

export const siteConfig = {
  name: "Hygienic Pest Control",
  legalName: "Hygienic Pest Control Pvt Ltd",
  tagline: "Professional Pest Control",
  region: "Jharkhand",
  city: "Ranchi",
  since: 2019,

  phones: ["+91-7277234534", "+91-9523591904"],
  // tel: href-safe (no spaces/dashes)
  telPrimary: "+917277234534",
  telSecondary: "+919523591904",

  emails: ["hpcplranchi@gmail.com", "info@hpcpltd.in"],
  emailPrimary: "hpcplranchi@gmail.com",

  address: "Ranchi, Jharkhand, India",
  hours: [
    { days: "Mon – Sat", time: "9:00 AM – 7:00 PM" },
    { days: "Sunday", time: "On Call" },
  ],

  social: {
    facebook: "#",
    instagram: "#",
    twitter: "#",
  },
} as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

/** Fallback service list for the footer (real services come from the API). */
export const footerServices = [
  { name: "General Pest Control", href: "/services/general-pest-control" },
  { name: "Termite Treatment", href: "/services/termite-treatment" },
  { name: "Mosquito Control", href: "/services/mosquito-control" },
  { name: "Rodent Control", href: "/services/rodent-control" },
  { name: "Cockroach Control", href: "/services/cockroach-control" },
  { name: "Bed Bug Treatment", href: "/services/bed-bug-treatment" },
] as const;

/** Homepage / about headline stats. */
export const companyStats = [
  { value: 700, suffix: "+", label: "Happy Customers" },
  { value: 15, suffix: "+", label: "Services" },
  { value: 5, suffix: "+", label: "Years Experience" },
  { value: 100, suffix: "%", label: "Satisfaction" },
] as const;
