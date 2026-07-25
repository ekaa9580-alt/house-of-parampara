import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
} from "axios";
import type { ApiError } from "@/types/woocommerce";

function stripTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

export function getWcBaseUrl(): string {
  return stripTrailingSlash(process.env.NEXT_PUBLIC_WC_URL || "");
}

export function getWcCredentials() {
  return {
    key: process.env.WC_CONSUMER_KEY || "",
    secret: process.env.WC_CONSUMER_SECRET || "",
  };
}

/**
 * Create a fresh WooCommerce REST v3 client.
 * Uses Basic Auth + query-string credentials (hosts often strip Authorization).
 */
export function createWcApi(): AxiosInstance {
  const base = getWcBaseUrl();
  const { key, secret } = getWcCredentials();

  const instance = axios.create({
    baseURL: `${base}/wp-json/wc/v3`,
    timeout: 45000,
    auth: { username: key, password: secret },
    headers: { "Content-Type": "application/json" },
    params: {
      consumer_key: key,
      consumer_secret: secret,
    },
  });

  return instance;
}

/** Store API (cart / checkout) — session via Cart-Token header */
export function createStoreApi(): AxiosInstance {
  const base = getWcBaseUrl();
  return axios.create({
    baseURL: `${base}/wp-json/wc/store/v1`,
    timeout: 45000,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
}

/** WordPress REST root */
export function createWpApi(): AxiosInstance {
  const base = getWcBaseUrl();
  return axios.create({
    baseURL: `${base}/wp-json`,
    timeout: 45000,
    headers: { "Content-Type": "application/json" },
  });
}

/** Lazy singletons refreshed when env is present */
let _wcApi: AxiosInstance | null = null;
let _storeApi: AxiosInstance | null = null;
let _wpApi: AxiosInstance | null = null;
let _boundUrl = "";

function refreshClientsIfNeeded() {
  const url = getWcBaseUrl();
  if (!_wcApi || _boundUrl !== url) {
    _wcApi = createWcApi();
    _storeApi = createStoreApi();
    _wpApi = createWpApi();
    _boundUrl = url;
  }
}

export const wcApi: AxiosInstance = new Proxy({} as AxiosInstance, {
  get(_t, prop, receiver) {
    refreshClientsIfNeeded();
    const value = Reflect.get(_wcApi!, prop, receiver);
    return typeof value === "function" ? value.bind(_wcApi) : value;
  },
});

export const storeApi: AxiosInstance = new Proxy({} as AxiosInstance, {
  get(_t, prop, receiver) {
    refreshClientsIfNeeded();
    const value = Reflect.get(_storeApi!, prop, receiver);
    return typeof value === "function" ? value.bind(_storeApi) : value;
  },
});

export const wpApi: AxiosInstance = new Proxy({} as AxiosInstance, {
  get(_t, prop, receiver) {
    refreshClientsIfNeeded();
    const value = Reflect.get(_wpApi!, prop, receiver);
    return typeof value === "function" ? value.bind(_wpApi) : value;
  },
});

/** Browser → Next.js API routes */
export const clientApi: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 45000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export function parseApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const ax = error as AxiosError<ApiError & { message?: string }>;
    const data = ax.response?.data;
    const message =
      (typeof data === "object" && data && "message" in data
        ? String((data as { message?: string }).message)
        : null) ||
      ax.message ||
      "An unexpected error occurred";

    return {
      code:
        (typeof data === "object" && data && "code" in data
          ? String((data as { code?: string }).code)
          : null) ||
        ax.code ||
        "unknown_error",
      message: message.replace(/<[^>]*>/g, ""),
      data: (data as ApiError)?.data,
    };
  }
  if (error instanceof Error) {
    return { code: "error", message: error.message };
  }
  return { code: "unknown_error", message: "An unexpected error occurred" };
}

export function getTotalFromHeaders(headers: Record<string, unknown>): {
  total: number;
  totalPages: number;
} {
  const lower: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(headers || {})) {
    lower[k.toLowerCase()] = v;
  }
  const total = Number(lower["x-wp-total"] ?? 0);
  const totalPages = Number(lower["x-wp-totalpages"] ?? 0);
  return { total, totalPages };
}

/** Normalize axios response headers (always lowercase in Node) */
export function headerGet(
  headers: Record<string, unknown> | undefined,
  name: string
): string | null {
  if (!headers) return null;
  const target = name.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === target && v != null) return String(v);
  }
  return null;
}

export function ensureConfigured(): void {
  const url = getWcBaseUrl();
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_WC_URL is not configured. Set it in .env.local."
    );
  }
  const { key, secret } = getWcCredentials();
  if (!key || !secret) {
    throw new Error(
      "WC_CONSUMER_KEY / WC_CONSUMER_SECRET are not configured in .env.local."
    );
  }
}

export async function pingWooCommerce(): Promise<{
  ok: boolean;
  url: string;
  products?: number;
  error?: string;
}> {
  const url = getWcBaseUrl();
  if (!url) return { ok: false, url: "", error: "NEXT_PUBLIC_WC_URL missing" };
  try {
    ensureConfigured();
    const res = await createWcApi().get("/products", {
      params: { per_page: 1, status: "publish" },
    });
    const { total } = getTotalFromHeaders(
      res.headers as Record<string, unknown>
    );
    return { ok: true, url, products: total };
  } catch (e) {
    return { ok: false, url, error: parseApiError(e).message };
  }
}

export { getWcBaseUrl as WC_URL_FN };
export const WC_URL = process.env.NEXT_PUBLIC_WC_URL || "";

export type { AxiosRequestConfig };
