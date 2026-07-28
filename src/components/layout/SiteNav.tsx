"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { STORE_CATEGORIES } from "@/lib/store-categories";

const PAGE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  ...STORE_CATEGORIES.map((c) => ({ href: c.href, label: c.label })),
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

/** Centered display-font nav under header — on every page */
export function SiteNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = (searchParams.get("search") || "").toLowerCase();

  return (
    <nav
      aria-label="Primary"
      className="border-b border-brand-200/80 bg-cream dark:border-brand-800 dark:bg-brand-950"
    >
      <div className="mx-auto flex w-full max-w-[90rem] justify-center overflow-x-auto px-3 py-3 sm:px-4 lg:px-5">
        <ul className="flex min-w-min items-center justify-center gap-5 sm:gap-7 md:gap-9">
          {PAGE_LINKS.map((item) => {
            const labelLower = item.label.toLowerCase();
            const isCategory = STORE_CATEGORIES.some(
              (c) => c.label === item.label
            );
            const active = isCategory
              ? search === labelLower ||
                (pathname.startsWith("/category/") &&
                  pathname.toLowerCase().includes(labelLower))
              : item.href === "/"
                ? pathname === "/"
                : item.href === "/shop"
                  ? pathname.startsWith("/shop") && !search
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
