"use client";

import {
  useFeaturedProducts,
  useLatestProducts,
  useBestSellers,
} from "@/hooks/useWooCommerce";
import { HeroSlider } from "./HeroSlider";
import { CategoryCards } from "./CategoryCards";
import { ProductSection } from "./ProductSection";
import { Testimonials } from "./Testimonials";
import { InstagramFeed } from "./InstagramFeed";

export function HomePage() {
  const featured = useFeaturedProducts(8);
  const latest = useLatestProducts(8);
  const bestsellers = useBestSellers(8);

  return (
    <>
      <HeroSlider />
      <CategoryCards />
      <ProductSection
        eyebrow="Curated"
        title="Featured Products"
        subtitle="Signature pieces from the House of Parampara atelier."
        products={featured.data}
        isLoading={featured.isLoading}
        viewAllHref="/shop?featured=true"
      />
      <ProductSection
        eyebrow="Just In"
        title="New Arrivals"
        subtitle="The latest additions to our collection."
        products={latest.data}
        isLoading={latest.isLoading}
        viewAllHref="/shop?orderby=date"
      />
      <ProductSection
        eyebrow="Beloved"
        title="Best Sellers"
        subtitle="The pieces our patrons return to again and again."
        products={bestsellers.data}
        isLoading={bestsellers.isLoading}
        viewAllHref="/shop?orderby=popularity"
      />
      <Testimonials />
      <InstagramFeed />
    </>
  );
}
