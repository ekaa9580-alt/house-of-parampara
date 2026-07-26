"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSaleProducts, useSiteSettings } from "@/hooks/useWooCommerce";

export function SaleBanner() {
  const { data: saleProducts } = useSaleProducts(1);
  const { data: s } = useSiteSettings();

  if (s?.show_sale_banner === false) return null;
  if (!saleProducts?.length) return null;
  if (!s?.home_sale_title && !s?.home_sale_eyebrow) return null;

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
          {s?.home_sale_eyebrow && (
            <p className="mb-4 text-xs tracking-[0.3em] uppercase text-gold">
              {s.home_sale_eyebrow}
            </p>
          )}
          {s?.home_sale_title && (
            <h2 className="font-display text-4xl font-light tracking-wide md:text-6xl">
              {s.home_sale_title}
            </h2>
          )}
          {s?.home_sale_subtitle && (
            <p className="mx-auto mt-4 max-w-md text-cream/60">
              {s.home_sale_subtitle}
            </p>
          )}
          {s?.home_sale_cta && s?.home_sale_cta_url && (
            <Link
              href={s.home_sale_cta_url}
              className="btn-primary mt-8 inline-flex bg-cream text-ink hover:bg-brand-100"
            >
              {s.home_sale_cta}
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}
