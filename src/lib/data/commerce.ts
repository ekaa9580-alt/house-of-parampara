import { isMockDataMode } from "./mode";
import {
  seedBanners,
  seedSettings,
  seedTestimonials,
  seedReviews,
  seedPages,
  seedPaymentMethods,
  getMockCart,
  mockAddToCart,
  mockUpdateCartItem,
  mockRemoveCartItem,
  mockApplyCoupon,
  mockRemoveCoupon,
  clearMockCart,
  seedCustomer,
  seedOrders,
} from "./seed";
import type {
  CheckoutPayload,
  LoginCredentials,
  RegisterData,
  WooAddress,
  HeroBanner,
  SiteSettings,
  Testimonial,
  WooCart,
} from "@/types/woocommerce";
import type { CartSession } from "@/lib/api/cart";

export type { CartSession };

function emptySession(): CartSession {
  return { nonce: null, token: null };
}

export async function fetchBanners(): Promise<HeroBanner[]> {
  if (isMockDataMode()) return seedBanners;
  const { getHeroBanners } = await import("@/lib/api/content");
  return getHeroBanners();
}

export async function fetchSettings(): Promise<SiteSettings> {
  if (isMockDataMode()) return seedSettings;
  const { getSiteSettings } = await import("@/lib/api/content");
  return getSiteSettings();
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  if (isMockDataMode()) return seedTestimonials;
  const { getTestimonials } = await import("@/lib/api/content");
  return getTestimonials();
}

export async function fetchReviews(productId: number) {
  if (isMockDataMode()) {
    const reviews = seedReviews.filter((r) => r.product_id === productId);
    return { reviews, total: reviews.length };
  }
  const { getProductReviews } = await import("@/lib/api/content");
  return getProductReviews(productId);
}

export async function createReview(data: {
  product_id: number;
  review: string;
  reviewer: string;
  reviewer_email: string;
  rating: number;
}) {
  if (isMockDataMode()) {
    return {
      id: Date.now(),
      date_created: new Date().toISOString(),
      status: "approved",
      verified: false,
      ...data,
    };
  }
  const { createReview: create } = await import("@/lib/api/content");
  return create(data);
}

export async function fetchPage(slug: string) {
  if (isMockDataMode()) return seedPages[slug] ?? null;
  const { getPageBySlug } = await import("@/lib/api/content");
  return getPageBySlug(slug);
}

export async function fetchMenu(location: string) {
  if (isMockDataMode()) {
    return { location, items: [] as import("@/types/woocommerce").CmsMenuItem[] };
  }
  const { getMenu } = await import("@/lib/api/content");
  return getMenu(location);
}

export async function fetchCart(
  session: CartSession = emptySession()
): Promise<{ cart: WooCart; session: CartSession }> {
  if (isMockDataMode()) {
    return { cart: getMockCart(), session };
  }
  const { getCart } = await import("@/lib/api/cart");
  return getCart(session);
}

export async function addItemToCart(
  productId: number,
  quantity = 1,
  variationId?: number,
  variation?: { attribute: string; value: string }[],
  session: CartSession = emptySession()
) {
  if (isMockDataMode()) {
    return { cart: mockAddToCart(productId, quantity), session };
  }
  const { addToCart } = await import("@/lib/api/cart");
  return addToCart(productId, quantity, variationId, variation, session);
}

export async function updateItemInCart(
  key: string,
  quantity: number,
  session: CartSession = emptySession()
) {
  if (isMockDataMode()) {
    return { cart: mockUpdateCartItem(key, quantity), session };
  }
  const { updateCartItem } = await import("@/lib/api/cart");
  return updateCartItem(key, quantity, session);
}

export async function removeItemFromCart(
  key: string,
  session: CartSession = emptySession()
) {
  if (isMockDataMode()) {
    return { cart: mockRemoveCartItem(key), session };
  }
  const { removeCartItem } = await import("@/lib/api/cart");
  return removeCartItem(key, session);
}

export async function applyCartCoupon(
  code: string,
  session: CartSession = emptySession()
) {
  if (isMockDataMode()) {
    return { cart: mockApplyCoupon(code), session };
  }
  const { applyCoupon } = await import("@/lib/api/cart");
  return applyCoupon(code, session);
}

export async function removeCartCoupon(
  code: string,
  session: CartSession = emptySession()
) {
  if (isMockDataMode()) {
    return { cart: mockRemoveCoupon(), session };
  }
  const { removeCoupon } = await import("@/lib/api/cart");
  return removeCoupon(code, session);
}

export async function fetchPaymentMethods() {
  if (isMockDataMode()) return seedPaymentMethods;
  const { getPaymentMethods } = await import("@/lib/api/cart");
  return getPaymentMethods();
}

export async function placeOrder(
  payload: CheckoutPayload,
  session: CartSession = emptySession()
) {
  if (isMockDataMode()) {
    const cart = getMockCart();
    const result = {
      order_id: 9000 + Math.floor(Math.random() * 1000),
      status: "processing",
      order_key: `wc_order_mock_${Date.now()}`,
      customer_id: 1,
      payment_result: {
        payment_status: "success",
        payment_details: [] as { key: string; value: string }[],
        redirect_url: "",
      },
      totals: { ...cart.totals },
    };
    clearMockCart();
    return { result, session };
  }
  const { checkout } = await import("@/lib/api/cart");
  return checkout(payload, session);
}

export async function loginUser(credentials: LoginCredentials) {
  if (isMockDataMode()) {
    if (credentials.password.length < 4) {
      throw Object.assign(new Error("Invalid credentials"), {
        response: {
          data: { code: "invalid", message: "Invalid username or password" },
          status: 401,
        },
      });
    }
    return {
      token: "mock-jwt-token",
      user_email: seedCustomer.email,
      user_nicename: seedCustomer.username,
      user_display_name: `${seedCustomer.first_name} ${seedCustomer.last_name}`,
      customerId: seedCustomer.id,
      customer: seedCustomer,
    };
  }
  const { login, getCustomerByEmail } = await import("@/lib/api/auth");
  const tokens = await login(credentials);
  let customerId =
    (tokens as { customerId?: number }).customerId ?? null;
  let customer = null;
  if (!customerId && tokens.user_email) {
    customer = await getCustomerByEmail(tokens.user_email);
    customerId = customer?.id ?? null;
  } else if (customerId) {
    try {
      const { getCustomer } = await import("@/lib/api/auth");
      customer = await getCustomer(customerId);
    } catch {
      customer = await getCustomerByEmail(tokens.user_email);
    }
  }
  return { ...tokens, customerId, customer };
}

export async function registerUser(data: RegisterData) {
  if (isMockDataMode()) {
    return {
      ...seedCustomer,
      id: Date.now(),
      email: data.email,
      username: data.username || data.email,
      first_name: data.first_name || "",
      last_name: data.last_name || "",
    };
  }
  const { register } = await import("@/lib/api/auth");
  return register(data);
}

export async function fetchCustomer(id: number) {
  if (isMockDataMode()) return { ...seedCustomer, id };
  const { getCustomer } = await import("@/lib/api/auth");
  return getCustomer(id);
}

export async function updateCustomerProfile(
  id: number,
  data: Record<string, unknown>
) {
  if (isMockDataMode()) return { ...seedCustomer, ...data, id };
  const { updateCustomer } = await import("@/lib/api/auth");
  return updateCustomer(id, data);
}

export async function fetchOrders(customerId: number, page = 1) {
  if (isMockDataMode()) {
    return {
      orders: seedOrders.filter((o) => o.customer_id === customerId),
      total: seedOrders.length,
      totalPages: 1,
    };
  }
  const { getCustomerOrders } = await import("@/lib/api/auth");
  return getCustomerOrders(customerId, page);
}

export async function subscribeEmail(email: string) {
  if (isMockDataMode()) {
    return {
      success: true,
      message: "Thank you for subscribing.",
    };
  }
  const { subscribeNewsletter } = await import("@/lib/api/content");
  return subscribeNewsletter(email);
}

export async function requestReset(email: string) {
  if (isMockDataMode()) {
    return {
      success: true,
      message: "If an account exists, a reset link has been sent.",
    };
  }
  const { requestPasswordReset } = await import("@/lib/api/auth");
  await requestPasswordReset(email);
  return {
    success: true,
    message: "If an account exists, a reset link has been sent.",
  };
}

export type { WooAddress };
