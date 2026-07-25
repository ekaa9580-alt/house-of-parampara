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
          "flex h-full w-full items-center justify-center bg-brand-100 text-xs tracking-wider text-brand-400 uppercase dark:bg-brand-900 dark:text-brand-500",
          fill && "absolute inset-0",
          fallbackClassName,
          className
        )}
        role="img"
        aria-label={alt || "No image"}
      >
        No image
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
