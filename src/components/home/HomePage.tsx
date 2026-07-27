"use client";

import {
  useLatestProducts,
  useBestSellers,
  useSiteSettings,
} from "@/hooks/useWooCommerce";
import { HeroSlider } from "./HeroSlider";
import { ProductCarousel } from "./ProductCarousel";
import { AboutPreview } from "./AboutPreview";
import { ComingSoon } from "./ComingSoon";

/**
 * Home order (fixed):
 * Hero → New Arrivals → Best Sellers → About → Coming Soon
 * (Newsletter lives in Footer)
 */
export function HomePage() {
  const { data: s } = useSiteSettings();
  const latest = useLatestProducts(10);
  const bestsellers = useBestSellers(10);

  return (
    <div className="min-w-0">
      <div className="-mx-3 sm:-mx-5 lg:-mx-4 xl:-mx-5">
        <HeroSlider />
      </div>

      <ProductCarousel
        title={s?.home_latest_title || "New Arrivals"}
        subtitle={s?.home_latest_subtitle}
        products={latest.data}
        isLoading={latest.isLoading}
        viewAllHref={s?.home_latest_cta_url || "/shop?orderby=date"}
        viewAllLabel="View All →"
      />

      <ProductCarousel
        title={s?.home_bestsellers_title || "Best Sellers"}
        subtitle={s?.home_bestsellers_subtitle}
        products={bestsellers.data}
        isLoading={bestsellers.isLoading}
        viewAllHref={s?.home_bestsellers_cta_url || "/shop?orderby=popularity"}
        viewAllLabel="View All →"
      />

      {s?.show_about_preview !== false && <AboutPreview />}

      <div className="-mx-4 sm:-mx-6 lg:-ml-0">
        <ComingSoon />
      </div>
    </div>
  );
}
