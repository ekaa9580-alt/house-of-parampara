/**
 * Payment flow + canonical URL tests.
 * Run: node scripts/test-payment-flow.cjs
 */
const assert = require("assert");

const DEFAULT_CANONICAL = "https://www.houseofparampara.net";
const BLOCKED_HOST_RE = /hostingersite\.com/i;

function isTemporaryHostingerUrl(url) {
  try {
    return BLOCKED_HOST_RE.test(new URL(url).host);
  } catch {
    return false;
  }
}

function rewriteToCanonicalPaymentUrl(url, wcOrigin = DEFAULT_CANONICAL) {
  if (!url || !isTemporaryHostingerUrl(url)) return url;
  const parsed = new URL(url);
  const canonical = new URL(wcOrigin);
  parsed.protocol = canonical.protocol;
  parsed.host = canonical.host;
  return parsed.toString();
}

function buildOrderPayUrl(orderId, orderKey, wcBase, siteBase) {
  const params = new URLSearchParams({
    pay_for_order: "true",
    key: orderKey,
    hop_return: `${siteBase}/checkout/success?id=${orderId}&key=${orderKey}`,
  });
  const raw = `${wcBase}/checkout/order-pay/${orderId}/?${params.toString()}`;
  return rewriteToCanonicalPaymentUrl(raw, DEFAULT_CANONICAL);
}

function resolvePostCheckoutAction(data, paymentMethod) {
  const orderPaid = ["processing", "completed"].includes(
    (data.status || "").toLowerCase()
  );
  if (orderPaid) return { type: "success" };
  if (/razorpay/i.test(paymentMethod) && data.order_id && data.order_key) {
    return {
      type: "redirect",
      url: buildOrderPayUrl(
        data.order_id,
        data.order_key,
        "https://darkcyan-salamander-384448.hostingersite.com",
        DEFAULT_CANONICAL
      ),
    };
  }
  return { type: "pending" };
}

function normalizePostcode(country, postcode) {
  if (country === "IN") {
    return (postcode || "").replace(/\D/g, "").slice(0, 6);
  }
  return (postcode || "").trim();
}

function isPostcodeValid(country, postcode) {
  const pc = normalizePostcode(country, postcode);
  if (country === "IN") return /^\d{6}$/.test(pc);
  return pc.length >= 3;
}

// Hostinger URL must be rewritten to canonical
const hostingerPay =
  "https://darkcyan-salamander-384448.hostingersite.com/checkout/order-pay/715/?pay_for_order=true&key=wc_test";
const rewritten = rewriteToCanonicalPaymentUrl(hostingerPay);
assert.match(rewritten, /^https:\/\/www\.houseofparampara\.net\//);
assert.doesNotMatch(rewritten, /hostingersite/);

// Razorpay must not treat order creation as success
const unpaid = resolvePostCheckoutAction(
  {
    order_id: 715,
    status: "pending",
    order_key: "wc_order_test",
    payment_result: {
      payment_status: "success",
      redirect_url:
        "https://darkcyan-salamander-384448.hostingersite.com/checkout/order-pay/715/?key=wc_order_test",
    },
  },
  "razorpay"
);
assert.strictEqual(unpaid.type, "redirect");
assert.match(unpaid.url, /www\.houseofparampara\.net\/checkout\/order-pay\/715/);
assert.doesNotMatch(unpaid.url, /hostingersite/);
assert.match(unpaid.url, /hop_return=/);

const paid = resolvePostCheckoutAction(
  { order_id: 715, status: "processing", order_key: "wc_order_test" },
  "razorpay"
);
assert.strictEqual(paid.type, "success");

// India pincode validation
assert.strictEqual(normalizePostcode("IN", "570 017"), "570017");
assert.strictEqual(isPostcodeValid("IN", "570017"), true);
assert.strictEqual(isPostcodeValid("IN", "57001"), false);

console.log("payment-flow tests passed");
