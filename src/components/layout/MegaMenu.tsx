"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { WooCategory } from "@/types/woocommerce";
import { SafeImage } from "@/components/ui/SafeImage";
import { safeImageSrc } from "@/lib/utils";

interface MegaMenuProps {
  categories: WooCategory[];
  onClose: () => void;
}

export function MegaMenu({ categories, onClose }: MegaMenuProps) {
  const featured = categories.slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      onMouseLeave={onClose}
      className="absolute inset-x-0 top-full border-t border-brand-200/50 bg-cream/95 shadow-lift backdrop-blur-xl dark:border-brand-800 dark:bg-brand-950/95"
    >
      <div className="container-luxury grid grid-cols-2 gap-6 py-10 md:grid-cols-4 lg:grid-cols-6">
        {featured.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={`/category/${cat.slug}`}
              onClick={onClose}
              className="group block"
            >
              <div className="relative mb-3 aspect-[3/4] overflow-hidden bg-brand-100 dark:bg-brand-900">
                {safeImageSrc(cat.image?.src) ? (
                  <SafeImage
                    src={cat.image?.src}
                    alt={cat.image?.alt || cat.name}
                    fill
                    sizes="200px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-display text-2xl text-brand-300">
                    {cat.name.charAt(0)}
                  </div>
                )}
              </div>
              <span className="font-display text-lg font-light tracking-wide transition-colors group-hover:text-gold">
                {cat.name}
              </span>
              <span className="mt-0.5 block text-xs text-ink-muted">
                {cat.count} pieces
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
      <div className="border-t border-brand-200/50 py-4 text-center dark:border-brand-800">
        <Link
          href="/shop"
          onClick={onClose}
          className="link-underline text-xs tracking-[0.2em] uppercase"
        >
          View All Collections
        </Link>
      </div>
    </motion.div>
  );
}
