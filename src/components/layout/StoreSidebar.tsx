"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Flower2,
  Shirt,
  Baby,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useCategories } from "@/hooks/useWooCommerce";
import { cn } from "@/lib/utils";
import type { WooCategory } from "@/types/woocommerce";

const CAT_META: {
  label: string;
  match: string[];
  icon: typeof Shirt;
}[] = [
  { label: "Women", match: ["women", "womens", "woman", "saree"], icon: Flower2 },
  { label: "Men", match: ["men", "mens", "man", "kurta"], icon: Shirt },
  { label: "Kids", match: ["kids", "kid", "children", "child"], icon: Baby },
  {
    label: "Handicrafts",
    match: ["handicrafts", "handicraft", "craft"],
    icon: Sparkles,
  },
];

function resolveCat(
  categories: WooCategory[] | undefined,
  match: string[]
): WooCategory | undefined {
  if (!categories?.length) return undefined;
  return categories.find((c) => {
    const slug = c.slug.toLowerCase();
    const name = c.name.toLowerCase();
    return match.some(
      (m) => slug === m || slug.includes(m) || name.includes(m)
    );
  });
}

const SORTS = [
  { label: "Newest", value: "date" },
  { label: "Popularity", value: "popularity" },
  { label: "Best Sellers", value: "rating" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
];

export function StoreSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: categories } = useCategories(0);

  const activeSlug = pathname.startsWith("/category/")
    ? pathname.split("/")[2]
    : searchParams.get("category");

  const setShopParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    const q = params.toString();
    router.push(q ? `/shop?${q}` : "/shop");
  };

  const orderby = searchParams.get("orderby") || "date";
  const order = searchParams.get("order") || "desc";
  const stock = searchParams.get("stock_status");
  const onSale = searchParams.get("on_sale") === "true";
  const [priceMin, setPriceMin] = useState(searchParams.get("min_price") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("max_price") || "");

  const currentSort =
    orderby === "price" && order === "asc"
      ? "price-asc"
      : orderby === "price" && order === "desc"
        ? "price-desc"
        : orderby;

  const applyPrice = () => {
    const p = new URLSearchParams(searchParams.toString());
    if (priceMin) p.set("min_price", priceMin);
    else p.delete("min_price");
    if (priceMax) p.set("max_price", priceMax);
    else p.delete("max_price");
    p.delete("page");
    router.push(`/shop?${p.toString()}`);
  };

  return (
    <aside
      className={cn(
        "flex h-fit flex-col gap-8 rounded-none border-r border-brand-200/70 bg-cream/40 py-6 pr-5 dark:border-brand-800 dark:bg-brand-950/40",
        className
      )}
    >
      <div>
        <h2 className="mb-4 font-display text-xl font-light tracking-wide text-[var(--cms-primary,#1E3A8A)]">
          Categories
        </h2>
        <nav className="space-y-1" aria-label="Product categories">
          {CAT_META.map((item) => {
            const cat = resolveCat(categories, item.match);
            const href = cat
              ? `/category/${cat.slug}`
              : `/shop?search=${encodeURIComponent(item.label)}`;
            const active =
              (cat && activeSlug === cat.slug) ||
              searchParams.get("search")?.toLowerCase() ===
                item.label.toLowerCase();
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm tracking-wide transition-all duration-300",
                  active
                    ? "bg-[var(--cms-primary,#1E3A8A)] text-cream shadow-sm"
                    : "text-ink-soft hover:bg-brand-100/80 dark:text-brand-200 dark:hover:bg-brand-900"
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" strokeWidth={1.5} />
                <span className="flex-1 font-medium">{item.label}</span>
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 opacity-0 transition group-hover:opacity-60",
                    active && "opacity-70"
                  )}
                />
              </Link>
            );
          })}
          {(categories || [])
            .filter(
              (c) =>
                !CAT_META.some((m) =>
                  m.match.some(
                    (x) =>
                      c.slug.includes(x) || c.name.toLowerCase().includes(x)
                  )
                )
            )
            .slice(0, 6)
            .map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  activeSlug === c.slug
                    ? "bg-[var(--cms-primary,#1E3A8A)] text-cream"
                    : "text-ink-muted hover:bg-brand-100/80 dark:hover:bg-brand-900"
                )}
              >
                <span className="flex-1 truncate">{c.name}</span>
              </Link>
            ))}
        </nav>
      </div>

      <div>
        <h2 className="mb-4 font-display text-xl font-light tracking-wide text-[var(--cms-primary,#1E3A8A)]">
          Filters
        </h2>
        <div className="space-y-5 text-sm">
          <div>
            <p className="mb-2 text-[10px] font-medium tracking-[0.2em] uppercase text-ink-muted">
              Price
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-full rounded-lg border border-brand-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-[var(--cms-primary,#1E3A8A)] dark:border-brand-700 dark:bg-brand-900"
                aria-label="Minimum price"
              />
              <span className="text-ink-muted">–</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-full rounded-lg border border-brand-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-[var(--cms-primary,#1E3A8A)] dark:border-brand-700 dark:bg-brand-900"
                aria-label="Maximum price"
              />
            </div>
            <button
              type="button"
              onClick={applyPrice}
              className="mt-2 text-[11px] font-medium tracking-[0.12em] uppercase text-[var(--cms-primary,#1E3A8A)]"
            >
              Apply
            </button>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-medium tracking-[0.2em] uppercase text-ink-muted">
              Availability
            </p>
            <label className="flex cursor-pointer items-center gap-2 py-1">
              <input
                type="checkbox"
                checked={stock === "instock"}
                onChange={(e) =>
                  setShopParam("stock_status", e.target.checked ? "instock" : null)
                }
                className="accent-[var(--cms-primary,#1E3A8A)]"
              />
              In stock
            </label>
            <label className="flex cursor-pointer items-center gap-2 py-1">
              <input
                type="checkbox"
                checked={onSale}
                onChange={(e) =>
                  setShopParam("on_sale", e.target.checked ? "true" : null)
                }
                className="accent-[var(--cms-primary,#1E3A8A)]"
              />
              On sale / Discount
            </label>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-medium tracking-[0.2em] uppercase text-ink-muted">
              Color
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["Red", "Blue", "Green", "Gold", "Ivory", "Black", "Pink", "Maroon"].map(
                (c) => {
                  const active = searchParams.get("color") === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        setShopParam("color", active ? null : c)
                      }
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] transition",
                        active
                          ? "bg-[var(--cms-primary,#1E3A8A)] text-cream"
                          : "bg-brand-100 text-ink-muted hover:bg-brand-200 dark:bg-brand-900"
                      )}
                    >
                      {c}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-medium tracking-[0.2em] uppercase text-ink-muted">
              Size
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["XS", "S", "M", "L", "XL", "Free"].map((sz) => {
                const active = searchParams.get("size") === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setShopParam("size", active ? null : sz)}
                    className={cn(
                      "min-w-8 rounded-lg px-2 py-1 text-[11px] transition",
                      active
                        ? "bg-[var(--cms-primary,#1E3A8A)] text-cream"
                        : "bg-brand-100 text-ink-muted hover:bg-brand-200 dark:bg-brand-900"
                    )}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-medium tracking-[0.2em] uppercase text-ink-muted">
              Material
            </p>
            <ul className="space-y-1">
              {["Silk", "Cotton", "Linen", "Wool", "Handloom"].map((m) => {
                const active = searchParams.get("material") === m;
                return (
                  <li key={m}>
                    <button
                      type="button"
                      className={cn(
                        "w-full rounded-lg px-2 py-1.5 text-left transition",
                        active
                          ? "bg-brand-100 font-medium text-[var(--cms-primary,#1E3A8A)] dark:bg-brand-900"
                          : "text-ink-muted hover:bg-brand-50 dark:hover:bg-brand-900/60"
                      )}
                      onClick={() =>
                        setShopParam("material", active ? null : m)
                      }
                    >
                      {m}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-medium tracking-[0.2em] uppercase text-ink-muted">
              Sort
            </p>
            <ul className="space-y-1">
              {SORTS.map((s) => (
                <li key={s.value}>
                  <button
                    type="button"
                    className={cn(
                      "w-full rounded-lg px-2 py-1.5 text-left transition",
                      currentSort === s.value
                        ? "bg-brand-100 font-medium text-[var(--cms-primary,#1E3A8A)] dark:bg-brand-900"
                        : "text-ink-muted hover:bg-brand-50 dark:hover:bg-brand-900/60"
                    )}
                    onClick={() => {
                      if (s.value === "price-asc") {
                        const p = new URLSearchParams(searchParams.toString());
                        p.set("orderby", "price");
                        p.set("order", "asc");
                        router.push(`/shop?${p.toString()}`);
                      } else if (s.value === "price-desc") {
                        const p = new URLSearchParams(searchParams.toString());
                        p.set("orderby", "price");
                        p.set("order", "desc");
                        router.push(`/shop?${p.toString()}`);
                      } else {
                        const p = new URLSearchParams(searchParams.toString());
                        p.set("orderby", s.value);
                        p.delete("order");
                        router.push(`/shop?${p.toString()}`);
                      }
                    }}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/shop"
            className="inline-block text-xs tracking-[0.15em] uppercase text-[var(--cms-primary,#1E3A8A)] transition hover:opacity-70"
          >
            View all products
          </Link>
        </div>
      </div>
    </aside>
  );
}
