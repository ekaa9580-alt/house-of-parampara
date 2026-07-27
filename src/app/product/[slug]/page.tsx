"use client";

import { useParams } from "next/navigation";
import { useProduct } from "@/hooks/useWooCommerce";
import { ProductDetail } from "@/components/product/ProductDetail";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: product, isLoading, error } = useProduct(slug);

  if (isLoading) {
    return (
      <div className="grid gap-10 pb-12 pt-2 md:pb-16 lg:grid-cols-2">
        <Skeleton className="aspect-[3/4] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-12 text-center">
        <h1 className="font-display text-3xl font-light">Product not found</h1>
      </div>
    );
  }

  return <ProductDetail product={product} />;
}
