"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { WooImage } from "@/types/woocommerce";
import { cn, safeImageSrc } from "@/lib/utils";
import { SafeImage } from "@/components/ui/SafeImage";

interface ProductGalleryProps {
  images: WooImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const valid = useMemo(
    () => (images || []).filter((img) => safeImageSrc(img.src)),
    [images]
  );
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const current = valid[active] || valid[0];

  useEffect(() => {
    setActive(0);
  }, [images]);

  if (!valid.length) {
    return (
      <div className="relative aspect-[4/5] max-h-[70vh] bg-brand-100 dark:bg-brand-900 lg:max-h-[560px]">
        <SafeImage src={null} alt={productName} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:gap-4">
      {valid.length > 1 && (
        <div className="order-2 flex gap-2 overflow-x-auto pb-1 md:order-1 md:max-h-[560px] md:w-16 md:flex-col md:overflow-y-auto md:overflow-x-hidden md:pb-0 lg:w-[4.5rem]">
          {valid.map((img, i) => (
            <button
              key={img.id || i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${productName} image ${i + 1}`}
              aria-pressed={i === active}
              className={cn(
                "relative h-16 w-14 shrink-0 overflow-hidden border transition-colors md:h-20 md:w-full",
                i === active
                  ? "border-royal"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <SafeImage
                src={img.src}
                alt={img.alt || `${productName} ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      <div
        className="relative order-1 aspect-[4/5] max-h-[70vh] w-full flex-1 cursor-zoom-in overflow-hidden bg-brand-100 dark:bg-brand-900 md:order-2 lg:max-h-[560px]"
        onClick={() => setZoomed((z) => !z)}
        onMouseMove={(e) => {
          if (!zoomed) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          e.currentTarget.style.setProperty("--zx", `${x}%`);
          e.currentTarget.style.setProperty("--zy", `${y}%`);
        }}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current?.id || active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            {current && (
              <SafeImage
                src={current.src}
                alt={current.alt || productName}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 45vw"
                className={cn(
                  "object-cover transition-transform duration-500",
                  zoomed && "scale-150"
                )}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
