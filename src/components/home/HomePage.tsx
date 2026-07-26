"use client";

import {
  useFeaturedProducts,
  useLatestProducts,
  useBestSellers,
  useSiteSettings,
} from "@/hooks/useWooCommerce";
import { HeroSlider } from "./HeroSlider";
import { CategoryCards } from "./CategoryCards";
import { ProductSection } from "./ProductSection";
import { Testimonials } from "./Testimonials";
import { InstagramFeed } from "./InstagramFeed";
import { AboutPreview } from "./AboutPreview";
import { SaleBanner } from "./SaleBanner";

export function HomePage() {
  const { data: s } = useSiteSettings();
  const featured = useFeaturedProducts(8);
  const latest = useLatestProducts(8);
  const bestsellers = useBestSellers(8);

  return (
    <>
      <HeroSlider />
      {s?.show_categories !== false && <CategoryCards />}
      {s?.show_about_preview !== false && <AboutPreview />}
      {s?.show_featured !== false && (
        <ProductSection
          eyebrow={s?.home_featured_eyebrow}
          title={s?.home_featured_title}
          subtitle={s?.home_featured_subtitle}
          products={featured.data}
          isLoading={featured.isLoading}
          viewAllHref={s?.home_featured_cta_url}
          viewAllLabel={s?.home_featured_cta}
        />
      )}
      {s?.show_latest !== false && (
        <ProductSection
          eyebrow={s?.home_latest_eyebrow}
          title={s?.home_latest_title}
          subtitle={s?.home_latest_subtitle}
          products={latest.data}
          isLoading={latest.isLoading}
          viewAllHref={s?.home_latest_cta_url}
          viewAllLabel={s?.home_latest_cta}
        />
      )}
      {s?.show_bestsellers !== false && (
        <ProductSection
          eyebrow={s?.home_bestsellers_eyebrow}
          title={s?.home_bestsellers_title}
          subtitle={s?.home_bestsellers_subtitle}
          products={bestsellers.data}
          isLoading={bestsellers.isLoading}
          viewAllHref={s?.home_bestsellers_cta_url}
          viewAllLabel={s?.home_bestsellers_cta}
        />
      )}
      {s?.show_sale_banner !== false && <SaleBanner />}
      {s?.show_testimonials !== false && <Testimonials />}
      {s?.show_instagram !== false && <InstagramFeed />}
    </>
  );
}
