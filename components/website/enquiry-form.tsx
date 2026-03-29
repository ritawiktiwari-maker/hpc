"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, CheckCircle, Loader2 } from "lucide-react";

interface Service {
  id: string;
  slug: string;
  name: string;
}

interface EnquiryFormProps {
  preselectedService?: string;
  compact?: boolean;
}

export function EnquiryForm({
  preselectedService,
  compact = false,
}: EnquiryFormProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    serviceInterest: preselectedService || "",
    message: "",
  });

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setServices(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (preselectedService) {
      setForm((prev) => ({ ...prev, serviceInterest: preselectedService }));
    }
  }, [preselectedService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.mobile) {
      setError("Name and mobile number are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setSuccess(true);
      setForm({
        name: "",
        mobile: "",
        email: "",
        address: "",
        serviceInterest: "",
        message: "",
      });
      setTimeout(() => setSuccess(false), 5000);
    } catch {
      setError("Something went wrong. Please try again or call us directly.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-[#1a2332] mb-2">
          Thank You for Your Enquiry!
        </h3>
        <p className="text-gray-500 max-w-sm">
          We have received your request. Our team will contact you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        className={`grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Your full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="h-11 rounded-xl border-gray-200 focus:border-[#42A5F5] focus:ring-[#42A5F5]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Mobile <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Your mobile number"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            className="h-11 rounded-xl border-gray-200 focus:border-[#42A5F5] focus:ring-[#42A5F5]"
            required
          />
        </div>
        {!compact && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <Input
                type="email"
                placeholder="Your email (optional)"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-11 rounded-xl border-gray-200 focus:border-[#42A5F5] focus:ring-[#42A5F5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Address
              </label>
              <Input
                placeholder="Your address (optional)"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="h-11 rounded-xl border-gray-200 focus:border-[#42A5F5] focus:ring-[#42A5F5]"
              />
            </div>
          </>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Service Interest
        </label>
        <Select
          value={form.serviceInterest}
          onValueChange={(val) => setForm({ ...form, serviceInterest: val })}
        >
          <SelectTrigger className="h-11 rounded-xl border-gray-200">
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            {services.map((s) => (
              <SelectItem key={s.id} value={s.slug}>
                {s.name}
              </SelectItem>
            ))}
            {services.length === 0 && (
              <SelectItem value="general">General Enquiry</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {!compact && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Message
          </label>
          <Textarea
            placeholder="Describe your pest problem..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="rounded-xl border-gray-200 focus:border-[#42A5F5] focus:ring-[#42A5F5] min-h-[100px]"
          />
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-[#42A5F5] hover:bg-[#1E88E5] text-white rounded-xl text-base font-semibold shadow-lg shadow-blue-500/25 btn-press"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Submit Enquiry
          </>
        )}
      </Button>
    </form>
  );
}
