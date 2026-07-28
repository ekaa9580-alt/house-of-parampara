"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore, useWishlistStore, useAuthStore } from "@/store";
import { useCart, useSiteSettings, useCategories } from "@/hooks/useWooCommerce";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { HeaderSearch } from "./HeaderSearch";
import { AnnouncementBar } from "@/components/cms/BrandTheme";
import { SafeImage } from "@/components/ui/SafeImage";
import { safeImageSrc } from "@/lib/utils";
import { buildCategoryTree } from "@/lib/category-tree";

export function BrandMark({
  compact,
  stacked,
}: {
  compact?: boolean;
  /** Allow 2-line brand on narrow headers */
  stacked?: boolean;
}) {
  const { data: settings } = useSiteSettings();
  const logo = settings?.logo;
  const display = "HOUSE OF PARAMPARA";

  return (
    <Link
      href="/"
      className="group flex min-w-0 items-center gap-3 sm:gap-4"
      aria-label={display}
    >
      <span
        className={cn(
          "relative shrink-0 overflow-hidden bg-transparent transition-[height,width] duration-300",
          compact
            ? "h-14 w-14 sm:h-[4.25rem] sm:w-[4.25rem]"
            : "h-[4.25rem] w-[4.25rem] sm:h-20 sm:w-20 md:h-[5.25rem] md:w-[5.25rem]"
        )}
      >
        {safeImageSrc(logo) ? (
          <SafeImage
            src={logo}
            alt=""
            width={84}
            height={84}
            className="h-full w-full object-contain"
            priority
          />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center font-display text-2xl font-bold text-[#1E3A8A]"
            aria-hidden
          >
            H
          </span>
        )}
      </span>
      <span
        className={cn(
          "min-w-0 font-display font-bold tracking-[0.04em] text-[#1E3A8A] transition-opacity duration-300 group-hover:opacity-85",
          stacked
            ? "text-lg leading-[1.15] sm:whitespace-nowrap sm:text-2xl sm:leading-none md:text-[1.9rem] lg:text-[2.15rem]"
            : compact
              ? "whitespace-nowrap text-xl leading-none sm:text-2xl"
              : "whitespace-nowrap text-2xl leading-none md:text-[2rem] lg:text-[2.25rem]"
        )}
      >
        {stacked ? (
          <>
            <span className="block sm:inline">HOUSE OF </span>
            <span className="block sm:inline">PARAMPARA</span>
          </>
        ) : (
          display
        )}
      </span>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const {
    isMobileMenuOpen,
    setMobileMenuOpen,
    setCartDrawerOpen,
  } = useUIStore();
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const isAuth = useAuthStore((s) => s.isAuthenticated());
  const { data: cart } = useCart();
  const { data: categories } = useCategories();
  const categoryTree = useMemo(
    () => buildCategoryTree(categories || []),
    [categories]
  );

  useEffect(() => setMounted(true), []);
  useBodyScrollLock(isMobileMenuOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  const iconBtn =
    "relative shrink-0 rounded-full p-2 text-ink transition hover:bg-brand-100/80 hover:text-[var(--cms-primary,#7A3E1D)] dark:text-cream dark:hover:bg-brand-900 sm:p-2.5";

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-brand-200/60 bg-cream/95 backdrop-blur-xl transition-all duration-300 dark:border-brand-800 dark:bg-brand-950/95",
          scrolled ? "shadow-sm" : "shadow-none"
        )}
      >
        <AnnouncementBar />
        <div
          className={cn(
            "mx-auto w-full max-w-[90rem] px-3 sm:px-4 lg:px-5",
            scrolled ? "py-2 lg:py-2.5" : "py-2.5 sm:py-3 lg:py-3.5"
          )}
        >
          {/* Row 1: brand + icons; search only from lg to avoid overlap */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                className="shrink-0 rounded-full p-2 lg:hidden"
                aria-label="Open menu"
                aria-expanded={isMobileMenuOpen}
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" strokeWidth={1.5} />
              </button>
              <BrandMark compact={scrolled} stacked />
            </div>

            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
              <div className="ml-2 hidden w-[min(36vw,22rem)] lg:block xl:ml-4 xl:w-[26rem]">
                <Suspense fallback={<div className="h-10 w-full rounded-full bg-brand-100" />}>
                  <HeaderSearch
                    instanceId="header-search-desktop"
                    className="w-full max-w-none"
                  />
                </Suspense>
              </div>
              <Link href="/wishlist" aria-label="Wishlist" className={iconBtn}>
                <Heart className="h-6 w-6" strokeWidth={1.5} />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--cms-primary,#7A3E1D)] px-1 text-[9px] font-medium text-cream">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <button
                type="button"
                aria-label="Bag"
                onClick={() => setCartDrawerOpen(true)}
                className={iconBtn}
              >
                <ShoppingBag className="h-6 w-6" strokeWidth={1.5} />
                {(cart?.items_count ?? 0) > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--cms-primary,#7A3E1D)] px-1 text-[9px] font-medium text-cream">
                    {cart?.items_count}
                  </span>
                )}
              </button>
              <Link
                href={mounted && isAuth ? "/my-account" : "/login"}
                aria-label="Account"
                className={iconBtn}
              >
                <User className="h-6 w-6" strokeWidth={1.5} />
              </Link>
            </div>
          </div>

          {/* Search below brand until lg — no overlap */}
          <div className="mt-2 lg:hidden">
            <Suspense fallback={<div className="h-10 w-full rounded-full bg-brand-100" />}>
              <HeaderSearch
                instanceId="header-search-mobile"
                className="w-full max-w-none"
              />
            </Suspense>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-[70] flex w-[min(88vw,320px)] flex-col bg-cream shadow-lift dark:bg-brand-950 lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
            >
              <div className="flex items-center justify-between gap-2 border-b border-brand-200 px-4 py-4 dark:border-brand-800">
                <div className="min-w-0 flex-1 overflow-hidden">
                  <BrandMark compact stacked />
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  className="shrink-0 rounded-full p-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="border-b border-brand-200 px-4 py-3 dark:border-brand-800">
                <Suspense fallback={null}>
                  <HeaderSearch instanceId="header-search-drawer" />
                </Suspense>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-4">
                <p className="mb-2 px-2 text-[10px] font-bold tracking-[0.2em] uppercase text-ink-muted">
                  Categories
                </p>
                {categoryTree.map((c) => (
                  <div key={c.id} className="mb-1">
                    <Link
                      href={`/category/${c.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-xl px-3 py-2.5 text-lg font-medium transition hover:bg-brand-100 dark:hover:bg-brand-900"
                    >
                      {c.name}
                    </Link>
                    {c.children.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/category/${sub.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="ml-3 block rounded-lg px-3 py-1.5 text-base text-ink-soft transition hover:bg-brand-100 hover:text-ink dark:hover:bg-brand-900"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                ))}
                <div className="my-4 border-t border-brand-200 dark:border-brand-800" />
                {[
                  { href: "/", label: "Home" },
                  { href: "/shop", label: "Shop" },
                  { href: "/about", label: "About" },
                  { href: "/contact", label: "Contact" },
                  { href: "/faq", label: "FAQ" },
                  { href: "/wishlist", label: "Wishlist" },
                  { href: "/cart", label: "Bag" },
                  {
                    href: mounted && isAuth ? "/my-account" : "/login",
                    label: mounted && isAuth ? "Account" : "Login",
                  },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-xl px-3 py-3 text-base transition hover:bg-brand-100 dark:hover:bg-brand-900"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
