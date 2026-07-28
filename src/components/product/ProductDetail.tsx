"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import type { WooProduct, WooProductVariation } from "@/types/woocommerce";
import {
  formatPrice,
  getDiscountPercent,
  isInStock,
  stripHtml,
} from "@/lib/utils";
import { Rating } from "@/components/ui/Rating";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductGallery } from "./ProductGallery";
import { ProductGrid } from "./ProductGrid";
import {
  useAddToCart,
  useRelatedProducts,
  useReviews,
  useCreateReview,
  useSiteSettings,
} from "@/hooks/useWooCommerce";
import { useWishlistStore, useRecentlyViewedStore } from "@/store";
import { clientApi } from "@/lib/api/client";

interface ProductDetailProps {
  product: WooProduct;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"description" | "reviews">("description");
  const [mounted, setMounted] = useState(false);
  const [buying, setBuying] = useState(false);
  const [variations, setVariations] = useState<WooProductVariation[]>([]);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(
    {}
  );
  const addToCart = useAddToCart();
  const { data: settings } = useSiteSettings();
  const atcLabel = settings?.add_to_cart_label || "Add to Bag";
  const { toggle, has } = useWishlistStore();
  const addRecent = useRecentlyViewedStore((s) => s.add);
  const recent = useRecentlyViewedStore((s) => s.items);
  const related = useRelatedProducts(product.slug);
  const reviews = useReviews(product.id);
  const createReview = useCreateReview();

  const [reviewForm, setReviewForm] = useState({
    reviewer: "",
    reviewer_email: "",
    review: "",
    rating: 5,
  });

  const isVariable = product.type === "variable";
  const variationAttrs = useMemo(
    () => product.attributes?.filter((a) => a.variation) || [],
    [product.attributes]
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    addRecent(product);
  }, [product, addRecent]);

  useEffect(() => {
    if (!isVariable) return;
    clientApi
      .get<WooProductVariation[]>(`/products/${product.slug}/variations`)
      .then((res) => setVariations(res.data || []))
      .catch(() => setVariations([]));
  }, [isVariable, product.slug]);

  const matchedVariation = useMemo(() => {
    if (!isVariable || !variations.length) return null;
    const keys = variationAttrs.map((a) => a.name);
    if (!keys.every((k) => selectedAttrs[k])) return null;
    return (
      variations.find((v) =>
        keys.every((name) => {
          const opt = selectedAttrs[name];
          return v.attributes.some(
            (va) =>
              va.option === opt &&
              (va.name === name ||
                va.name.toLowerCase() === name.toLowerCase() ||
                va.name.replace(/^pa_/, "") === name.toLowerCase())
          );
        })
      ) || null
    );
  }, [isVariable, variations, selectedAttrs, variationAttrs]);

  const displayPrice =
    matchedVariation?.price || product.price || product.regular_price;
  const displayRegular =
    matchedVariation?.regular_price || product.regular_price;
  const displaySale = matchedVariation?.sale_price || product.sale_price;
  const onSale = matchedVariation
    ? matchedVariation.on_sale
    : product.on_sale;
  const stockStatus =
    matchedVariation?.stock_status || product.stock_status;
  const discount = onSale
    ? getDiscountPercent(displayRegular, displaySale)
    : null;
  const inStock = isInStock(stockStatus);
  const canAdd =
    inStock &&
    (!isVariable || !!matchedVariation) &&
    !addToCart.isPending &&
    !buying;

  const cartPayload = () => {
    if (isVariable && matchedVariation) {
      return {
        productId: product.id,
        quantity: qty,
        variationId: matchedVariation.id,
        variation: variationAttrs.map((a) => ({
          attribute: a.name,
          value: selectedAttrs[a.name],
        })),
      };
    }
    return { productId: product.id, quantity: qty };
  };

  const handleBuyNow = () => {
    if (!canAdd) return;
    setBuying(true);
    addToCart.mutate(cartPayload(), {
      onSuccess: () => {
        router.push("/checkout");
      },
      onSettled: () => setBuying(false),
    });
  };

  const galleryImages =
    matchedVariation?.image
      ? [matchedVariation.image, ...(product.images || [])]
      : product.images || [];

  return (
    <div className="pb-12 pt-2 md:pb-16">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          ...(product.categories?.[0]
            ? [
                {
                  label: product.categories[0].name,
                  href: `/category/${product.categories[0].slug}`,
                },
              ]
            : []),
          { label: product.name },
        ]}
        className="mb-6"
      />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12 xl:gap-14">
        <ProductGallery images={galleryImages} productName={product.name} />

        <div className="lg:sticky lg:top-28">
          <p className="mb-2 text-xs tracking-[0.25em] uppercase text-gold">
            {product.categories?.[0]?.name}
          </p>
          <h1 className="font-display text-[1.85rem] font-bold leading-tight tracking-wide md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Rating
              rating={product.average_rating}
              count={product.rating_count}
              size="md"
            />
            <span
              className={`text-xs tracking-wider uppercase ${
                inStock
                  ? "text-[var(--cms-primary,#7A3E1D)]"
                  : "text-red-600"
              }`}
            >
              {stockStatus === "instock"
                ? "In Stock"
                : stockStatus === "onbackorder"
                  ? "Available on Backorder"
                  : "Out of Stock"}
              {matchedVariation?.stock_quantity != null && inStock
                ? ` · ${matchedVariation.stock_quantity} left`
                : product.stock_quantity != null && inStock && !isVariable
                  ? ` · ${product.stock_quantity} left`
                  : ""}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            {onSale && displaySale ? (
              <>
                <span className="text-2xl font-medium">
                  {formatPrice(displaySale)}
                </span>
                <span className="text-lg text-ink-muted line-through">
                  {formatPrice(displayRegular)}
                </span>
                {discount && (
                  <span className="bg-[var(--cms-primary,#7A3E1D)] px-2 py-0.5 text-[10px] tracking-wider text-cream uppercase">
                    −{discount}%
                  </span>
                )}
              </>
            ) : (
              <span className="text-2xl font-medium">
                {formatPrice(displayPrice)}
              </span>
            )}
          </div>

          {product.short_description && (
            <p className="mt-5 text-base leading-relaxed text-ink-muted">
              {stripHtml(product.short_description)}
            </p>
          )}

          {isVariable && variationAttrs.length > 0 && (
            <div className="mt-6 space-y-4">
              {variationAttrs.map((attr) => (
                <div key={attr.id || attr.name}>
                  <p className="mb-2 text-xs tracking-[0.2em] uppercase text-ink-muted">
                    {attr.name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {attr.options.map((opt) => {
                      const active = selectedAttrs[attr.name] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          aria-pressed={active}
                          onClick={() =>
                            setSelectedAttrs((s) => ({
                              ...s,
                              [attr.name]: opt,
                            }))
                          }
                          className={`border px-3 py-2 text-xs tracking-wider uppercase transition-colors ${
                            active
                              ? "border-ink bg-ink text-cream dark:border-cream dark:bg-cream dark:text-ink"
                              : "border-brand-200 text-ink hover:border-ink dark:border-brand-700 dark:text-cream"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div className="flex items-center border border-brand-200 dark:border-brand-700">
              <button
                type="button"
                aria-label="Decrease"
                className="px-4 py-3"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[2.5rem] text-center">{qty}</span>
              <button
                type="button"
                aria-label="Increase"
                className="px-4 py-3"
                onClick={() => setQty((q) => q + 1)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              disabled={!canAdd}
              onClick={() => {
                addToCart.mutate(cartPayload());
              }}
              className="btn-primary flex-1 sm:flex-none"
            >
              <ShoppingBag className="h-4 w-4" />
              {addToCart.isPending && !buying
                ? "…"
                : isVariable && !matchedVariation
                  ? "Select Options"
                  : atcLabel}
            </button>

            <button
              type="button"
              disabled={!canAdd}
              onClick={handleBuyNow}
              className="btn-outline flex-1 border-[var(--cms-primary,#7A3E1D)] text-[var(--cms-primary,#7A3E1D)] hover:bg-[var(--cms-primary,#7A3E1D)] hover:text-cream sm:flex-none"
            >
              <Zap className="h-4 w-4" />
              {buying ? "…" : "Buy Now"}
            </button>

            <button
              type="button"
              aria-label="Wishlist"
              aria-pressed={mounted && has(product.id)}
              onClick={() => toggle(product.id)}
              className="btn-outline px-4"
            >
              <Heart
                className={`h-4 w-4 ${
                  mounted && has(product.id) ? "fill-gold text-gold" : ""
                }`}
              />
            </button>
          </div>

          {(matchedVariation?.sku || product.sku) && (
            <p className="mt-5 text-xs text-ink-muted">
              SKU: {matchedVariation?.sku || product.sku}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12 border-t border-brand-200 pt-8 dark:border-brand-800 md:mt-14">
        <div
          className="flex gap-8 overflow-x-auto border-b border-brand-200 dark:border-brand-800"
          role="tablist"
        >
          {(
            [
              ["description", "Description"],
              ["reviews", `Reviews (${product.rating_count || 0})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`shrink-0 pb-3 text-sm tracking-[0.18em] uppercase transition-colors ${
                tab === key
                  ? "border-b-2 border-royal text-ink dark:text-cream"
                  : "text-ink-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="prose prose-neutral mt-8 max-w-3xl dark:prose-invert">
          {tab === "description" && (
            <div
              dangerouslySetInnerHTML={{
                __html: product.description || product.short_description,
              }}
            />
          )}
          {tab === "reviews" && (
            <div className="not-prose space-y-8">
              {reviews.data?.reviews?.map((r) => (
                <div
                  key={r.id}
                  className="border-b border-brand-100 pb-6 dark:border-brand-800"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{r.reviewer}</p>
                    <Rating rating={r.rating} />
                  </div>
                  <p className="mt-2 text-sm text-ink-muted">
                    {stripHtml(r.review)}
                  </p>
                </div>
              ))}
              {!reviews.data?.reviews?.length && (
                <p className="text-ink-muted">No reviews yet.</p>
              )}

              <form
                className="max-w-lg space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  createReview.mutate(
                    { ...reviewForm, product_id: product.id },
                    {
                      onSuccess: () =>
                        setReviewForm({
                          reviewer: "",
                          reviewer_email: "",
                          review: "",
                          rating: 5,
                        }),
                    }
                  );
                }}
              >
                <h3 className="font-display text-xl font-light">Write a Review</h3>
                <input
                  className="input-field"
                  placeholder="Name"
                  required
                  value={reviewForm.reviewer}
                  onChange={(e) =>
                    setReviewForm((f) => ({ ...f, reviewer: e.target.value }))
                  }
                />
                <input
                  className="input-field"
                  type="email"
                  placeholder="Email"
                  required
                  value={reviewForm.reviewer_email}
                  onChange={(e) =>
                    setReviewForm((f) => ({
                      ...f,
                      reviewer_email: e.target.value,
                    }))
                  }
                />
                <select
                  className="input-field"
                  value={reviewForm.rating}
                  onChange={(e) =>
                    setReviewForm((f) => ({
                      ...f,
                      rating: Number(e.target.value),
                    }))
                  }
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} stars
                    </option>
                  ))}
                </select>
                <textarea
                  className="input-field min-h-[100px]"
                  placeholder="Your review"
                  required
                  value={reviewForm.review}
                  onChange={(e) =>
                    setReviewForm((f) => ({ ...f, review: e.target.value }))
                  }
                />
                <button type="submit" className="btn-primary">
                  Submit Review
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {related.data && related.data.length > 0 && (
        <section className="mt-20">
          <h2 className="section-heading mb-10">You May Also Like</h2>
          <ProductGrid products={related.data} />
        </section>
      )}

      {recent.filter((p) => p.id !== product.id).length > 0 && (
        <section className="mt-20">
          <h2 className="section-heading mb-10">Recently Viewed</h2>
          <ProductGrid
            products={recent.filter((p) => p.id !== product.id).slice(0, 4)}
          />
        </section>
      )}
    </div>
  );
}
