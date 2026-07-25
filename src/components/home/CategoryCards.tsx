"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useCategories } from "@/hooks/useWooCommerce";
import { CategoryCardSkeleton } from "@/components/ui/Skeleton";
import { SafeImage } from "@/components/ui/SafeImage";
import { safeImageSrc } from "@/lib/utils";

export function CategoryCards() {
  const { data: categories, isLoading } = useCategories(0);

  if (isLoading) {
    return (
      <section className="container-luxury py-16 md:py-20">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-7">
          {Array.from({ length: 4 }).map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  const preferred = ["women", "men", "kids", "handicrafts"];
  const sorted = [...(categories || [])].sort((a, b) => {
    const ai = preferred.findIndex((p) => a.slug.includes(p) || a.name.toLowerCase().includes(p));
    const bi = preferred.findIndex((p) => b.slug.includes(p) || b.name.toLowerCase().includes(p));
    const av = ai === -1 ? 99 : ai;
    const bv = bi === -1 ? 99 : bi;
    return av - bv;
  });
  const items = sorted.slice(0, 4);
  if (!items.length) return null;

  return (
    <section className="container-luxury py-16 md:py-24">
      <div className="mb-10 text-center md:mb-14">
        <p className="mb-3 text-xs tracking-[0.3em] uppercase text-gold md:text-sm">
          Collections
        </p>
        <h2 className="section-heading">Shop by Category</h2>
        <p className="section-subheading mx-auto mt-3 text-center">
          Explore our heritage collections — crafted for every occasion.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-7">
        {items.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
          >
            <Link href={`/category/${cat.slug}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden bg-brand-100 dark:bg-brand-900 md:aspect-[3/4.2]">
                {safeImageSrc(cat.image?.src) ? (
                  <SafeImage
                    src={cat.image?.src}
                    alt={cat.image?.alt || cat.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-200 to-brand-300 dark:from-brand-800 dark:to-brand-900">
                    <span className="font-display text-5xl text-brand-500 md:text-6xl">
                      {cat.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/15 to-transparent transition-opacity duration-500 group-hover:from-ink/75" />
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-7">
                  <h3 className="font-display text-2xl font-light tracking-wide text-cream md:text-3xl">
                    {cat.name}
                  </h3>
                  <p className="mt-1.5 text-xs tracking-wider text-cream/75 uppercase md:text-sm">
                    {cat.count} pieces
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
