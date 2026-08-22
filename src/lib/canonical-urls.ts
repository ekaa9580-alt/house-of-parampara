/**
 * Canonical production URLs for payment flows.
 *
 * Razorpay is approved for https://www.houseofparampara.net
 * Hostinger temporary domains (hostingersite.com) must never appear in
 * order-pay / return URLs shown to the customer or Razorpay.
 */

const BLOCKED_HOST_RE = /hostingersite\.com/i;

/** Razorpay-approved storefront domain (www). */
export const DEFAULT_CANONICAL_ORIGIN = "https://www.houseofparampara.net";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function parseHost(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

export function isTemporaryHostingerHost(host: string): boolean {
  return BLOCKED_HOST_RE.test(host || "");
}

export function isTemporaryHostingerUrl(url: string): boolean {
  const host = parseHost(url);
  return host ? isTemporaryHostingerHost(host) : false;
}

/**
 * Storefront origin (Next.js) — where checkout + success live.
 * Prefer explicit canonical env, else SITE_URL if not hostinger, else www default.
 */
export function getCanonicalStorefrontOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_CANONICAL_SITE_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) {
    const host = parseHost(site);
    if (host && !isTemporaryHostingerHost(host)) {
      return stripTrailingSlash(site);
    }
  }

  return DEFAULT_CANONICAL_ORIGIN;
}

/**
 * WooCommerce public origin — where order-pay + Razorpay callback live.
 * Must match WordPress Site Address on production (www.houseofparampara.net).
 */
export function getCanonicalWcOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_CANONICAL_WC_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  const wc = process.env.NEXT_PUBLIC_WC_URL?.trim();
  if (wc) {
    const host = parseHost(wc);
    if (host && !isTemporaryHostingerHost(host)) {
      return stripTrailingSlash(wc);
    }
  }

  // Headless: WC checkout endpoints are served on the same public domain.
  return getCanonicalStorefrontOrigin();
}

/**
 * Rewrite any Hostinger temporary URL to the canonical WC origin (path + query preserved).
 */
export function rewriteToCanonicalPaymentUrl(
  url: string,
  wcOrigin = getCanonicalWcOrigin()
): string {
  if (!url?.trim()) return url;
  const trimmed = url.trim();
  if (!isTemporaryHostingerUrl(trimmed)) return trimmed;

  try {
    const parsed = new URL(trimmed);
    const canonical = new URL(wcOrigin);
    parsed.protocol = canonical.protocol;
    parsed.host = canonical.host;
    parsed.port = canonical.port;
    return parsed.toString();
  } catch {
    return trimmed;
  }
}

/** Resolve browser origin at runtime, falling back to canonical storefront. */
export function resolveClientStorefrontOrigin(
  windowOrigin?: string | null
): string {
  if (windowOrigin) {
    const host = parseHost(windowOrigin);
    if (host && !isTemporaryHostingerHost(host)) {
      return stripTrailingSlash(windowOrigin);
    }
  }
  return getCanonicalStorefrontOrigin();
}
