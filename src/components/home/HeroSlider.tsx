"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination, Navigation } from "swiper/modules";
import { gsap } from "gsap";
import { useHeroBanners, useSiteSettings } from "@/hooks/useWooCommerce";
import { HeroSkeleton } from "@/components/ui/Skeleton";
import { SafeImage } from "@/components/ui/SafeImage";
import { safeImageSrc } from "@/lib/utils";
import type { HeroBanner } from "@/types/woocommerce";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";

function HeroContent({ banner }: { banner: HeroBanner }) {
  return (
    <div className="container-luxury relative z-10 flex h-full items-center pb-14 pt-20 md:pb-16 md:pt-24">
      {/* Dedicated content lane — ~45% desktop, full readable width on mobile */}
      <div className="hero-content w-full max-w-xl md:w-[48%] md:max-w-[45%] lg:max-w-[42%]">
        {banner.subtitle && (
          <p className="mb-3 text-[11px] tracking-[0.28em] uppercase text-gold sm:text-xs md:mb-4 md:text-sm">
            {banner.subtitle}
          </p>
        )}
        <h1 className="font-display text-[2rem] font-light leading-[1.15] tracking-wide text-balance sm:text-4xl md:text-5xl lg:text-[3.25rem]">
          {banner.title}
        </h1>
        {banner.description && (
          <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/90 sm:text-base md:mt-5 md:text-lg">
            {banner.description}
          </p>
        )}
        {(banner.cta_text || banner.secondary_cta_text) && (
          <div className="mt-6 flex flex-wrap gap-3 md:mt-8 md:gap-4">
            {banner.cta_text && banner.cta_url && (
              <Link
                href={banner.cta_url}
                className="btn-primary rounded-full px-7 py-3 text-xs sm:text-sm"
              >
                {banner.cta_text}
              </Link>
            )}
            {banner.secondary_cta_text && banner.secondary_cta_url && (
              <Link
                href={banner.secondary_cta_url}
                className="btn-outline border-cream/50 px-6 py-3 text-xs text-cream hover:bg-cream hover:text-ink sm:text-sm"
              >
                {banner.secondary_cta_text}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function HeroSlider() {
  const { data: banners, isLoading } = useHeroBanners();
  const { data: settings } = useSiteSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const slides = useMemo(() => (banners || []).slice(0, 3), [banners]);

  useEffect(() => {
    if (!containerRef.current || !slides.length) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-content > *", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.3,
      });
    }, containerRef);
    return () => ctx.revert();
  }, [slides]);

  if (isLoading) return <HeroSkeleton />;

  if (!slides.length) {
    if (
      !settings?.home_hero_fallback_title &&
      !settings?.home_hero_fallback_text
    ) {
      return null;
    }
    return (
      <section className="relative flex h-[62vh] items-center bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 md:h-[78vh]">
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/45 to-transparent" />
        <div className="container-luxury relative z-10 pb-14 pt-24 text-cream md:pb-16 md:pt-28">
          <div className="hero-content w-full max-w-xl md:w-[48%] md:max-w-[45%] lg:max-w-[42%]">
            {settings.home_hero_fallback_eyebrow && (
              <p className="mb-4 text-xs tracking-[0.3em] uppercase text-gold">
                {settings.home_hero_fallback_eyebrow}
              </p>
            )}
            {settings.home_hero_fallback_title && (
              <h1 className="font-display text-[2rem] font-light tracking-wide whitespace-pre-line sm:text-4xl md:text-5xl lg:text-[3.25rem]">
                {settings.home_hero_fallback_title}
              </h1>
            )}
            {settings.home_hero_fallback_text && (
              <p className="mt-5 max-w-md text-sm text-cream/75 sm:text-base md:text-lg">
                {settings.home_hero_fallback_text}
              </p>
            )}
            {settings.home_hero_fallback_cta &&
              settings.home_hero_fallback_cta_url && (
                <Link
                  href={settings.home_hero_fallback_cta_url}
                  className="btn-primary mt-8 inline-flex rounded-full"
                >
                  {settings.home_hero_fallback_cta}
                </Link>
              )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="relative">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination, Navigation]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={900}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop={slides.length > 1}
        className="hero-swiper h-[62vh] md:h-[78vh]"
      >
        {slides.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="relative h-full w-full overflow-hidden">
              {safeImageSrc(banner.image) && (
                <SafeImage
                  src={banner.image}
                  alt={banner.title}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
              )}
              {/* Consistent L→R dark gradient for text readability on all slides */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/50 to-ink/10"
                aria-hidden
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-ink/25 md:to-ink/15" aria-hidden />
              <HeroContent banner={banner} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .hero-swiper .swiper-pagination {
          bottom: 18px !important;
          z-index: 20;
        }
        .hero-swiper .swiper-pagination-bullet {
          background: rgba(247, 243, 237, 0.55);
          opacity: 1;
          width: 9px;
          height: 9px;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          background: #c4a574;
          width: 22px;
          border-radius: 999px;
        }
        .hero-swiper .swiper-button-next,
        .hero-swiper .swiper-button-prev {
          color: #f7f3ed;
          opacity: 0.8;
          width: 44px;
          height: 44px;
          top: 50%;
          margin-top: -22px;
          z-index: 20;
        }
        .hero-swiper .swiper-button-prev {
          left: 12px;
        }
        .hero-swiper .swiper-button-next {
          right: 12px;
        }
        .hero-swiper .swiper-button-next:after,
        .hero-swiper .swiper-button-prev:after {
          font-size: 18px;
          font-weight: 600;
        }
        .hero-swiper .swiper-button-next:hover,
        .hero-swiper .swiper-button-prev:hover {
          opacity: 1;
        }
        @media (max-width: 768px) {
          .hero-swiper .swiper-button-next,
          .hero-swiper .swiper-button-prev {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
