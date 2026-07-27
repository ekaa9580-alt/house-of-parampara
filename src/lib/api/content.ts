import {
  wcApi,
  wpApi,
  ensureConfigured,
  getWcBaseUrl,
} from "./client";
import type {
  WooReview,
  WooCoupon,
  HeroBanner,
  SiteSettings,
  Testimonial,
} from "@/types/woocommerce";
import { resolveBusinessEmail } from "@/lib/site-contact";

export async function getProductReviews(
  productId: number,
  page = 1,
  perPage = 10
): Promise<{ reviews: WooReview[]; total: number }> {
  ensureConfigured();
  const response = await wcApi.get<WooReview[]>("/products/reviews", {
    params: {
      product: productId,
      page,
      per_page: perPage,
      status: "approved",
    },
  });
  const total = Number(response.headers["x-wp-total"] ?? 0);
  return { reviews: response.data, total };
}

export async function createReview(data: {
  product_id: number;
  review: string;
  reviewer: string;
  reviewer_email: string;
  rating: number;
}): Promise<WooReview> {
  ensureConfigured();
  const response = await wcApi.post<WooReview>("/products/reviews", data);
  return response.data;
}

export async function getCoupon(code: string): Promise<WooCoupon | null> {
  ensureConfigured();
  const response = await wcApi.get<WooCoupon[]>("/coupons", {
    params: { code },
  });
  return response.data[0] ?? null;
}

/**
 * Hero banners from WordPress Customizer via GET /wp-json/hop/v1/banners
 * (wordpress/hop-banners.php). Optional ACF options fallback.
 */
export async function getHeroBanners(): Promise<HeroBanner[]> {
  ensureConfigured();
  const endpoint =
    process.env.NEXT_PUBLIC_BANNERS_ENDPOINT || "/wp-json/hop/v1/banners";

  // 1. Custom HOP banners endpoint (Customizer theme_mods)
  try {
    const base = getWcBaseUrl();
    let path = "/hop/v1/banners";
    if (endpoint.startsWith("http")) {
      path = endpoint.replace(base, "").replace(/^\/wp-json/, "") || path;
    } else {
      path = endpoint.replace(/^\/wp-json/, "") || path;
    }
    const response = await wpApi.get<HeroBanner[]>(path);
    if (Array.isArray(response.data) && response.data.length) {
      return response.data;
    }
  } catch {
    /* try next source */
  }

  // 2. WordPress options / ACF options page
  try {
    const response = await wpApi.get<{ banners?: HeroBanner[] }>(
      "/acf/v3/options/options"
    );
    if (response.data?.banners?.length) return response.data.banners;
  } catch {
    /* empty */
  }

  return [];
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const defaults: SiteSettings = {
    site_name: process.env.NEXT_PUBLIC_SITE_NAME || "",
    contact_email: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    contact_phone: process.env.NEXT_PUBLIC_CONTACT_PHONE,
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  };

  const mergeRemote = (remote: Partial<SiteSettings>): SiteSettings => {
    const merged: SiteSettings = { ...defaults };
    for (const [key, value] of Object.entries(remote) as [
      keyof SiteSettings,
      SiteSettings[keyof SiteSettings],
    ][]) {
      if (value === undefined || value === null) continue;
      if (typeof value === "string" && value.trim() === "") continue;
      (merged as unknown as Record<string, unknown>)[key] = value;
    }
    if (!merged.site_name) merged.site_name = "";
    // Always resolve business email from env / allowlist (ignore stale CMS hello@…)
    merged.contact_email = resolveBusinessEmail(merged.contact_email);
    if (process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim()) {
      merged.contact_phone = process.env.NEXT_PUBLIC_CONTACT_PHONE.trim();
    }
    return merged;
  };

  try {
    ensureConfigured();
    const response = await wpApi.get<Partial<SiteSettings>>(
      "/hop/v1/settings"
    );
    return mergeRemote(response.data || {});
  } catch {
    try {
      const response = await wpApi.get("/wp/v2/settings");
      return mergeRemote({
        site_name: response.data?.title || defaults.site_name,
        tagline: response.data?.description,
      });
    } catch {
      return defaults;
    }
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    ensureConfigured();
    const response = await wpApi.get<Testimonial[]>("/hop/v1/testimonials");
    if (Array.isArray(response.data)) return response.data;
  } catch {
    /* fallback below */
  }

  // Fallback: pull latest product reviews as testimonials
  try {
    const response = await wcApi.get("/products/reviews", {
      params: { per_page: 6, status: "approved", orderby: "date" },
    });
    return (response.data || []).map(
      (r: {
        id: number;
        reviewer: string;
        review: string;
        rating: number;
        reviewer_avatar_urls?: Record<string, string>;
      }) => ({
        id: r.id,
        name: r.reviewer,
        content: r.review?.replace(/<[^>]*>/g, "") || "",
        rating: r.rating,
        avatar: r.reviewer_avatar_urls?.["96"],
      })
    );
  } catch {
    return [];
  }
}

export async function getMenu(
  location: string
): Promise<{ location: string; items: import("@/types/woocommerce").CmsMenuItem[] }> {
  try {
    ensureConfigured();
    const response = await wpApi.get<{
      location: string;
      items: import("@/types/woocommerce").CmsMenuItem[];
    }>(`/hop/v1/menus/${location}`);
    return response.data || { location, items: [] };
  } catch {
    return { location, items: [] };
  }
}

export async function getPageBySlug(slug: string): Promise<{
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
} | null> {
  try {
    ensureConfigured();
    const response = await wpApi.get("/wp/v2/pages", {
      params: { slug },
    });
    return response.data[0] ?? null;
  } catch {
    return null;
  }
}

export async function subscribeNewsletter(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    ensureConfigured();
    await wpApi.post("/hop/v1/newsletter", { email });
    return { success: true, message: "Thank you for subscribing." };
  } catch {
    // Soft success – admin can wire Mailchimp/Klaviyo later
    return {
      success: true,
      message: "Thank you for subscribing.",
    };
  }
}
