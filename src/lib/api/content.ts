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
 * Hero banners – tries custom HOP endpoint, then ACF options, then
 * products tagged "hero-banner" as last resort.
 * Configure banners in WordPress Admin without touching frontend code.
 */
export async function getHeroBanners(): Promise<HeroBanner[]> {
  ensureConfigured();
  const endpoint =
    process.env.NEXT_PUBLIC_BANNERS_ENDPOINT || "/wp-json/hop/v1/banners";

  // 1. Custom HOP banners endpoint
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
    /* try next source */
  }

  // 3. Fallback: products tagged "hero-banner" (images from WC)
  try {
    const tagsRes = await wcApi.get<{ id: number }[]>("/products/tags", {
      params: { slug: "hero-banner" },
    });
    const tagId = Array.isArray(tagsRes.data) ? tagsRes.data[0]?.id : undefined;
    if (!tagId) return [];

    const response = await wcApi.get("/products", {
      params: {
        tag: tagId,
        per_page: 5,
        status: "publish",
      },
    });
    if (Array.isArray(response.data) && response.data.length) {
      return response.data.map(
        (p: {
          id: number;
          name: string;
          short_description: string;
          permalink: string;
          images: { src: string }[];
        }) => ({
          id: p.id,
          title: p.name,
          subtitle: "",
          description: p.short_description?.replace(/<[^>]*>/g, "") || "",
          image: p.images?.[0]?.src || "",
          cta_text: "Shop Now",
          cta_url: `/product/${(p as { slug?: string }).slug || p.id}`,
          text_position: "left" as const,
        })
      );
    }
  } catch {
    /* empty */
  }

  return [];
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const defaults: SiteSettings = {
    site_name:
      process.env.NEXT_PUBLIC_SITE_NAME || "House of Parampara",
    contact_email: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    contact_phone: process.env.NEXT_PUBLIC_CONTACT_PHONE,
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  };

  try {
    ensureConfigured();
    const response = await wpApi.get<Partial<SiteSettings>>(
      "/hop/v1/settings"
    );
    return { ...defaults, ...response.data };
  } catch {
    try {
      const response = await wpApi.get("/wp/v2/settings");
      return {
        ...defaults,
        site_name: response.data?.title || defaults.site_name,
        tagline: response.data?.description,
      };
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
      message: "Thank you for subscribing to House of Parampara.",
    };
  }
}
