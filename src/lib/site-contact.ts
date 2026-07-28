/**
 * Contact details resolver — WordPress / WooCommerce settings first.
 * Never display legacy hello@houseofparampara.* addresses.
 */
const LEGACY_HELLO = /^hello@houseofparampara\.(com|net)$/i;
const FALLBACK_EMAIL = "support@houseofparampara.net";

/** Prefer CMS/WP email, then env, then support@ fallback. Reject hello@. */
export function resolveBusinessEmail(cmsEmail?: string | null): string {
  const cms = cmsEmail?.trim();
  if (cms && !LEGACY_HELLO.test(cms)) return cms;

  const env = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  if (env && !LEGACY_HELLO.test(env)) return env;

  return FALLBACK_EMAIL;
}

/** Sync fallback for server components before settings load */
export const BUSINESS_EMAIL = resolveBusinessEmail(
  process.env.NEXT_PUBLIC_CONTACT_EMAIL
);

export const BUSINESS_PHONE =
  process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || undefined;

export const BUSINESS_WHATSAPP =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || undefined;

export const BUSINESS_INSTAGRAM =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() ||
  "https://www.instagram.com/houseof_parampara";
