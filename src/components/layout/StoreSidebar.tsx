"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useCategories } from "@/hooks/useWooCommerce";
import { cn } from "@/lib/utils";
import { STORE_CATEGORIES } from "@/lib/store-categories";
import type { WooCategory } from "@/types/woocommerce";

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

function subHref(
  categories: WooCategory[] | undefined,
  match: string[] | undefined,
  search: string
): string {
  const cat = match ? resolveCat(categories, match) : undefined;
  if (cat) return `/category/${cat.slug}`;
  return `/shop?search=${encodeURIComponent(search)}`;
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
  const [open, setOpen] = useState<Record<string, boolean>>({
    Women: true,
    Men: true,
  });

  const activeSlug = pathname.startsWith("/category/")
    ? pathname.split("/")[2]
    : searchParams.get("category");
  const activeSearch = (searchParams.get("search") || "").toLowerCase();

  const filterPath =
    pathname.startsWith("/shop") || pathname.startsWith("/category/")
      ? pathname
      : "/shop";

  const pushFilterParams = (params: URLSearchParams) => {
    params.delete("page");
    const q = params.toString();
    router.push(q ? `${filterPath}?${q}` : filterPath);
  };

  const setShopParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    pushFilterParams(params);
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
    pushFilterParams(p);
  };

  return (
    <aside
      className={cn(
        "flex h-fit flex-col gap-7 rounded-none border-r border-brand-200/70 bg-cream/40 py-5 pr-4 dark:border-brand-800 dark:bg-brand-950/40",
        className
      )}
    >
      <div>
        <h2 className="panel-heading mb-3.5 text-xl md:text-[1.35rem]">
          Categories
        </h2>
        <nav className="space-y-1" aria-label="Product categories">
          {STORE_CATEGORIES.map((item) => {
            const cat = resolveCat(categories, item.match);
            const href = cat ? `/category/${cat.slug}` : item.href;
            const active =
              (cat && activeSlug === cat.slug) ||
              activeSearch === item.label.toLowerCase();
            const Icon = item.icon;
            const hasChildren = item.children.length > 0;
            const isOpen = open[item.label] ?? false;

            return (
              <div key={item.label}>
                <div className="flex items-center gap-0.5">
                  <Link
                    href={href}
                    className={cn(
                      "group flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm tracking-wide transition-all duration-300 md:text-base",
                      active
                        ? "bg-[var(--cms-primary,#7A3E1D)] text-cream shadow-sm"
                        : "text-ink hover:bg-brand-100/80 dark:text-brand-200 dark:hover:bg-brand-900"
                    )}
                  >
                    <Icon
                      className="h-5 w-5 shrink-0 opacity-90"
                      strokeWidth={1.5}
                    />
                    <span className="flex-1 font-medium">{item.label}</span>
                  </Link>
                  {hasChildren ? (
                    <button
                      type="button"
                      aria-label={`${isOpen ? "Collapse" : "Expand"} ${item.label}`}
                      aria-expanded={isOpen}
                      onClick={() =>
                        setOpen((s) => ({ ...s, [item.label]: !isOpen }))
                      }
                      className="rounded-lg p-2 text-ink-soft transition hover:bg-brand-100 hover:text-ink"
                    >
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>
                  ) : null}
                </div>

                {hasChildren && isOpen && (
                  <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-brand-200/80 pl-3 dark:border-brand-700">
                    {item.children.map((sub) => {
                      const subLink = subHref(
                        categories,
                        sub.match,
                        sub.search
                      );
                      const subActive =
                        activeSearch === sub.search.toLowerCase() ||
                        (activeSlug &&
                          sub.match?.some(
                            (m) =>
                              activeSlug.includes(m.replace(/\s+/g, "-")) ||
                              activeSlug === m
                          ));
                      return (
                        <li key={sub.label}>
                          <Link
                            href={subLink}
                            className={cn(
                              "block rounded-lg px-2.5 py-1.5 text-[13px] transition md:text-sm",
                              subActive
                                ? "font-semibold text-[var(--cms-primary,#7A3E1D)]"
                                : "text-ink-soft hover:text-ink dark:hover:text-cream"
                            )}
                          >
                            {sub.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div>
        <h2 className="panel-heading mb-3.5 text-xl md:text-[1.35rem]">
          Filters
        </h2>
        <div className="space-y-5 text-sm md:text-base">
          <div>
            <p className="mb-2 text-[11px] font-bold tracking-[0.2em] uppercase text-ink-soft">
              Price
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-full rounded-lg border border-brand-200 bg-white px-2.5 py-2 text-sm text-ink outline-none focus:border-[var(--cms-primary,#7A3E1D)] dark:border-brand-700 dark:bg-brand-900"
                aria-label="Minimum price"
              />
              <span className="text-ink-soft">–</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-full rounded-lg border border-brand-200 bg-white px-2.5 py-2 text-sm text-ink outline-none focus:border-[var(--cms-primary,#7A3E1D)] dark:border-brand-700 dark:bg-brand-900"
                aria-label="Maximum price"
              />
            </div>
            <button
              type="button"
              onClick={applyPrice}
              className="mt-3 w-full rounded-full bg-[var(--cms-primary,#7A3E1D)] px-4 py-2.5 text-sm font-medium tracking-[0.12em] uppercase text-cream shadow-sm transition hover:brightness-110"
            >
              Apply
            </button>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-bold tracking-[0.2em] uppercase text-ink-soft">
              Availability
            </p>
            <label className="flex cursor-pointer items-center gap-2 py-1">
              <input
                type="checkbox"
                checked={stock === "instock"}
                onChange={(e) =>
                  setShopParam(
                    "stock_status",
                    e.target.checked ? "instock" : null
                  )
                }
                className="accent-[var(--cms-primary,#7A3E1D)]"
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
                className="accent-[var(--cms-primary,#7A3E1D)]"
              />
              On sale / Discount
            </label>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-bold tracking-[0.2em] uppercase text-ink-soft">
              Color
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Red",
                "Blue",
                "Green",
                "Gold",
                "Ivory",
                "Black",
                "Pink",
                "Maroon",
              ].map((c) => {
                const active = searchParams.get("color") === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setShopParam("color", active ? null : c)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] transition",
                      active
                        ? "bg-[var(--cms-primary,#7A3E1D)] text-cream"
                        : "bg-brand-100 text-ink-muted hover:bg-brand-200 dark:bg-brand-900"
                    )}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-bold tracking-[0.2em] uppercase text-ink-soft">
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
                        ? "bg-[var(--cms-primary,#7A3E1D)] text-cream"
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
            <p className="mb-2 text-[11px] font-bold tracking-[0.2em] uppercase text-ink-soft">
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
                          ? "bg-brand-100 font-medium text-[var(--cms-primary,#7A3E1D)] dark:bg-brand-900"
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
            <p className="mb-2 text-[11px] font-bold tracking-[0.2em] uppercase text-ink-soft">
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
                        ? "bg-brand-100 font-medium text-[var(--cms-primary,#7A3E1D)] dark:bg-brand-900"
                        : "text-ink-muted hover:bg-brand-50 dark:hover:bg-brand-900/60"
                    )}
                    onClick={() => {
                      const p = new URLSearchParams(searchParams.toString());
                      if (s.value === "price-asc") {
                        p.set("orderby", "price");
                        p.set("order", "asc");
                      } else if (s.value === "price-desc") {
                        p.set("orderby", "price");
                        p.set("order", "desc");
                      } else {
                        p.set("orderby", s.value);
                        p.delete("order");
                      }
                      pushFilterParams(p);
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
            className="inline-block text-xs tracking-[0.15em] uppercase text-[var(--cms-primary,#7A3E1D)] transition hover:opacity-70"
          >
            View all products
          </Link>
        </div>
      </div>
    </aside>
  );
}
