import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { WooProduct } from "@/types/woocommerce";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  price: string | number | null | undefined,
  currencySymbol?: string,
  minorUnit = 0
): string {
  const symbol =
    currencySymbol || process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹";
  let amount =
    typeof price === "string" ? parseFloat(price) : Number(price ?? 0);
  if (Number.isNaN(amount)) return `${symbol}0`;

  if (minorUnit > 0) {
    amount = amount / Math.pow(10, minorUnit);
  }

  return `${symbol}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Valid http(s) image URL for next/image — avoids runtime crashes on empty src */
export function safeImageSrc(src?: string | null): string | null {
  if (!src || typeof src !== "string") return null;
  const trimmed = src.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) return trimmed;
  return null;
}

/** Catalog-ready products only (skip incomplete WC drafts published by mistake) */
export function isCatalogProduct(product: WooProduct | null | undefined): boolean {
  if (!product) return false;
  if (product.status && product.status !== "publish") return false;
  if (product.catalog_visibility === "hidden") return false;
  if (!product.name?.trim()) return false;
  if (!product.slug?.trim()) return false;
  return true;
}

export function stripHtml(html: string): string {
  return html?.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim() || "";
}

export function getDiscountPercent(
  regular: string | number,
  sale: string | number
): number | null {
  const r = typeof regular === "string" ? parseFloat(regular) : regular;
  const s = typeof sale === "string" ? parseFloat(sale) : sale;
  if (!r || !s || s >= r || Number.isNaN(r) || Number.isNaN(s)) return null;
  return Math.round(((r - s) / r) * 100);
}

export function isInStock(status: string): boolean {
  return status === "instock" || status === "onbackorder";
}

export type StockDisplay = {
  label: string;
  detail?: string;
  available: boolean;
  quantity: number | null;
};

/**
 * Stock copy from WooCommerce stock_status + stock_quantity.
 * >10  → In Stock / N available
 * 1–10 → Only N left in stock
 * 0 / outofstock → Out of Stock
 */
export function formatStockDisplay(
  stockStatus?: string | null,
  stockQuantity?: number | null
): StockDisplay {
  const status = stockStatus || "outofstock";
  const qty =
    typeof stockQuantity === "number" && !Number.isNaN(stockQuantity)
      ? stockQuantity
      : null;

  if (status === "outofstock" || qty === 0) {
    return {
      label: "Out of Stock",
      available: false,
      quantity: qty === 0 ? 0 : qty,
    };
  }

  if (status === "onbackorder") {
    return {
      label: "Available on Backorder",
      available: true,
      quantity: qty,
    };
  }

  if (qty != null && qty > 0 && qty <= 10) {
    return {
      label: `Only ${qty} left in stock`,
      available: true,
      quantity: qty,
    };
  }

  if (qty != null && qty > 10) {
    return {
      label: "In Stock",
      detail: `${qty} available`,
      available: true,
      quantity: qty,
    };
  }

  // manage_stock off — status only
  return {
    label: status === "instock" ? "In Stock" : "Out of Stock",
    available: status === "instock",
    quantity: qty,
  };
}

/** Normalize WC Store API absolute product URLs to Next app paths */
export function cartItemHref(permalink?: string | null): string {
  if (!permalink) return "/shop";
  const trimmed = permalink.trim();
  if (!trimmed) return "/shop";
  if (trimmed.startsWith("/product/")) return trimmed.split("?")[0];
  if (trimmed.startsWith("/")) return trimmed.split("?")[0];
  try {
    const u = new URL(trimmed);
    const match = u.pathname.match(/\/product\/([^/]+)\/?/);
    if (match) return `/product/${match[1]}`;
  } catch {
    /* ignore */
  }
  return "/shop";
}

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
