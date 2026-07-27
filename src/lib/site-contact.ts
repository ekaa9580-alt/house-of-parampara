/**
 * Central contact details — single source for storefront display.
 * Env vars win; CMS stale emails like hello@… are ignored for business email.
 */
export const BUSINESS_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
  "support@houseofparampara.net";

export const BUSINESS_PHONE =
  process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || undefined;

export const BUSINESS_WHATSAPP =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || undefined;

export const BUSINESS_INSTAGRAM =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() ||
  "https://www.instagram.com/houseof_parampara";

/** Prefer env business email; never surface known legacy placeholders. */
export function resolveBusinessEmail(cmsEmail?: string | null): string {
  const env = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  if (env) return env;
  const cms = cmsEmail?.trim();
  if (
    cms &&
    !/hello@houseofparampara\.(com|net)/i.test(cms)
  ) {
    return cms;
  }
  return "support@houseofparampara.net";
}
