"use client";

import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { WooProduct } from "@/types/woocommerce";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  products: WooProduct[] | undefined;
  isLoading: boolean;
  viewAllHref?: string;
}

export function ProductSection({
  title,
  subtitle,
  eyebrow,
  products,
  isLoading,
  viewAllHref = "/shop",
}: ProductSectionProps) {
  if (!isLoading && !(products?.length)) return null;

  return (
    <section className="container-luxury py-14 md:py-20">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 md:mb-12 md:flex-row md:items-end">
        <div>
          {eyebrow && (
            <p className="mb-3 text-xs tracking-[0.3em] uppercase text-gold">
              {eyebrow}
            </p>
          )}
          <h2 className="section-heading">{title}</h2>
          {subtitle && <p className="section-subheading">{subtitle}</p>}
        </div>
        <Link
          href={viewAllHref}
          className="link-underline shrink-0 text-xs tracking-[0.2em] uppercase"
        >
          View All
        </Link>
      </div>
      <ProductGrid products={products || []} isLoading={isLoading} />
    </section>
  );
}
