"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Heart, ShoppingBag } from "lucide-react";
import { useUIStore, useWishlistStore } from "@/store";
import { useAddToCart, useSiteSettings } from "@/hooks/useWooCommerce";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { formatPrice, stripHtml, isCatalogProduct } from "@/lib/utils";
import { Rating } from "@/components/ui/Rating";
import { SafeImage } from "@/components/ui/SafeImage";
import { clientApi } from "@/lib/api/client";
import type { WooProduct } from "@/types/woocommerce";

export function QuickView() {
  const { quickViewProductId, setQuickView } = useUIStore();
  const [product, setProduct] = useState<WooProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [mounted, setMounted] = useState(false);
  const addToCart = useAddToCart();
  const { data: settings } = useSiteSettings();
  const atcLabel = settings?.add_to_cart_label || "Add to Bag";
  const { toggle, has } = useWishlistStore();

  useEffect(() => setMounted(true), []);

  const open = !!quickViewProductId;
  useBodyScrollLock(open);

  useEffect(() => {
    if (!quickViewProductId) {
      setProduct(null);
      setNotFound(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    clientApi
      .get<WooProduct>(`/products/id/${quickViewProductId}`)
      .then((res) => {
        const p = res.data;
        if (p && isCatalogProduct(p)) {
          setProduct(p);
        } else {
          setProduct(null);
          setNotFound(true);
        }
      })
      .catch(() => {
        setProduct(null);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [quickViewProductId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQuickView(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setQuickView]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ink/50 backdrop-blur-sm"
            onClick={() => setQuickView(null)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Quick view"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-x-4 top-[10%] z-[61] mx-auto max-h-[80vh] max-w-3xl overflow-y-auto bg-cream shadow-lift dark:bg-brand-950 md:inset-x-auto"
          >
            <button
              type="button"
              aria-label="Close"
              className="absolute right-4 top-4 z-10"
              onClick={() => setQuickView(null)}
            >
              <X className="h-5 w-5" />
            </button>

            {loading && (
              <div className="p-12 text-center text-sm text-ink-muted">
                Loading…
              </div>
            )}

            {!loading && notFound && (
              <div className="p-12 text-center">
                <p className="text-sm text-ink-muted">Product not found</p>
                <button
                  type="button"
                  className="btn-outline mt-4"
                  onClick={() => setQuickView(null)}
                >
                  Close
                </button>
              </div>
            )}

            {product && (
              <div className="grid md:grid-cols-2">
                <div className="relative aspect-[3/4] bg-brand-100 dark:bg-brand-900">
                  <SafeImage
                    src={product.images?.[0]?.src}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                </div>
                <div className="flex flex-col p-6 md:p-8">
                  <h2 className="font-display text-2xl font-light">
                    {product.name}
                  </h2>
                  <Rating
                    rating={product.average_rating}
                    count={product.rating_count}
                    className="mt-2"
                  />
                  <div className="mt-4 flex items-baseline gap-2">
                    {product.on_sale && product.sale_price ? (
                      <>
                        <span className="text-lg font-medium">
                          {formatPrice(product.sale_price)}
                        </span>
                        <span className="text-ink-muted line-through">
                          {formatPrice(product.regular_price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-medium">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                    {stripHtml(product.short_description)}
                  </p>
                  <div className="mt-auto flex gap-3 pt-8">
                    <button
                      type="button"
                      className="btn-primary flex-1"
                      disabled={
                        product.stock_status === "outofstock" ||
                        product.type === "variable"
                      }
                      onClick={() => {
                        addToCart.mutate({
                          productId: product.id,
                          quantity: 1,
                        });
                        setQuickView(null);
                      }}
                    >
                      <ShoppingBag className="h-4 w-4" />
                      {product.type === "variable"
                        ? "Select Options"
                        : atcLabel}
                    </button>
                    <button
                      type="button"
                      aria-label="Wishlist"
                      className="btn-outline px-4"
                      onClick={() => toggle(product.id)}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          mounted && has(product.id) ? "fill-gold text-gold" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <Link
                    href={`/product/${product.slug}`}
                    onClick={() => setQuickView(null)}
                    className="link-underline mt-4 text-center text-xs tracking-[0.15em] uppercase"
                  >
                    View Full Details
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
