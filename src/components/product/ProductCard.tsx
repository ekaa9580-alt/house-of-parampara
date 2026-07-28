"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Eye, ShoppingBag } from "lucide-react";
import type { WooProduct } from "@/types/woocommerce";
import { formatPrice, getDiscountPercent, cn, safeImageSrc } from "@/lib/utils";
import { Rating } from "@/components/ui/Rating";
import { SafeImage } from "@/components/ui/SafeImage";
import { useWishlistStore, useUIStore } from "@/store";
import { useAddToCart } from "@/hooks/useWooCommerce";
import { useEffect, useState } from "react";

interface ProductCardProps {
  product: WooProduct;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toggle, has } = useWishlistStore();
  const setQuickView = useUIStore((s) => s.setQuickView);
  const addToCart = useAddToCart();
  const wished = mounted && has(product.id);

  useEffect(() => setMounted(true), []);

  const primarySrc = safeImageSrc(product.images?.[0]?.src);
  const hoverSrc = safeImageSrc(product.images?.[1]?.src);
  const discount = product.on_sale
    ? getDiscountPercent(product.regular_price, product.sale_price)
    : null;
  const outOfStock = product.stock_status === "outofstock";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-100 dark:bg-brand-900">
        <Link
          href={`/product/${product.slug}`}
          className="block h-full w-full"
          aria-label={product.name}
        >
          <SafeImage
            src={primarySrc}
            alt={product.images?.[0]?.alt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-all duration-700 ease-out",
              hovered && hoverSrc
                ? "opacity-0 scale-105"
                : "opacity-100 scale-100 group-hover:scale-105"
            )}
          />
          {hoverSrc && (
            <SafeImage
              src={hoverSrc}
              alt={`${product.name} alternate`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                "object-cover transition-all duration-700 ease-out",
                hovered ? "opacity-100 scale-100" : "opacity-0 scale-105"
              )}
            />
          )}
        </Link>

        {discount != null && (
          <span className="absolute left-3 top-3 z-[1] bg-ink px-2 py-1 text-[10px] font-medium tracking-wider text-cream uppercase dark:bg-gold dark:text-ink">
            −{discount}%
          </span>
        )}

        {outOfStock && (
          <span className="absolute inset-0 z-[1] flex items-center justify-center bg-cream/60 text-xs tracking-[0.2em] uppercase backdrop-blur-[2px] dark:bg-brand-950/60">
            Out of Stock
          </span>
        )}

        <div
          className={cn(
            "absolute right-3 top-3 z-[2] flex flex-col gap-2 transition-all duration-300",
            hovered
              ? "translate-x-0 opacity-100"
              : "translate-x-2 opacity-0 max-md:translate-x-0 max-md:opacity-100"
          )}
        >
          <button
            type="button"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wished}
            onClick={() => toggle(product.id)}
            className="flex h-9 w-9 items-center justify-center bg-white/90 text-ink shadow-sm backdrop-blur transition hover:bg-white dark:bg-brand-900/90 dark:text-cream"
          >
            <Heart
              className={cn("h-4 w-4", wished && "fill-gold text-gold")}
            />
          </button>
          <button
            type="button"
            aria-label="Quick view"
            onClick={() => setQuickView(product.id)}
            className="flex h-9 w-9 items-center justify-center bg-white/90 text-ink shadow-sm backdrop-blur transition hover:bg-white dark:bg-brand-900/90 dark:text-cream"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-[2] p-3 transition-all duration-300",
            hovered
              ? "translate-y-0 opacity-100"
              : "translate-y-2 opacity-0 max-md:translate-y-0 max-md:opacity-100"
          )}
        >
          {product.type === "variable" ? (
            <Link
              href={`/product/${product.slug}`}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--cms-primary,#7A3E1D)] py-3 text-[11px] font-medium tracking-[0.15em] text-cream uppercase transition hover:brightness-110"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Select Options
            </Link>
          ) : (
            <button
              type="button"
              disabled={outOfStock || addToCart.isPending}
              onClick={() =>
                addToCart.mutate({ productId: product.id, quantity: 1 })
              }
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--cms-primary,#7A3E1D)] py-3 text-[11px] font-medium tracking-[0.15em] text-cream uppercase transition hover:brightness-110 disabled:opacity-50"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {addToCart.isPending ? "…" : "Add to Cart"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1 sm:mt-4 sm:space-y-1.5">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-display text-lg font-light leading-snug tracking-wide transition-colors group-hover:text-brand-700 sm:text-xl dark:group-hover:text-gold">
            {product.name}
          </h3>
        </Link>

        <Rating
          rating={product.average_rating}
          count={product.rating_count}
        />

        <div className="flex flex-wrap items-baseline gap-2">
          {product.on_sale && product.sale_price ? (
            <>
              <span className="text-sm font-medium">
                {formatPrice(product.sale_price)}
              </span>
              <span className="text-sm text-ink-muted line-through">
                {formatPrice(product.regular_price)}
              </span>
            </>
          ) : (
            <span className="text-sm font-medium">
              {formatPrice(product.price || product.regular_price)}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
