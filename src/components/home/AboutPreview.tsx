"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSiteSettings } from "@/hooks/useWooCommerce";
import { SafeImage } from "@/components/ui/SafeImage";
import { safeImageSrc } from "@/lib/utils";

export function AboutPreview() {
  const { data: settings } = useSiteSettings();

  if (settings?.show_about_preview === false) return null;
  if (!settings?.about_preview && !settings?.home_about_title) return null;

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
              alt={settings?.home_about_title || settings?.site_name || ""}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {settings?.home_about_eyebrow && (
            <p className="mb-3 text-xs tracking-[0.3em] uppercase text-gold">
              {settings.home_about_eyebrow}
            </p>
          )}
          {settings?.home_about_title && (
            <h2 className="section-heading">{settings.home_about_title}</h2>
          )}
          {settings?.about_preview && (
            <p className="mt-6 text-base leading-relaxed text-ink-muted md:text-lg">
              {settings.about_preview}
            </p>
          )}
          {settings?.home_about_cta && settings?.home_about_cta_url && (
            <Link
              href={settings.home_about_cta_url}
              className="btn-outline mt-8 inline-flex"
            >
              {settings.home_about_cta}
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}
