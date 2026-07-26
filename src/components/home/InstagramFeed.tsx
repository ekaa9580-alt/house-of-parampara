"use client";

import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { useSiteSettings } from "@/hooks/useWooCommerce";
import { SafeImage } from "@/components/ui/SafeImage";
import { safeImageSrc } from "@/lib/utils";

export function InstagramFeed() {
  const { data: settings } = useSiteSettings();
  const posts = settings?.instagram_posts;
  const instagramUrl = settings?.instagram;
  const handle = settings?.instagram_handle;

  if (!posts?.length) {
    if (!instagramUrl) return null;
    return (
      <section className="container-luxury py-16 text-center md:py-20">
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 text-ink transition-opacity hover:opacity-70 dark:text-cream"
        >
          <Instagram className="h-5 w-5" strokeWidth={1.5} />
          <span className="text-xs tracking-[0.2em] uppercase">
            {handle ? `@${handle.replace(/^@/, "")}` : settings?.home_instagram_title}
          </span>
        </a>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container-luxury mb-10 text-center">
        {(settings?.home_instagram_eyebrow || handle) && (
          <p className="mb-3 text-xs tracking-[0.3em] uppercase text-gold">
            {settings?.home_instagram_eyebrow ||
              (handle ? `@${handle.replace(/^@/, "")}` : "")}
          </p>
        )}
        {settings?.home_instagram_title && (
          <h2 className="section-heading">{settings.home_instagram_title}</h2>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        {posts.slice(0, 6).map((post, i) => (
          <motion.a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="group relative aspect-square overflow-hidden"
          >
            {safeImageSrc(post.media_url) ? (
              <SafeImage
                src={post.media_url}
                alt={post.caption || ""}
                fill
                sizes="(max-width: 768px) 50vw, 16vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-brand-100 dark:bg-brand-900" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/40">
              <Instagram className="h-6 w-6 text-cream opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
