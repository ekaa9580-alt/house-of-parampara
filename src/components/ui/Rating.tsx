"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  rating: number | string;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}

export function Rating({ rating, count, size = "sm", className }: RatingProps) {
  const value = typeof rating === "string" ? parseFloat(rating) : rating;
  if (!value && !count) return null;

  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              i < Math.round(value)
                ? "fill-gold text-gold"
                : "fill-transparent text-brand-300"
            )}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-ink-muted">({count})</span>
      )}
    </div>
  );
}
