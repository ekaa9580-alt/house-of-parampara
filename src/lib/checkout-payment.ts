/**
 * Post-checkout payment routing for WooCommerce + Razorpay.
 *
 * WooCommerce Store API creates the order first, then returns payment_result.
 * Razorpay's process_payment redirects to the WC order-pay URL where Checkout.js runs.
 * Creating an order is NOT the same as a successful payment.
 */

import {
  getCanonicalStorefrontOrigin,
  getCanonicalWcOrigin,
  rewriteToCanonicalPaymentUrl,
  resolveClientStorefrontOrigin,
} from "@/lib/canonical-urls";

export type CheckoutApiResult = {
  order_id: number;
  status?: string;
  order_key?: string;
  payment_result?: {
    payment_status?: string;
    payment_details?: { key: string; value: string }[];
    redirect_url?: string;
  };
};

export type PostCheckoutAction =
  | { type: "redirect"; url: string }
  | { type: "success" }
  | { type: "pending"; url?: string };

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

/** @deprecated use getCanonicalWcOrigin — kept for imports */
export function getWcPublicBaseUrl(): string {
  return getCanonicalWcOrigin();
}

export function absoluteWcUrl(url: string, wcBase = getCanonicalWcOrigin()): string {
  if (!url) return "";
  const trimmed = url.trim();
  const rewritten = rewriteToCanonicalPaymentUrl(trimmed, wcBase);
  if (/^https?:\/\//i.test(rewritten)) return rewritten;
  if (rewritten.startsWith("//")) return `https:${rewritten}`;
  if (!wcBase) return rewritten;
  const base = stripTrailingSlash(wcBase);
  const path = rewritten.startsWith("/") ? rewritten : `/${rewritten}`;
  return `${base}${path}`;
}

/** @deprecated use getCanonicalStorefrontOrigin */
export function getStorefrontBaseUrl(): string {
  return getCanonicalStorefrontOrigin();
}

/** After Razorpay+WooCommerce verify payment, customer must land here. */
export function buildStorefrontSuccessUrl(
  orderId: number,
  orderKey: string,
  paid = false,
  siteBase = getCanonicalStorefrontOrigin()
): string {
  const base = stripTrailingSlash(siteBase);
  if (!base || !orderId || !orderKey) return "";
  const params = new URLSearchParams({
    id: String(orderId),
    key: orderKey,
  });
  if (paid) params.set("paid", "1");
  return `${base}/checkout/success?${params.toString()}`;
}

/** WooCommerce “Pay for order” URL where Razorpay Checkout opens. */
export function buildOrderPayUrl(
  orderId: number,
  orderKey: string,
  wcBase = getCanonicalWcOrigin(),
  siteBase = getCanonicalStorefrontOrigin()
): string {
  const base = stripTrailingSlash(wcBase);
  if (!base || !orderId || !orderKey) return "";
  const params = new URLSearchParams({
    pay_for_order: "true",
    key: orderKey,
  });
  const hopReturn = buildStorefrontSuccessUrl(orderId, orderKey, false, siteBase);
  if (hopReturn) params.set("hop_return", hopReturn);
  const url = `${base}/checkout/order-pay/${orderId}/?${params.toString()}`;
  return rewriteToCanonicalPaymentUrl(url, wcBase);
}

function isThankYouUrl(url: string): boolean {
  return /order-received/i.test(url);
}

function isOnlineGateway(paymentMethod: string): boolean {
  const id = (paymentMethod || "").toLowerCase();
  if (!id) return false;
  if (id === "cod" || id === "cheque" || id === "bacs") return false;
  return true;
}

/**
 * Decide what happens after Store API /checkout succeeds.
 * Online gateways (Razorpay) must never land on the frontend success page
 * until WooCommerce reports the order as paid.
 */
export function resolvePostCheckoutAction(
  data: CheckoutApiResult,
  paymentMethod: string,
  wcBase = getCanonicalWcOrigin(),
  siteBase?: string
): PostCheckoutAction {
  const storefrontBase =
    siteBase && !siteBase.includes("hostingersite.com")
      ? stripTrailingSlash(siteBase)
      : getCanonicalStorefrontOrigin();

  const orderStatus = (data.status || "").toLowerCase();
  const paymentStatus = (
    data.payment_result?.payment_status || ""
  ).toLowerCase();
  const rawRedirect = data.payment_result?.redirect_url || "";
  const redirect = rewriteToCanonicalPaymentUrl(
    absoluteWcUrl(rawRedirect, wcBase),
    wcBase
  );
  const isRazorpay = /razorpay/i.test(paymentMethod);
  const online = isOnlineGateway(paymentMethod) || isRazorpay;
  const orderPaid = ["processing", "completed"].includes(orderStatus);

  if (orderPaid) {
    return { type: "success" };
  }

  if (!online && (paymentStatus === "success" || orderStatus === "on-hold")) {
    return { type: "success" };
  }

  const payUrl =
    data.order_id && data.order_key
      ? buildOrderPayUrl(data.order_id, data.order_key, wcBase, storefrontBase)
      : "";

  // Always prefer our canonical order-pay URL for online gateways.
  if (online && payUrl) {
    return { type: "redirect", url: payUrl };
  }

  if (redirect && !isThankYouUrl(redirect) && !isThankYouUrl(rawRedirect)) {
    return { type: "redirect", url: redirect };
  }

  if (online) {
    return {
      type: "pending",
      url: payUrl || redirect || undefined,
    };
  }

  if (redirect && isThankYouUrl(redirect) && paymentStatus === "success") {
    return { type: "success" };
  }

  return { type: "pending", url: redirect || undefined };
}

export { resolveClientStorefrontOrigin };
