"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import type { WooProduct } from "@/types/woocommerce";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: WooProduct[] | undefined;
  isLoading: boolean;
  viewAllHref?: string;
  viewAllLabel?: string;
}

export function ProductCarousel({
  title,
  subtitle,
  products,
  isLoading,
  viewAllHref,
  viewAllLabel,
}: ProductCarouselProps) {
  if (!isLoading && !(products?.length)) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-light tracking-wide text-ink md:text-4xl dark:text-cream">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 max-w-lg text-sm text-ink-muted md:text-base">
              {subtitle}
            </p>
          )}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="shrink-0 text-xs font-medium tracking-[0.18em] uppercase text-[var(--cms-primary,#1E3A8A)] transition hover:opacity-70"
          >
            {viewAllLabel || "View all"}
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <Swiper
          modules={[Navigation, FreeMode]}
          navigation
          freeMode
          spaceBetween={16}
          slidesPerView={1.35}
          breakpoints={{
            480: { slidesPerView: 2.1, spaceBetween: 16 },
            768: { slidesPerView: 3, spaceBetween: 20 },
            1024: { slidesPerView: 4, spaceBetween: 22 },
            1280: { slidesPerView: 4.5, spaceBetween: 24 },
          }}
          className="product-carousel !overflow-visible"
        >
          {(products || []).map((p, i) => (
            <SwiperSlide key={p.id} className="!h-auto">
              <ProductCard product={p} index={i} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      <style jsx global>{`
        .product-carousel .swiper-button-next,
        .product-carousel .swiper-button-prev {
          color: var(--cms-primary, #1e3a8a);
          width: 40px;
          height: 40px;
          background: rgba(253, 251, 247, 0.92);
          border-radius: 999px;
          box-shadow: 0 4px 16px rgba(26, 22, 20, 0.08);
        }
        .product-carousel .swiper-button-next:after,
        .product-carousel .swiper-button-prev:after {
          font-size: 14px;
          font-weight: 700;
        }
      `}</style>
    </section>
  );
}
