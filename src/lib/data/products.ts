/**
 * Unified product data provider — mock OR WooCommerce.
 * Components/hooks call Next.js API routes; routes call these functions.
 * Switching sources never requires UI changes.
 */
import { isMockDataMode } from "./mode";
import {
  seedProducts,
  seedCategories,
} from "./seed";
import { isCatalogProduct } from "@/lib/utils";
import type {
  WooProduct,
  ProductsQueryParams,
  PaginatedResponse,
} from "@/types/woocommerce";

async function live() {
  return import("@/lib/api/products");
}

function filterProducts(
  products: WooProduct[],
  params: ProductsQueryParams = {}
): PaginatedResponse<WooProduct> {
  let list = products.filter(isCatalogProduct);

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.short_description.toLowerCase().includes(q)
    );
  }
  if (params.category) {
    const cat = String(params.category);
    list = list.filter((p) =>
      p.categories.some(
        (c) => String(c.id) === cat || c.slug === cat
      )
    );
  }
  if (params.featured) list = list.filter((p) => p.featured);
  // Mirror WooCommerce: filter by live product.on_sale / stock_status fields
  if (params.on_sale === true) list = list.filter((p) => p.on_sale === true);
  if (params.on_sale === false) list = list.filter((p) => p.on_sale === false);
  if (params.stock_status)
    list = list.filter((p) => p.stock_status === params.stock_status);
  if (params.min_price !== undefined)
    list = list.filter((p) => parseFloat(p.price) >= params.min_price!);
  if (params.max_price !== undefined)
    list = list.filter((p) => parseFloat(p.price) <= params.max_price!);
  if (params.include?.length) {
    const order = params.include;
    list = list
      .filter((p) => order.includes(p.id))
      .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  }
  if (params.slug) list = list.filter((p) => p.slug === params.slug);

  const orderby = params.orderby || "date";
  const order = params.order || "desc";
  list.sort((a, b) => {
    let cmp = 0;
    switch (orderby) {
      case "price":
        cmp = parseFloat(a.price) - parseFloat(b.price);
        break;
      case "popularity":
        cmp = a.total_sales - b.total_sales;
        break;
      case "rating":
        cmp = parseFloat(a.average_rating) - parseFloat(b.average_rating);
        break;
      case "title":
        cmp = a.name.localeCompare(b.name);
        break;
      case "date":
      default:
        cmp =
          new Date(a.date_created).getTime() -
          new Date(b.date_created).getTime();
    }
    return order === "asc" ? cmp : -cmp;
  });

  const page = params.page ?? 1;
  const perPage = params.per_page ?? 12;
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const data = list.slice(start, start + perPage);

  return { data, total, totalPages, page, perPage };
}

export async function fetchProducts(
  params: ProductsQueryParams = {}
): Promise<PaginatedResponse<WooProduct>> {
  if (isMockDataMode()) return filterProducts(seedProducts, params);
  const api = await live();
  // Resolve category slug → id for WC
  if (params.category && Number.isNaN(Number(params.category))) {
    const { getCategoryBySlug } = await import("@/lib/api/categories");
    const cat = await getCategoryBySlug(String(params.category));
    if (cat) params = { ...params, category: cat.id };
  }
  return api.getProducts(params);
}

export async function fetchProductBySlug(
  slug: string
): Promise<WooProduct | null> {
  if (isMockDataMode()) {
    return seedProducts.find((p) => p.slug === slug) ?? null;
  }
  const api = await live();
  return api.getProductBySlug(slug);
}

export async function fetchFeaturedProducts(perPage = 8) {
  if (isMockDataMode()) {
    const featured = filterProducts(seedProducts, {
      featured: true,
      per_page: perPage,
    }).data;
    if (featured.length) return featured;
    return filterProducts(seedProducts, {
      orderby: "date",
      order: "desc",
      per_page: perPage,
    }).data;
  }
  const api = await live();
  return api.getFeaturedProducts(perPage);
}

export async function fetchLatestProducts(perPage = 8) {
  if (isMockDataMode())
    return filterProducts(seedProducts, {
      orderby: "date",
      order: "desc",
      per_page: perPage,
    }).data;
  const api = await live();
  return api.getLatestProducts(perPage);
}

export async function fetchBestSellers(perPage = 8) {
  if (isMockDataMode())
    return filterProducts(seedProducts, {
      orderby: "popularity",
      order: "desc",
      per_page: perPage,
    }).data;
  const api = await live();
  return api.getBestSellers(perPage);
}

export async function fetchSaleProducts(perPage = 8) {
  if (isMockDataMode())
    return filterProducts(seedProducts, { on_sale: true, per_page: perPage })
      .data;
  const api = await live();
  return api.getSaleProducts(perPage);
}

export async function fetchRelatedProducts(slug: string, limit = 4) {
  const product = await fetchProductBySlug(slug);
  if (!product) return [];
  if (isMockDataMode()) {
    const ids = product.related_ids.slice(0, limit);
    return seedProducts.filter((p) => ids.includes(p.id));
  }
  const api = await live();
  return api.getRelatedProducts(product, limit);
}

export async function fetchSearchProducts(query: string, perPage = 10) {
  if (isMockDataMode())
    return filterProducts(seedProducts, { search: query, per_page: perPage })
      .data;
  const api = await live();
  return api.searchProducts(query, perPage);
}

export async function fetchCategories(parent?: number) {
  if (isMockDataMode()) {
    return seedCategories.filter((c) =>
      parent !== undefined ? c.parent === parent : true
    );
  }
  const { getCategories } = await import("@/lib/api/categories");
  return getCategories({
    ...(parent !== undefined ? { parent } : {}),
    hide_empty: true,
  });
}

export async function fetchCategoryBySlug(slug: string) {
  if (isMockDataMode()) {
    return seedCategories.find((c) => c.slug === slug) ?? null;
  }
  const { getCategoryBySlug } = await import("@/lib/api/categories");
  return getCategoryBySlug(slug);
}
