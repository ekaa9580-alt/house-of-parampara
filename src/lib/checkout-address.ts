import type { WooAddress } from "@/types/woocommerce";

/** WooCommerce Store API expects IN state codes, not full names. */
const IN_STATE_CODES: Record<string, string> = {
  andhrapradesh: "AP",
  arunachalpradesh: "AR",
  assam: "AS",
  bihar: "BR",
  chhattisgarh: "CG",
  goa: "GA",
  gujarat: "GJ",
  haryana: "HR",
  himachalpradesh: "HP",
  jharkhand: "JH",
  karnataka: "KA",
  kerala: "KL",
  madhyapradesh: "MP",
  maharashtra: "MH",
  manipur: "MN",
  meghalaya: "ML",
  mizoram: "MZ",
  nagaland: "NL",
  odisha: "OR",
  orissa: "OR",
  punjab: "PB",
  rajasthan: "RJ",
  sikkim: "SK",
  tamilnadu: "TN",
  telangana: "TS",
  tripura: "TR",
  uttarpradesh: "UP",
  uttarakhand: "UK",
  westbengal: "WB",
  delhi: "DL",
  nctofdelhi: "DL",
  jammuandkashmir: "JK",
  ladakh: "LA",
  puducherry: "PY",
  pondicherry: "PY",
  chandigarh: "CH",
  andamanandnicobarislands: "AN",
  dadraandnagarhavelianddamananddiu: "DN",
  lakshadweep: "LD",
};

function normalizeState(country: string, state: string): string {
  const trimmed = (state || "").trim();
  if (!trimmed) return "";
  if (country !== "IN") return trimmed;
  if (/^[A-Z]{2}$/i.test(trimmed)) return trimmed.toUpperCase();
  const key = trimmed.toLowerCase().replace(/[^a-z]/g, "");
  return IN_STATE_CODES[key] || trimmed;
}

/** India: 6-digit pincode only (WooCommerce Store API rejects invalid pincodes). */
export function normalizePostcode(country: string, postcode: string): string {
  const trimmed = (postcode || "").trim();
  if (country === "IN") {
    const digits = trimmed.replace(/\D/g, "");
    return digits.slice(0, 6);
  }
  return trimmed;
}

export function isPostcodeValidForStoreApi(
  country: string,
  postcode: string
): boolean {
  const c = (country || "IN").trim().toUpperCase();
  const pc = normalizePostcode(c, postcode);
  if (c === "IN") return /^\d{6}$/.test(pc);
  return pc.length >= 3;
}

export function sanitizeBillingAddress(
  addr?: Partial<WooAddress> | null
): WooAddress | undefined {
  if (!addr) return undefined;
  const country = ((addr.country || "IN").trim() || "IN").slice(0, 2).toUpperCase();
  return {
    first_name: (addr.first_name || "").trim(),
    last_name: (addr.last_name || "").trim(),
    company: addr.company || "",
    address_1: (addr.address_1 || "").trim(),
    address_2: addr.address_2 || "",
    city: (addr.city || "").trim(),
    state: normalizeState(country, addr.state || ""),
    postcode: normalizePostcode(country, addr.postcode || ""),
    country,
    email: (addr.email || "").trim(),
    phone: (addr.phone || "").trim(),
  };
}

/** Store API shipping schema has no email field — sending it can 400. */
export function sanitizeShippingAddress(
  addr?: Partial<WooAddress> | null
): Omit<WooAddress, "email"> | undefined {
  const billing = sanitizeBillingAddress(addr);
  if (!billing) return undefined;
  const { email, ...shipping } = billing;
  void email;
  return shipping;
}

export function isBillingReadyForStoreApi(addr?: Partial<WooAddress> | null): boolean {
  const b = sanitizeBillingAddress(addr);
  if (!b) return false;
  return !!(
    b.first_name &&
    b.last_name &&
    b.address_1 &&
    b.city &&
    b.postcode &&
    b.country &&
    b.email &&
    b.phone &&
    isPostcodeValidForStoreApi(b.country, b.postcode)
  );
}
