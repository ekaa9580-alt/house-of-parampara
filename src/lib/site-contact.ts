/**
 * Central contact details — single source for storefront display.
 *
 * Source of truth for email display:
 * 1. NEXT_PUBLIC_CONTACT_EMAIL (Vercel / .env) — if set and NOT the legacy hello@ address
 * 2. Always fall back to support@houseofparampara.net
 *
 * WordPress/CMS often still stores hello@houseofparampara.com (admin_email / old Site Settings).
 * That value must never be shown on the storefront.
 */
const LEGACY_HELLO = /^hello@houseofparampara\.(com|net)$/i;
const CANONICAL_EMAIL = "support@houseofparampara.net";

export const BUSINESS_EMAIL = (() => {
  const env = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  if (env && !LEGACY_HELLO.test(env)) return env;
  return CANONICAL_EMAIL;
})();

export const BUSINESS_PHONE =
  process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || undefined;

export const BUSINESS_WHATSAPP =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || undefined;

export const BUSINESS_INSTAGRAM =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() ||
  "https://www.instagram.com/houseof_parampara";

/** Never surface the legacy hello@ address from env or CMS. */
export function resolveBusinessEmail(cmsEmail?: string | null): string {
  const env = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  if (env && !LEGACY_HELLO.test(env)) return env;

  const cms = cmsEmail?.trim();
  if (cms && !LEGACY_HELLO.test(cms)) return cms;

  return CANONICAL_EMAIL;
}
