"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import { useTestimonials, useSiteSettings } from "@/hooks/useWooCommerce";
import { Rating } from "@/components/ui/Rating";
import "swiper/css";
import "swiper/css/pagination";

export function Testimonials() {
  const { data: testimonials, isLoading } = useTestimonials();
  const { data: s } = useSiteSettings();

  if (isLoading || !testimonials?.length) return null;

  return (
    <section className="bg-brand-50 py-16 dark:bg-brand-900/30 md:py-20 lg:py-24">
      <div className="container-luxury">
        {(s?.home_testimonials_eyebrow || s?.home_testimonials_title) && (
          <div className="mb-12 text-center">
            {s?.home_testimonials_eyebrow && (
              <p className="mb-3 text-xs tracking-[0.3em] uppercase text-gold">
                {s.home_testimonials_eyebrow}
              </p>
            )}
            {s?.home_testimonials_title && (
              <h2 className="section-heading">{s.home_testimonials_title}</h2>
            )}
          </div>
        )}

        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 5000 }}
          pagination={{ clickable: true }}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="testimonials-swiper pb-12!"
        >
          {testimonials.map((t, i) => (
            <SwiperSlide key={t.id}>
              <motion.blockquote
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex h-full flex-col bg-cream p-8 dark:bg-brand-950"
              >
                {t.rating && <Rating rating={t.rating} className="mb-4" />}
                <p className="flex-1 font-display text-xl font-light leading-relaxed">
                  &ldquo;{t.content}&rdquo;
                </p>
                <footer className="mt-6">
                  <cite className="not-italic text-sm font-medium tracking-wide">
                    {t.name}
                  </cite>
                  {t.role && (
                    <p className="text-xs text-ink-muted">{t.role}</p>
                  )}
                </footer>
              </motion.blockquote>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
