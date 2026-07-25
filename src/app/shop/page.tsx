import { Suspense } from "react";
import { ShopView } from "@/components/shop/ShopView";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse the House of Parampara collection.",
};

export default function ShopPage() {
  return (
    <div className="pt-20">
      <Suspense
        fallback={
          <div className="container-luxury py-14">
            <ProductGridSkeleton />
          </div>
        }
      >
        <ShopView />
      </Suspense>
    </div>
  );
}
