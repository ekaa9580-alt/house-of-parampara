"use client";

import { useEffect, useState, Suspense } from "react";
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
import { useCart, useSiteSettings } from "@/hooks/useWooCommerce";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { HeaderSearch } from "./HeaderSearch";
import { AnnouncementBar } from "@/components/cms/BrandTheme";
import { SafeImage } from "@/components/ui/SafeImage";
import { safeImageSrc } from "@/lib/utils";
import { STORE_CATEGORIES } from "@/lib/store-categories";

const DRAWER_CATS = STORE_CATEGORIES.map((c) => ({
  label: c.label,
  href: c.href,
  icon: c.icon,
}));

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
  // Always show clean brand text (CMS may prepend emoji)
  const display = "HOUSE OF PARAMPARA";

  return (
    <Link
      href="/"
      className="group flex min-w-0 items-center gap-3 sm:gap-3.5"
      aria-label={display}
    >
      <span
        className={cn(
          "relative shrink-0 overflow-hidden bg-transparent transition-[height,width] duration-300",
          compact
            ? "h-14 w-14 sm:h-16 sm:w-16"
            : "h-16 w-16 sm:h-[4.75rem] sm:w-[4.75rem] md:h-20 md:w-20"
        )}
      >
        {safeImageSrc(logo) ? (
          <SafeImage
            src={logo}
            alt=""
            width={80}
            height={80}
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
          "ml-0.5 font-display font-bold tracking-[0.04em] text-[#1E3A8A] transition-opacity duration-300 group-hover:opacity-85 sm:ml-1",
          stacked
            ? "max-w-[11rem] text-lg leading-[1.1] sm:max-w-none sm:whitespace-nowrap sm:text-2xl sm:leading-none md:text-[1.85rem] lg:text-[2.15rem]"
            : compact
              ? "whitespace-nowrap text-xl leading-none sm:text-2xl"
              : "whitespace-nowrap text-2xl leading-none md:text-[1.95rem] lg:text-[2.2rem]"
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
          {/* Row 1: brand + actions (search sits beside icons from md up) */}
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
              <div className="hidden w-[min(42vw,20rem)] md:block lg:w-[22rem] xl:w-[26rem]">
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

          {/* Row 2 (mobile only): full-width search — no overlap with brand/icons */}
          <div className="mt-2 md:hidden">
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
                <p className="mb-2 px-2 text-[10px] font-medium tracking-[0.2em] uppercase text-ink-muted">
                  Categories
                </p>
                {DRAWER_CATS.map((c) => (
                  <Link
                    key={c.label}
                    href={c.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-lg transition hover:bg-brand-100 dark:hover:bg-brand-900"
                  >
                    <c.icon className="h-6 w-6 text-[var(--cms-primary,#7A3E1D)]" strokeWidth={1.5} />
                    {c.label}
                  </Link>
                ))}
                <div className="my-4 border-t border-brand-200 dark:border-brand-800" />
                {[
                  { href: "/about", label: "About" },
                  { href: "/contact", label: "Contact" },
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
