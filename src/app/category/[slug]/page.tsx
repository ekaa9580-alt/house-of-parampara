"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { ShopView } from "@/components/shop/ShopView";
import { useCategory } from "@/hooks/useWooCommerce";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";

function CategoryContent() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: category, isLoading } = useCategory(slug);

  if (isLoading) {
    return (
      <div className="py-8 md:py-10">
        <ProductGridSkeleton />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-12 text-center">
        <div>
          <h1 className="font-display text-3xl font-light">
            Category not found
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className={category.image?.src ? "" : "pt-2"}>
      <ShopView
        categorySlug={category.slug}
        title={category.name}
        bannerImage={category.image?.src}
        description={category.description}
      />
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="py-8 md:py-10">
          <ProductGridSkeleton />
        </div>
      }
    >
      <CategoryContent />
    </Suspense>
  );
}
