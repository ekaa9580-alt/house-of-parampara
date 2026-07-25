/**
 * Data source switch.
 * UI never imports this directly for content — API routes use it.
 *
 * Live WooCommerce when:
 *   NEXT_PUBLIC_USE_MOCK !== "true"
 *   AND NEXT_PUBLIC_WC_URL + WC_CONSUMER_KEY + WC_CONSUMER_SECRET are set
 *
 * Otherwise mock seed data (same shapes as WooCommerce REST).
 */

export function isMockDataMode(): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") return true;
  if (process.env.NEXT_PUBLIC_USE_MOCK === "false") return false;

  const url = process.env.NEXT_PUBLIC_WC_URL || "";
  const key = process.env.WC_CONSUMER_KEY || "";
  const secret = process.env.WC_CONSUMER_SECRET || "";

  const looksConfigured =
    url.length > 8 &&
    !url.includes("your-store.com") &&
    key.startsWith("ck_") &&
    secret.startsWith("cs_") &&
    !key.includes("xxxxxxxx");

  return !looksConfigured;
}

export function getDataMode(): "mock" | "woocommerce" {
  return isMockDataMode() ? "mock" : "woocommerce";
}
