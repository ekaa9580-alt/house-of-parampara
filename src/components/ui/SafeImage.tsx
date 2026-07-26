"use client";

import Image from "next/image";
import { safeImageSrc, cn } from "@/lib/utils";

interface SafeImageProps {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackClassName?: string;
}

/** next/image wrapper that never renders with an empty/invalid src */
export function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
  fallbackClassName,
}: SafeImageProps) {
  const safe = safeImageSrc(src);

  if (!safe) {
    return (
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-50 via-brand-100 to-brand-200 text-[var(--cms-primary,#1E3A8A)] dark:from-brand-900 dark:via-brand-950 dark:to-brand-900",
          fill && "absolute inset-0",
          fallbackClassName,
          className
        )}
        role="img"
        aria-label={alt || "Image unavailable"}
      >
        <span className="font-display text-2xl font-light tracking-[0.2em] opacity-40">
          HOP
        </span>
        <span className="text-[10px] tracking-[0.25em] uppercase opacity-50">
          Image coming soon
        </span>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={safe}
        alt={alt || ""}
        fill
        sizes={sizes || "100vw"}
        className={className}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={safe}
      alt={alt || ""}
      width={width || 800}
      height={height || 1000}
      sizes={sizes}
      className={className}
      priority={priority}
    />
  );
}
