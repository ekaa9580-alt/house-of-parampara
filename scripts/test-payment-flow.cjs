/**
 * Lightweight checks for checkout address sanitization + payment return URLs.
 * Run: node scripts/test-payment-flow.cjs
 */
const assert = require("assert");

const IN_STATE_CODES = {
  karnataka: "KA",
  kerala: "KL",
  maharashtra: "MH",
};

function normalizeState(country, state) {
  const trimmed = (state || "").trim();
  if (!trimmed) return "";
  if (country !== "IN") return trimmed;
  if (/^[A-Z]{2}$/i.test(trimmed)) return trimmed.toUpperCase();
  const key = trimmed.toLowerCase().replace(/[^a-z]/g, "");
  return IN_STATE_CODES[key] || trimmed;
}

function sanitizeShipping(addr) {
  const country = ((addr.country || "IN").trim() || "IN").slice(0, 2).toUpperCase();
  const { email, ...rest } = {
    ...addr,
    country,
    state: normalizeState(country, addr.state || ""),
  };
  return rest;
}

function buildOrderPayUrl(orderId, orderKey, wcBase, siteBase) {
  const params = new URLSearchParams({
    pay_for_order: "true",
    key: orderKey,
    hop_return: `${siteBase}/checkout/success?id=${orderId}&key=${orderKey}`,
  });
  return `${wcBase}/checkout/order-pay/${orderId}/?${params.toString()}`;
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
        "https://wp.example",
        "https://shop.example"
      ),
    };
  }
  return { type: "pending" };
}

// Address: shipping must not include email
const shipping = sanitizeShipping({
  first_name: "A",
  last_name: "B",
  address_1: "1 Main",
  city: "Mysore",
  state: "karnataka",
  postcode: "570017",
  country: "IN",
  email: "a@b.com",
  phone: "999",
});
assert.strictEqual(shipping.state, "KA");
assert.strictEqual("email" in shipping, false);

// Razorpay must not treat order creation as success
const unpaid = resolvePostCheckoutAction(
  {
    order_id: 715,
    status: "pending",
    order_key: "wc_order_test",
    payment_result: { payment_status: "success", redirect_url: "" },
  },
  "razorpay"
);
assert.strictEqual(unpaid.type, "redirect");
assert.match(unpaid.url, /order-pay\/715/);
assert.match(unpaid.url, /hop_return=/);
assert.doesNotMatch(unpaid.url, /\/checkout\/success(?!.*hop_return)/);

const paid = resolvePostCheckoutAction(
  { order_id: 715, status: "processing", order_key: "wc_order_test" },
  "razorpay"
);
assert.strictEqual(paid.type, "success");

console.log("payment-flow tests passed");
