"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useWooCommerce";
import { buildCategoryTree } from "@/lib/category-tree";

const PAGE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

/** Centered display-font nav — page links + live WC parent categories */
export function SiteNav() {
  const pathname = usePathname();
  const { data: categories } = useCategories();
  const parents = useMemo(
    () => buildCategoryTree(categories || []),
    [categories]
  );

  const links = useMemo(() => {
    const catLinks = parents.map((c) => ({
      href: `/category/${c.slug}`,
      label: c.name,
      slug: c.slug,
      childSlugs: c.children.map((ch) => ch.slug),
    }));
    return [
      { ...PAGE_LINKS[0], slug: null as string | null, childSlugs: [] as string[] },
      { ...PAGE_LINKS[1], slug: null, childSlugs: [] },
      ...catLinks,
      ...PAGE_LINKS.slice(2).map((l) => ({
        ...l,
        slug: null as string | null,
        childSlugs: [] as string[],
      })),
    ];
  }, [parents]);

  return (
    <nav
      aria-label="Primary"
      className="border-b border-brand-200/80 bg-cream dark:border-brand-800 dark:bg-brand-950"
    >
      <div className="mx-auto flex w-full max-w-[90rem] justify-center overflow-x-auto px-3 py-3 sm:px-4 lg:px-5">
        <ul className="flex min-w-min items-center justify-center gap-5 sm:gap-7 md:gap-9">
          {links.map((item) => {
            const isCategory = Boolean(item.slug);
            const active = isCategory
              ? pathname === item.href ||
                item.childSlugs.some((s) => pathname === `/category/${s}`)
              : item.href === "/"
                ? pathname === "/"
                : item.href === "/shop"
                  ? pathname.startsWith("/shop")
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

            return (
              <li key={`${item.label}-${item.href}`}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative whitespace-nowrap font-display text-base font-bold tracking-[0.06em] transition sm:text-lg md:text-xl",
                    active
                      ? "text-[var(--cms-primary,#7A3E1D)] after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:bg-[var(--cms-primary,#7A3E1D)]"
                      : "text-ink/80 hover:text-[var(--cms-primary,#7A3E1D)] dark:text-cream/80 dark:hover:text-cream"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
