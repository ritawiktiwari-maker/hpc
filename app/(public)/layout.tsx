import "@/app/globals.css";
import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";

export const metadata = {
  title: "Hygienic Pest Control Pvt Ltd | Professional Pest Control in Ranchi",
  description:
    "Professional pest control services in Ranchi, Jharkhand. Termite treatment, mosquito control, rodent control and more. Call +91-7277234534.",
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
    </div>
  );
}
