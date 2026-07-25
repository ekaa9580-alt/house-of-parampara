"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWishlistStore } from "@/store";
import { ProductGrid } from "@/components/product/ProductGrid";
import { clientApi } from "@/lib/api/client";
import { isCatalogProduct } from "@/lib/utils";
import type { WooProduct, PaginatedResponse } from "@/types/woocommerce";

export default function WishlistPage() {
  const ids = useWishlistStore((s) => s.items);
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<WooProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (!ids.length) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    clientApi
      .get<PaginatedResponse<WooProduct>>("/products", {
        params: { include: ids.join(","), per_page: ids.length },
      })
      .then((res) => {
        setProducts((res.data.data || []).filter(isCatalogProduct));
      })
      .finally(() => setLoading(false));
  }, [ids, mounted]);

  if (!mounted || loading) {
    return (
      <div className="container-luxury pb-20 pt-28">
        <h1 className="section-heading mb-10">Wishlist</h1>
        <ProductGrid products={[]} isLoading />
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="container-luxury pb-20 pt-28">
        <h1 className="section-heading mb-10">Wishlist</h1>
        <div className="py-16 text-center">
          <p className="font-display text-2xl font-light">
            Your wishlist is empty
          </p>
          <Link href="/shop" className="btn-primary mt-6 inline-flex">
            Browse Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-luxury pb-20 pt-28">
      <h1 className="section-heading mb-10">Wishlist</h1>
      <ProductGrid products={products} />
    </div>
  );
}
