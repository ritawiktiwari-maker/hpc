/**
 * Curated, verified Unsplash fallback imagery for the public website.
 *
 * Admin-managed images (from the "Website Images" / "Services" panels) always
 * take priority; these are used when no admin image has been set for a slot so
 * the site looks complete out of the box.
 *
 * Every URL here was verified to return HTTP 200 (image/jpeg).
 */

export interface FallbackImages {
  hero: string;
  about: string;
  cta: string;
  gallery: string[];
  services: Record<string, string>;
}

export const fallbackImages: FallbackImages = {
  hero: "https://images.unsplash.com/photo-1581578017093-cd30fce4eeb7?auto=format&fit=crop&w=1600&q=70",
  about: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=1600&q=70",
  cta: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1600&q=70",
  gallery: [
    "https://images.unsplash.com/photo-1747659629851-a92bd71149f6?auto=format&fit=crop&w=1200&q=70",
    "https://images.unsplash.com/photo-1593999094742-4f5280054b23?auto=format&fit=crop&w=1200&q=70",
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=70",
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=70",
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=70",
    "https://images.unsplash.com/photo-1581578405048-b6f813432ca4?auto=format&fit=crop&w=1200&q=70",
  ],
  services: {
    "general-pest-control":
      "https://images.unsplash.com/photo-1581578017093-cd30fce4eeb7?auto=format&fit=crop&w=1200&q=70",
    "termite-treatment":
      "https://images.unsplash.com/photo-1612960891902-b525d250aa89?auto=format&fit=crop&w=1200&q=70",
    "mosquito-control":
      "https://images.unsplash.com/photo-1635496471665-4e67e0e87399?auto=format&fit=crop&w=1200&q=70",
    "rodent-control":
      "https://images.unsplash.com/photo-1718345641213-80cfe1424084?auto=format&fit=crop&w=1200&q=70",
    "cockroach-control":
      "https://images.unsplash.com/photo-1567479403609-5711aa5e0ef6?auto=format&fit=crop&w=1200&q=70",
    "bed-bug-treatment":
      "https://images.unsplash.com/photo-1560185128-e173042f79dd?auto=format&fit=crop&w=1200&q=70",
    "ant-control":
      "https://images.unsplash.com/photo-1588470045344-4393b295297c?auto=format&fit=crop&w=1200&q=70",
    "fly-control":
      "https://images.unsplash.com/photo-1596296455028-bb216ae02ff7?auto=format&fit=crop&w=1200&q=70",
    "commercial-pest-control":
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=70",
    fallback:
      "https://images.unsplash.com/photo-1581578405048-b6f813432ca4?auto=format&fit=crop&w=1200&q=70",
  },
};

/** Resolve a service image by slug, falling back to a generic pest-control shot. */
export function serviceFallbackImage(slug?: string): string {
  if (slug && fallbackImages.services[slug]) return fallbackImages.services[slug];
  return fallbackImages.services.fallback;
}
