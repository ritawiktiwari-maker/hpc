import "@/app/globals.css";
import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { BugBlastEffect } from "@/components/website/bug-blast";

export const metadata = {
  title: {
    default: "Hygienic Pest Control Pvt Ltd | Professional Pest Control in Jharkhand",
    template: "%s | Hygienic Pest Control Pvt Ltd",
  },
  description:
    "Professional pest control services in Jharkhand by Hygienic Pest Control Pvt Ltd. Termite treatment, mosquito control, rodent control and more. Call +91-7277234534.",
  openGraph: {
    siteName: "Hygienic Pest Control Pvt Ltd",
    type: "website",
    locale: "en_IN",
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ scrollBehavior: "smooth" }}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <BugBlastEffect />
    </div>
  );
}
