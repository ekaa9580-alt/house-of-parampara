import { Suspense } from "react";
import { ShopView } from "@/components/shop/ShopView";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import type { Metadata } from "next";
import { fetchSettings } from "@/lib/data/commerce";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const s = await fetchSettings();
    return {
      title: "Shop",
      description: s.seo_description || s.tagline || s.site_name || undefined,
    };
  } catch {
    return { title: "Shop" };
  }
}

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
