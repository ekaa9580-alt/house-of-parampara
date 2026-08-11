/**
 * Post-checkout payment routing for WooCommerce + Razorpay.
 *
 * WooCommerce Store API creates the order first, then returns payment_result.
 * Razorpay's process_payment redirects to the WC order-pay URL where Checkout.js runs.
 * Creating an order is NOT the same as a successful payment.
 */

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

export function getWcPublicBaseUrl(): string {
  return stripTrailingSlash(process.env.NEXT_PUBLIC_WC_URL || "");
}

export function absoluteWcUrl(url: string, wcBase = getWcPublicBaseUrl()): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (!wcBase) return trimmed;
  const base = stripTrailingSlash(wcBase);
  return trimmed.startsWith("/") ? `${base}${trimmed}` : `${base}/${trimmed}`;
}

/** WooCommerce “Pay for order” URL where Razorpay Checkout opens. */
export function buildOrderPayUrl(
  orderId: number,
  orderKey: string,
  wcBase = getWcPublicBaseUrl()
): string {
  const base = stripTrailingSlash(wcBase);
  if (!base || !orderId || !orderKey) return "";
  const params = new URLSearchParams({
    pay_for_order: "true",
    key: orderKey,
  });
  return `${base}/checkout/order-pay/${orderId}/?${params.toString()}`;
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
  wcBase = getWcPublicBaseUrl()
): PostCheckoutAction {
  const orderStatus = (data.status || "").toLowerCase();
  const paymentStatus = (
    data.payment_result?.payment_status || ""
  ).toLowerCase();
  const rawRedirect = data.payment_result?.redirect_url || "";
  const redirect = absoluteWcUrl(rawRedirect, wcBase);
  const isRazorpay = /razorpay/i.test(paymentMethod);
  const online = isOnlineGateway(paymentMethod) || isRazorpay;
  const orderPaid = ["processing", "completed"].includes(orderStatus);

  // Only treat as paid when WooCommerce order status says so.
  if (orderPaid) {
    return { type: "success" };
  }

  // COD / offline: gateway may return success without a pay redirect.
  if (!online && (paymentStatus === "success" || orderStatus === "on-hold")) {
    return { type: "success" };
  }

  // Prefer gateway redirect when it is a payment page (not thank-you).
  if (redirect && !isThankYouUrl(redirect) && !isThankYouUrl(rawRedirect)) {
    return { type: "redirect", url: redirect };
  }

  // Razorpay / online unpaid: force order-pay so Checkout can open.
  if (online && data.order_id && data.order_key) {
    const payUrl = buildOrderPayUrl(data.order_id, data.order_key, wcBase);
    if (payUrl) {
      return { type: "redirect", url: payUrl };
    }
  }

  // Thank-you redirect without paid status is still pending for online methods.
  if (online) {
    return {
      type: "pending",
      url:
        data.order_id && data.order_key
          ? buildOrderPayUrl(data.order_id, data.order_key, wcBase)
          : redirect || undefined,
    };
  }

  if (redirect && isThankYouUrl(redirect) && paymentStatus === "success") {
    return { type: "success" };
  }

  return { type: "pending", url: redirect || undefined };
}
