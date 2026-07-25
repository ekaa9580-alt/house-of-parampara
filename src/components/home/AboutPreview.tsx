"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSiteSettings } from "@/hooks/useWooCommerce";
import { SafeImage } from "@/components/ui/SafeImage";
import { safeImageSrc } from "@/lib/utils";

export function AboutPreview() {
  const { data: settings } = useSiteSettings();

  return (
    <section className="container-luxury py-20 md:py-28">
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative aspect-[4/5] overflow-hidden bg-brand-100 dark:bg-brand-900"
        >
          {safeImageSrc(settings?.about_image) ? (
            <SafeImage
              src={settings?.about_image}
              alt="About House of Parampara"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-200 via-brand-100 to-gold/20 dark:from-brand-900 dark:via-brand-950 dark:to-gold/10">
              <span className="font-display text-6xl font-light text-brand-400">
                परमपरा
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="mb-3 text-xs tracking-[0.3em] uppercase text-gold">
            Our Story
          </p>
          <h2 className="section-heading">Heritage, Reimagined</h2>
          <p className="mt-6 text-base leading-relaxed text-ink-muted md:text-lg">
            {settings?.about_preview ||
              "House of Parampara celebrates the living traditions of Indian textile craft. Each piece is a dialogue between ancestral technique and contemporary design — woven, dyed, and finished with reverence for the makers who carry these skills forward."}
          </p>
          <Link href="/about" className="btn-outline mt-8 inline-flex">
            Discover Our World
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
