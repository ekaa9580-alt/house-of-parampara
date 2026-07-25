"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSaleProducts } from "@/hooks/useWooCommerce";

export function SaleBanner() {
  const { data: saleProducts } = useSaleProducts(1);

  // Only show if there are sale products from WooCommerce
  if (!saleProducts?.length) return null;

  return (
    <section className="relative overflow-hidden bg-ink py-20 text-cream md:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(196,165,116,0.12),_transparent_55%)]" />
      <div className="container-luxury relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="mb-4 text-xs tracking-[0.3em] uppercase text-gold">
            Limited Time
          </p>
          <h2 className="font-display text-4xl font-light tracking-wide md:text-6xl">
            The Sale Collection
          </h2>
          <p className="mx-auto mt-4 max-w-md text-cream/60">
            Selected pieces at special prices. While stocks last.
          </p>
          <Link
            href="/shop?on_sale=true"
            className="btn-primary mt-8 inline-flex bg-cream text-ink hover:bg-brand-100"
          >
            Shop Sale
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
