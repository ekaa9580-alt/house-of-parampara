"use client";

import { useEffect, useState } from "react";
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
import { useCart, useCategories, useMenu, useSiteSettings } from "@/hooks/useWooCommerce";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { MegaMenu } from "./MegaMenu";
import { SearchOverlay } from "./SearchOverlay";
import { BrandLink } from "./WhatsAppButton";
import { AnnouncementBar } from "@/components/cms/BrandTheme";
import type { CmsMenuItem } from "@/types/woocommerce";

const NAV_LINK =
  "shrink-0 whitespace-nowrap text-[12px] font-medium tracking-[0.12em] uppercase transition-opacity hover:opacity-70 xl:text-[13px] xl:tracking-[0.14em]";

function MenuLinks({
  items,
  className,
  onNavigate,
  linkClassName,
}: {
  items: CmsMenuItem[];
  className?: string;
  onNavigate?: () => void;
  linkClassName?: string;
}) {
  return (
    <nav className={className}>
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.url || "/"}
          target={item.target || undefined}
          className={linkClassName || NAV_LINK}
          onClick={onNavigate}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
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
  const { data: menuItems = [] } = useMenu("primary");
  const { data: settings } = useSiteSettings();

  const isHome = pathname === "/";

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
  const iconBtn = "transition-opacity hover:opacity-70";

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
        <AnnouncementBar />
        <div className="container-luxury">
          <div className="flex min-h-14 items-center gap-3 py-3 sm:min-h-16 sm:gap-4 lg:min-h-[4.25rem]">
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

            <BrandLink light={transparent} className="min-w-0 flex-1" />

            <div className="flex shrink-0 items-center justify-end gap-2.5 sm:gap-3 md:gap-4">
              <button
                type="button"
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                className={iconBtn}
              >
                <Search className="h-5 w-5" strokeWidth={1.5} />
              </button>
              {mounted && (
                <button
                  type="button"
                  aria-label="Toggle theme"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className={cn(iconBtn, "hidden md:block")}
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
                  className={cn(iconBtn, "hidden sm:block")}
                >
                  <User className="h-5 w-5" strokeWidth={1.5} />
                </Link>
              )}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className={cn(iconBtn, "relative")}
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
                className={cn(iconBtn, "relative")}
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

          <div
            className={cn(
              "hidden items-center justify-center gap-4 border-t py-2.5 xl:gap-6 lg:flex",
              transparent
                ? "border-cream/20"
                : "border-brand-200/70 dark:border-brand-800"
            )}
          >
            <MenuLinks
              items={menuItems}
              className="flex flex-wrap items-center justify-center gap-4 xl:gap-6"
            />
            {categories && categories.length > 0 && (
              <button
                type="button"
                className={NAV_LINK}
                aria-expanded={isMegaMenuOpen}
                onMouseEnter={() => setMegaMenuOpen(true)}
                onClick={() => setMegaMenuOpen(!isMegaMenuOpen)}
              >
                {settings?.mega_menu_cta_label || settings?.home_categories_title || "Shop"}
              </button>
            )}
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
            className="fixed inset-0 z-40 overflow-y-auto bg-cream pt-28 dark:bg-brand-950 lg:hidden"
          >
            <MenuLinks
              items={menuItems}
              className="container-luxury flex flex-col gap-5 py-8"
              linkClassName="font-display text-[1.75rem] font-light tracking-wide"
              onNavigate={() => setMobileMenuOpen(false)}
            />
            <div className="container-luxury border-t border-brand-200 pt-6 dark:border-brand-800">
              <Link
                href={mounted && isAuth ? "/my-account" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base tracking-wide"
              >
                {mounted && isAuth ? "Account" : "Login"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay />
    </>
  );
}
