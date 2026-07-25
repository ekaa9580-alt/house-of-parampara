"use client";

import type { WooProduct } from "@/types/woocommerce";
import { ProductCard } from "./ProductCard";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";

interface ProductGridProps {
  products: WooProduct[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  isLoading,
  emptyMessage = "No products found.",
}: ProductGridProps) {
  if (isLoading) return <ProductGridSkeleton />;

  if (!products.length) {
    return (
      <div className="flex min-h-[30vh] flex-col items-center justify-center text-center">
        <p className="font-display text-2xl font-light">{emptyMessage}</p>
        <p className="mt-2 text-sm text-ink-muted">
          Try adjusting your filters or browse the full collection.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-10 lg:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} index={i} />
      ))}
    </div>
  );
}
