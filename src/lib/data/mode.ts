/**
 * Data source switch.
 * UI never imports this directly for content — API routes use it.
 *
 * Live WooCommerce unless NEXT_PUBLIC_USE_MOCK=true explicitly.
 * Production must never fall back to seed data silently.
 */

export function isMockDataMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK === "true";
}

export function getDataMode(): "mock" | "woocommerce" {
  return isMockDataMode() ? "mock" : "woocommerce";
}
