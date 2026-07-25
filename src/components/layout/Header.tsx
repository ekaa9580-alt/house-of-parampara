"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useUIStore, useWishlistStore, useAuthStore } from "@/store";
import { useCart, useCategories } from "@/hooks/useWooCommerce";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { MegaMenu } from "./MegaMenu";
import { SearchOverlay } from "./SearchOverlay";
import { BrandLink } from "./WhatsAppButton";
import type { WooCategory } from "@/types/woocommerce";

const NAV_LINK =
  "shrink-0 whitespace-nowrap text-[12px] font-medium tracking-[0.12em] uppercase transition-opacity hover:opacity-70 xl:text-[13px] xl:tracking-[0.14em]";

const PRIMARY_CATS = [
  { label: "Women", match: ["women", "womens", "woman"] },
  { label: "Men", match: ["men", "mens", "man"] },
  { label: "Kids", match: ["kids", "kid", "children", "child"] },
  { label: "Handicrafts", match: ["handicrafts", "handicraft"] },
] as const;

function resolveCategory(
  categories: WooCategory[] | undefined,
  match: readonly string[]
): WooCategory | undefined {
  if (!categories?.length) return undefined;
  return categories.find((c) => {
    const slug = c.slug.toLowerCase();
    const name = c.name.toLowerCase();
    return match.some(
      (m) => slug === m || slug.includes(m) || name === m || name.includes(m)
    );
  });
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const {
    isMobileMenuOpen,
    setMobileMenuOpen,
    setSearchOpen,
    setCartDrawerOpen,
    isMegaMenuOpen,
    setMegaMenuOpen,
  } = useUIStore();
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const isAuth = useAuthStore((s) => s.isAuthenticated());
  const { data: cart } = useCart();
  const { data: categories } = useCategories(0);

  const isHome = pathname === "/";

  const navCategories = useMemo(
    () =>
      PRIMARY_CATS.map((item) => {
        const cat = resolveCategory(categories, item.match);
        return {
          label: item.label,
          href: cat
            ? `/category/${cat.slug}`
            : `/shop?search=${encodeURIComponent(item.label)}`,
        };
      }),
    [categories]
  );

  useEffect(() => setMounted(true), []);

  useBodyScrollLock(isMobileMenuOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  }, [pathname, setMobileMenuOpen, setMegaMenuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setMegaMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setMobileMenuOpen, setMegaMenuOpen]);

  const transparent = isHome && !scrolled && !isMegaMenuOpen;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          transparent
            ? "bg-transparent text-cream"
            : "glass text-ink dark:text-cream"
        )}
      >
        {/* 3-column on desktop: logo | centered nav | actions — 2-column on mobile */}
        <div className="container-luxury grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:h-[4.75rem] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-6">
          {/* Left: menu (mobile) + logo */}
          <div className="flex min-w-0 items-center gap-3 justify-self-start">
            <button
              type="button"
              className="shrink-0 lg:hidden"
              aria-label="Menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <BrandLink
              light={transparent}
              className="min-w-0 max-w-[min(52vw,200px)] sm:max-w-[220px] lg:max-w-[240px]"
            />
          </div>

          {/* Center: navigation (desktop only) */}
          <nav className="hidden min-w-0 max-w-full items-center justify-center gap-3 justify-self-center overflow-x-auto xl:gap-5 2xl:gap-7 lg:flex">
            <Link href="/" className={NAV_LINK}>
              Home
            </Link>
            {navCategories.map((item) => (
              <Link key={item.label} href={item.href} className={NAV_LINK}>
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              className={NAV_LINK}
              aria-expanded={isMegaMenuOpen}
              onMouseEnter={() => setMegaMenuOpen(true)}
              onClick={() => setMegaMenuOpen(!isMegaMenuOpen)}
            >
              Shop
            </button>
            <Link href="/about" className={NAV_LINK}>
              About
            </Link>
            <Link href="/contact" className={NAV_LINK}>
              Contact
            </Link>
          </nav>

          {/* Right: icons */}
          <div className="flex shrink-0 items-center justify-end gap-2.5 justify-self-end sm:gap-3 md:gap-4 lg:col-start-3">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="transition-opacity hover:opacity-70"
            >
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </button>

            {mounted && (
              <button
                type="button"
                aria-label="Toggle theme"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="hidden transition-opacity hover:opacity-70 md:block"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" strokeWidth={1.5} />
                ) : (
                  <Moon className="h-5 w-5" strokeWidth={1.5} />
                )}
              </button>
            )}

            {mounted && (
              <Link
                href={isAuth ? "/my-account" : "/login"}
                aria-label="Account"
                className="hidden transition-opacity hover:opacity-70 sm:block"
              >
                <User className="h-5 w-5" strokeWidth={1.5} />
              </Link>
            )}

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative transition-opacity hover:opacity-70"
            >
              <Heart className="h-5 w-5" strokeWidth={1.5} />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-medium text-ink">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              aria-label="Cart"
              onClick={() => setCartDrawerOpen(true)}
              className="relative transition-opacity hover:opacity-70"
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              {(cart?.items_count ?? 0) > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-medium text-ink">
                  {cart?.items_count}
                </span>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMegaMenuOpen && categories && (
            <MegaMenu
              categories={categories}
              onClose={() => setMegaMenuOpen(false)}
            />
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 overflow-y-auto bg-cream pt-20 dark:bg-brand-950 lg:hidden"
          >
            <nav className="container-luxury flex flex-col gap-5 py-8">
              <Link
                href="/"
                className="font-display text-[1.75rem] font-light tracking-wide"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              {navCategories.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="font-display text-[1.75rem] font-light tracking-wide text-ink-soft dark:text-brand-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/shop"
                className="font-display text-[1.75rem] font-light tracking-wide"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <div className="mt-4 space-y-4 border-t border-brand-200 pt-6 text-base tracking-wide dark:border-brand-800">
                <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
                  About
                </Link>
                <br />
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                  Contact
                </Link>
                <br />
                <Link
                  href={mounted && isAuth ? "/my-account" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {mounted && isAuth ? "My Account" : "Login"}
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay />
    </>
  );
}
