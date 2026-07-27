"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Pagination } from "@/components/ui/Pagination";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { useProducts, useCategories } from "@/hooks/useWooCommerce";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { cn } from "@/lib/utils";
import type { ProductsQueryParams, WooProduct } from "@/types/woocommerce";

interface ShopFiltersProps {
  categorySlug?: string;
  title?: string;
  bannerImage?: string | null;
  description?: string;
}

const FALLBACK_COLORS = [
  "Red",
  "Blue",
  "Green",
  "Gold",
  "Ivory",
  "Black",
  "Pink",
  "Maroon",
];

function extractColors(products: WooProduct[]): string[] {
  const set = new Set<string>();
  for (const p of products) {
    for (const attr of p.attributes || []) {
      if (!/color|colour/i.test(attr.name)) continue;
      for (const opt of attr.options || []) {
        if (opt.trim()) set.add(opt.trim());
      }
    }
  }
  return set.size ? Array.from(set).sort() : FALLBACK_COLORS;
}

function matchesColor(product: WooProduct, color: string): boolean {
  const needle = color.toLowerCase();
  return (product.attributes || []).some(
    (attr) =>
      /color|colour/i.test(attr.name) &&
      attr.options.some((o) => o.toLowerCase() === needle)
  );
}

function FiltersPanel({
  categories,
  catParam,
  categorySlug,
  color,
  colors,
  priceMin,
  priceMax,
  setPriceMin,
  setPriceMax,
  stock,
  onSale,
  setParam,
  applyPrice,
  onNavigateCategory,
  onClose,
}: {
  categories?: { id: number; name: string; slug: string; count: number }[];
  catParam?: string;
  categorySlug?: string;
  color: string | null;
  colors: string[];
  priceMin: string;
  priceMax: string;
  setPriceMin: (v: string) => void;
  setPriceMax: (v: string) => void;
  stock?: string;
  onSale: boolean;
  setParam: (key: string, value: string | null) => void;
  applyPrice: () => void;
  onNavigateCategory: (slug: string | null) => void;
  onClose?: () => void;
}) {
  return (
    <div className="space-y-8">
      {onClose && (
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-light">Filters</h2>
          <button type="button" aria-label="Close filters" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-xs font-medium tracking-[0.2em] uppercase">
          Category
        </h3>
        <ul className="space-y-2.5 text-sm">
          <li>
            <button
              type="button"
              onClick={() => {
                onNavigateCategory(null);
                onClose?.();
              }}
              className={
                !catParam ? "text-royal" : "text-ink-muted hover:text-ink"
              }
            >
              All
            </button>
          </li>
          {categories?.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  onNavigateCategory(c.slug);
                  onClose?.();
                }}
                className={
                  catParam === c.slug || catParam === String(c.id)
                    ? "text-royal"
                    : "text-ink-muted hover:text-ink dark:hover:text-cream"
                }
              >
                {c.name} ({c.count})
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-medium tracking-[0.2em] uppercase">
          Color
        </h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => {
            const active = color?.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setParam("color", active ? null : c);
                  onClose?.();
                }}
                className={cn(
                  "border px-3 py-1.5 text-xs tracking-wider uppercase transition-colors",
                  active
                    ? "border-ink bg-ink text-cream dark:border-cream dark:bg-cream dark:text-ink"
                    : "border-brand-200 text-ink-muted hover:border-ink dark:border-brand-700"
                )}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-medium tracking-[0.2em] uppercase">
          Price
        </h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="input-field px-2 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="input-field px-2 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            applyPrice();
            onClose?.();
          }}
          className="mt-3 w-full rounded-full bg-[var(--cms-primary,#1E3A8A)] px-4 py-2.5 text-sm font-medium tracking-[0.12em] uppercase text-cream shadow-sm transition hover:brightness-110"
        >
          Apply
        </button>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-medium tracking-[0.2em] uppercase">
          Availability
        </h3>
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <input
            type="checkbox"
            checked={stock === "instock"}
            onChange={(e) =>
              setParam("stock_status", e.target.checked ? "instock" : null)
            }
          />
          In Stock
        </label>
        <label className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
          <input
            type="checkbox"
            checked={onSale}
            onChange={(e) =>
              setParam("on_sale", e.target.checked ? "true" : null)
            }
          />
          On Sale
        </label>
      </div>

      {!categorySlug && (
        <p className="text-[11px] text-ink-muted">
          Tip: use Categories in the sidebar for Women, Men, Kids and Handicrafts.
        </p>
      )}
    </div>
  );
}

export function ShopView({
  categorySlug,
  title = "Shop",
  bannerImage,
  description,
}: ShopFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: categories } = useCategories(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useBodyScrollLock(filtersOpen);

  const page = Number(searchParams.get("page") || 1);
  const orderby = (searchParams.get("orderby") ||
    "date") as ProductsQueryParams["orderby"];
  const order = (searchParams.get("order") ||
    "desc") as ProductsQueryParams["order"];
  const minPrice = searchParams.get("min_price")
    ? Number(searchParams.get("min_price"))
    : undefined;
  const maxPrice = searchParams.get("max_price")
    ? Number(searchParams.get("max_price"))
    : undefined;
  const stockParam = searchParams.get("stock_status");
  const stock: ProductsQueryParams["stock_status"] | undefined =
    stockParam === "instock" ||
    stockParam === "outofstock" ||
    stockParam === "onbackorder"
      ? stockParam
      : undefined;
  const onSale = searchParams.get("on_sale") === "true";
  const featured = searchParams.get("featured") === "true";
  const color = searchParams.get("color");
  const catParam = categorySlug || searchParams.get("category") || undefined;
  const search = searchParams.get("search") || undefined;

  const [priceMin, setPriceMin] = useState(minPrice?.toString() || "");
  const [priceMax, setPriceMax] = useState(maxPrice?.toString() || "");

  const params: ProductsQueryParams = useMemo(
    () => ({
      page,
      per_page: 12,
      orderby,
      order,
      category: catParam,
      min_price: minPrice,
      max_price: maxPrice,
      stock_status: stock,
      on_sale: onSale || undefined,
      featured: featured || undefined,
      search,
    }),
    [
      page,
      orderby,
      order,
      catParam,
      minPrice,
      maxPrice,
      stock,
      onSale,
      featured,
      search,
    ]
  );

  const { data, isLoading } = useProducts(params);

  const colors = useMemo(
    () => extractColors(data?.data || []),
    [data?.data]
  );

  const products = useMemo(() => {
    const list = data?.data || [];
    if (!color) return list;
    const filtered = list.filter((p) => matchesColor(p, color));
    return filtered.length ? filtered : list;
  }, [data?.data, color]);

  const setParam = (key: string, value: string | null) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") sp.delete(key);
    else sp.set(key, value);
    if (key !== "page") sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  };

  const applyPrice = () => {
    const sp = new URLSearchParams(searchParams.toString());
    if (priceMin) sp.set("min_price", priceMin);
    else sp.delete("min_price");
    if (priceMax) sp.set("max_price", priceMax);
    else sp.delete("max_price");
    sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  };

  const onNavigateCategory = (slug: string | null) => {
    if (categorySlug) {
      router.push(slug ? `/category/${slug}` : "/shop");
      return;
    }
    setParam("category", slug);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFiltersOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filterProps = {
    categories,
    catParam,
    categorySlug,
    color,
    colors,
    priceMin,
    priceMax,
    setPriceMin,
    setPriceMax,
    stock,
    onSale,
    setParam,
    applyPrice,
    onNavigateCategory,
  };

  return (
    <div>
      {bannerImage && (
        <div
          className="relative -mx-3 flex h-44 items-end bg-cover bg-center sm:-mx-4 md:h-56 lg:-mx-5"
          style={{ backgroundImage: `url(${bannerImage})` }}
        >
          <div className="absolute inset-0 bg-ink/40" />
          <div className="relative z-10 px-3 pb-8 sm:px-4 lg:px-5">
            <h1 className="font-display text-4xl font-light text-cream md:text-5xl">
              {title}
            </h1>
          </div>
        </div>
      )}

      <div className="py-8 md:py-12">
        {!bannerImage && (
          <div className="mb-8 md:mb-10">
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: title },
              ]}
              className="mb-4"
            />
            <h1 className="section-heading">{title}</h1>
            {description && (
              <p className="section-subheading">{description}</p>
            )}
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            className="btn-outline gap-2 px-5 py-2.5 text-xs lg:hidden"
            onClick={() => setFiltersOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
          <p className="hidden text-sm text-ink-muted lg:block">
            {data
              ? `${color && products.length !== data.data.length ? products.length : data.total} ${
                  (color ? products.length : data.total) === 1
                    ? "piece"
                    : "pieces"
                }`
              : "…"}
          </p>
          <select
            className="input-field w-auto py-2 text-sm"
            value={`${orderby}-${order}`}
            onChange={(e) => {
              const [ob, o] = e.target.value.split("-");
              const sp = new URLSearchParams(searchParams.toString());
              sp.set("orderby", ob);
              sp.set("order", o);
              sp.delete("page");
              router.push(`${pathname}?${sp.toString()}`);
            }}
            aria-label="Sort products"
          >
            <option value="date-desc">Newest</option>
            <option value="popularity-desc">Best Selling</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Top Rated</option>
            <option value="title-asc">Name: A–Z</option>
          </select>
        </div>

        <p className="mb-4 text-sm text-ink-muted lg:hidden">
          {data
            ? `${color && products.length !== data.data.length ? products.length : data.total} pieces`
            : "…"}
        </p>

        <ProductGrid products={products} isLoading={isLoading && !data} />

        {data && (
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={(p) => setParam("page", String(p))}
          />
        )}
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-ink/40 backdrop-blur-sm lg:hidden"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-[56] w-full max-w-sm overflow-y-auto bg-cream p-6 shadow-lift dark:bg-brand-950 lg:hidden"
            >
              <FiltersPanel
                {...filterProps}
                onClose={() => setFiltersOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
