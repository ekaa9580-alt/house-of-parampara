import { wcApi, getTotalFromHeaders, ensureConfigured } from "./client";
import type {
  WooProduct,
  WooProductVariation,
  ProductsQueryParams,
  PaginatedResponse,
} from "@/types/woocommerce";
import { isCatalogProduct } from "@/lib/utils";

function buildParams(params: ProductsQueryParams = {}) {
  const q: Record<string, string | number | boolean> = {
    page: params.page ?? 1,
    per_page: params.per_page ?? 12,
    status: "publish",
  };

  if (params.search) q.search = params.search;
  if (params.category) q.category = params.category;
  if (params.tag) q.tag = params.tag;
  if (params.featured !== undefined) q.featured = params.featured;
  // Dynamic WooCommerce sale filter — never hardcode product IDs
  if (params.on_sale !== undefined) q.on_sale = Boolean(params.on_sale);
  if (params.orderby) q.orderby = params.orderby;
  if (params.order) q.order = params.order;
  if (params.min_price !== undefined) q.min_price = params.min_price;
  if (params.max_price !== undefined) q.max_price = params.max_price;
  // Dynamic WooCommerce stock_status filter
  if (
    params.stock_status === "instock" ||
    params.stock_status === "outofstock" ||
    params.stock_status === "onbackorder"
  ) {
    q.stock_status = params.stock_status;
  }
  if (params.attribute) q.attribute = params.attribute;
  if (params.attribute_term) q.attribute_term = params.attribute_term;
  if (params.include?.length) q.include = params.include.join(",");
  if (params.exclude?.length) q.exclude = params.exclude.join(",");
  if (params.slug) q.slug = params.slug;

  return q;
}

function sanitizeList(products: WooProduct[]): WooProduct[] {
  return (products || []).filter(isCatalogProduct);
}

export async function getProducts(
  params: ProductsQueryParams = {}
): Promise<PaginatedResponse<WooProduct>> {
  ensureConfigured();
  const response = await wcApi.get<WooProduct[]>("/products", {
    params: buildParams(params),
  });
  const { total, totalPages } = getTotalFromHeaders(
    response.headers as Record<string, unknown>
  );
  const raw = response.data || [];
  const data = sanitizeList(raw);
  const removed = raw.length - data.length;
  return {
    data,
    total: Math.max(0, total - removed),
    totalPages,
    page: params.page ?? 1,
    perPage: params.per_page ?? 12,
  };
}

export async function getProductBySlug(
  slug: string
): Promise<WooProduct | null> {
  ensureConfigured();
  const response = await wcApi.get<WooProduct[]>("/products", {
    params: { slug, status: "publish" },
  });
  const product = response.data[0] ?? null;
  if (!product || !isCatalogProduct(product)) return null;
  return product;
}

export async function getProductById(id: number): Promise<WooProduct> {
  ensureConfigured();
  const response = await wcApi.get<WooProduct>(`/products/${id}`);
  return response.data;
}

export async function getFeaturedProducts(perPage = 8): Promise<WooProduct[]> {
  const res = await getProducts({ featured: true, per_page: perPage });
  if (res.data.length) return res.data;
  // Fallback when store has no featured flags set
  return getLatestProducts(perPage);
}

export async function getLatestProducts(perPage = 8): Promise<WooProduct[]> {
  const res = await getProducts({
    orderby: "date",
    order: "desc",
    per_page: perPage,
  });
  return res.data;
}

export async function getBestSellers(perPage = 8): Promise<WooProduct[]> {
  const res = await getProducts({
    orderby: "popularity",
    order: "desc",
    per_page: perPage,
  });
  return res.data;
}

export async function getSaleProducts(perPage = 8): Promise<WooProduct[]> {
  const res = await getProducts({ on_sale: true, per_page: perPage });
  return res.data;
}

export async function getRelatedProducts(
  product: WooProduct,
  limit = 4
): Promise<WooProduct[]> {
  if (!product.related_ids?.length) {
    const cat = product.categories?.[0]?.id;
    if (!cat) return [];
    const res = await getProducts({
      category: cat,
      per_page: limit + 1,
      exclude: [product.id],
    });
    return res.data.filter((p) => p.id !== product.id).slice(0, limit);
  }
  const res = await getProducts({
    include: product.related_ids.slice(0, limit),
    per_page: limit,
  });
  return res.data;
}

export async function getProductVariations(
  productId: number
): Promise<WooProductVariation[]> {
  ensureConfigured();
  const response = await wcApi.get<WooProductVariation[]>(
    `/products/${productId}/variations`,
    { params: { per_page: 100 } }
  );
  return response.data;
}

export async function searchProducts(
  query: string,
  perPage = 10
): Promise<WooProduct[]> {
  if (!query.trim()) return [];
  const q = query.trim();
  const bySearch = await getProducts({ search: q, per_page: perPage });

  // Also try exact SKU match (WC search does not always include SKU)
  let bySku: WooProduct[] = [];
  try {
    ensureConfigured();
    const response = await wcApi.get<WooProduct[]>("/products", {
      params: { sku: q, status: "publish", per_page: perPage },
    });
    bySku = sanitizeList(response.data || []);
  } catch {
    bySku = [];
  }

  const seen = new Set<number>();
  const merged: WooProduct[] = [];
  for (const p of [...bySku, ...bySearch.data]) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    merged.push(p);
    if (merged.length >= perPage) break;
  }
  return merged;
}
