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
  Flower2,
  Shirt,
  Baby,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore, useWishlistStore, useAuthStore } from "@/store";
import { useCart, useSiteSettings } from "@/hooks/useWooCommerce";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { HeaderSearch } from "./HeaderSearch";
import { AnnouncementBar } from "@/components/cms/BrandTheme";
import { SafeImage } from "@/components/ui/SafeImage";
import { safeImageSrc } from "@/lib/utils";

const DRAWER_CATS = [
  { label: "Women", href: "/shop?search=Women", icon: Flower2 },
  { label: "Men", href: "/shop?search=Men", icon: Shirt },
  { label: "Kids", href: "/shop?search=Kids", icon: Baby },
  { label: "Handicrafts", href: "/shop?search=Handicrafts", icon: Sparkles },
];

export function BrandMark({ compact }: { compact?: boolean }) {
  const { data: settings } = useSiteSettings();
  const logo = settings?.logo;
  const name = (settings?.site_name || "HOUSE OF PARAMPARA").toUpperCase();

  return (
    <Link
      href="/"
      className="group flex min-w-0 items-center gap-1.5 sm:gap-2"
      aria-label={name}
    >
      {safeImageSrc(logo) && (
        <SafeImage
          src={logo}
          alt=""
          width={56}
          height={56}
          className={cn(
            "shrink-0 object-contain transition-[height,width] duration-300",
            compact
              ? "h-11 w-11"
              : "h-11 w-11 sm:h-[50px] sm:w-[50px] lg:h-[52px] lg:w-[52px] xl:h-14 xl:w-14"
          )}
          priority
        />
      )}
      <span
        className={cn(
          "font-display font-medium leading-none tracking-[0.05em] text-[#1E3A8A] transition-opacity duration-300 group-hover:opacity-85",
          compact
            ? "text-xl sm:text-2xl lg:text-[28px]"
            : "text-xl sm:text-2xl md:text-[28px] lg:text-[30px] xl:text-[34px]",
          "whitespace-nowrap"
        )}
      >
        {name.includes("PARAMPARA") ? name : "HOUSE OF PARAMPARA"}
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
    "relative rounded-full p-2 text-ink transition hover:bg-brand-100/80 hover:text-[var(--cms-primary,#1E3A8A)] dark:text-cream dark:hover:bg-brand-900";

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
            "container-luxury grid grid-cols-[auto_1fr_auto] items-center gap-3 transition-all duration-300 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-6",
            scrolled ? "py-2.5 lg:py-3" : "py-3.5 lg:py-4"
          )}
        >
          {/* Left: menu + brand */}
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="shrink-0 rounded-full p-2 lg:hidden"
              aria-label="Open menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <BrandMark compact={scrolled} />
          </div>

          {/* Center: always-visible search */}
          <div className="hidden justify-center px-2 md:flex">
            <Suspense fallback={<div className="h-10 w-full max-w-xl rounded-full bg-brand-100" />}>
              <HeaderSearch />
            </Suspense>
          </div>

          {/* Right: Wishlist → Bag → Account */}
          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
            <div className="mr-1 w-[min(42vw,11rem)] md:hidden">
              <Suspense fallback={null}>
                <HeaderSearch />
              </Suspense>
            </div>
            <Link href="/wishlist" aria-label="Wishlist" className={iconBtn}>
              <Heart className="h-5 w-5" strokeWidth={1.5} />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--cms-primary,#1E3A8A)] px-1 text-[9px] font-medium text-cream">
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
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              {(cart?.items_count ?? 0) > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--cms-primary,#1E3A8A)] px-1 text-[9px] font-medium text-cream">
                  {cart?.items_count}
                </span>
              )}
            </button>
            <Link
              href={mounted && isAuth ? "/my-account" : "/login"}
              aria-label="Account"
              className={iconBtn}
            >
              <User className="h-5 w-5" strokeWidth={1.5} />
            </Link>
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
              <div className="flex items-center justify-between border-b border-brand-200 px-4 py-4 dark:border-brand-800">
                <BrandMark compact />
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="border-b border-brand-200 px-4 py-3 dark:border-brand-800">
                <Suspense fallback={null}>
                  <HeaderSearch />
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
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-base transition hover:bg-brand-100 dark:hover:bg-brand-900"
                  >
                    <c.icon className="h-4 w-4 text-[var(--cms-primary,#1E3A8A)]" strokeWidth={1.5} />
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
