"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bug,
  Shield,
  Target,
  Leaf,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ============================================================
   Reveal — subtle scroll-in animation (replaces the duplicated
   IntersectionObserver hooks that lived in every page).
   ============================================================ */
type RevealDirection = "up" | "down" | "left" | "right" | "scale";

const directionClasses: Record<
  RevealDirection,
  { hidden: string; visible: string }
> = {
  up: { hidden: "opacity-0 translate-y-8", visible: "opacity-100 translate-y-0" },
  down: { hidden: "opacity-0 -translate-y-8", visible: "opacity-100 translate-y-0" },
  left: { hidden: "opacity-0 -translate-x-10", visible: "opacity-100 translate-x-0" },
  right: { hidden: "opacity-0 translate-x-10", visible: "opacity-100 translate-x-0" },
  scale: { hidden: "opacity-0 scale-95", visible: "opacity-100 scale-100" },
};

export function Reveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  direction?: RevealDirection;
  delay?: number;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cls = directionClasses[direction];
  return (
    <Tag
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out will-change-[transform,opacity]",
        visible ? cls.visible : cls.hidden,
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/* ============================================================
   Eyebrow — small pill label above headings
   ============================================================ */
type Tone = "blue" | "green" | "amber" | "neutral";

const toneClasses: Record<Tone, string> = {
  blue: "bg-brand/10 text-brand ring-1 ring-brand/15",
  green: "bg-green-bright/10 text-green-dark ring-1 ring-green-bright/20",
  amber: "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20",
  neutral: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

export function Eyebrow({
  children,
  icon: Icon,
  tone = "blue",
  className = "",
}: {
  children: React.ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-semibold tracking-wide",
        toneClasses[tone],
        className
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </span>
  );
}

/* ============================================================
   SectionHeading — eyebrow + title + subtitle, consistent everywhere
   ============================================================ */
export function SectionHeading({
  eyebrow,
  eyebrowIcon,
  eyebrowTone = "blue",
  title,
  subtitle,
  align = "center",
  className = "",
}: {
  eyebrow?: React.ReactNode;
  eyebrowIcon?: LucideIcon;
  eyebrowTone?: Tone;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      {eyebrow ? (
        <Reveal direction={align === "center" ? "down" : "up"}>
          <Eyebrow icon={eyebrowIcon} tone={eyebrowTone} className="mb-4">
            {eyebrow}
          </Eyebrow>
        </Reveal>
      ) : null}
      <Reveal direction="up" delay={60}>
        <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight text-ink leading-[1.1] text-balance">
          {title}
        </h2>
      </Reveal>
      {subtitle ? (
        <Reveal direction="up" delay={120}>
          <p className="mt-4 text-base sm:text-lg text-slate-500 leading-relaxed text-pretty">
            {subtitle}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}

/* ============================================================
   Service icons — shared map used by all service surfaces
   ============================================================ */
export const serviceIcons: Record<string, LucideIcon> = {
  Bug,
  Shield,
  Target,
  Leaf,
  Sparkles,
  Users,
};

export function ServiceIcon({
  name,
  className = "h-6 w-6",
}: {
  name?: string;
  className?: string;
}) {
  const Icon = serviceIcons[name || "Bug"] || Bug;
  return <Icon className={className} />;
}

/* ============================================================
   AnimatedCounter — counts up when scrolled into view
   ============================================================ */
export function AnimatedCounter({
  end,
  suffix = "",
  className = "",
  duration = 1400,
}: {
  end: number;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
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
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className={className}>
      {count}
      {suffix}
    </span>
  );
}
