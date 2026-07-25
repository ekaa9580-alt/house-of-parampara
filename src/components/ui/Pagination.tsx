"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  basePath?: string;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  basePath,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  const renderPage = (p: number, i: number, arr: number[]) => {
    const showEllipsis = i > 0 && p - arr[i - 1] > 1;
    const isActive = p === page;

    const content = (
      <motion.span
        whileHover={{ y: -1 }}
        className={cn(
          "inline-flex h-10 min-w-10 items-center justify-center px-3 text-sm transition-colors",
          isActive
            ? "bg-ink text-cream dark:bg-cream dark:text-ink"
            : "text-ink-muted hover:text-ink dark:hover:text-cream"
        )}
      >
        {p}
      </motion.span>
    );

    return (
      <span key={p} className="flex items-center">
        {showEllipsis && (
          <span className="px-2 text-ink-muted">…</span>
        )}
        {basePath ? (
          <Link
            href={`${basePath}${basePath.includes("?") ? "&" : "?"}page=${p}`}
            aria-current={isActive ? "page" : undefined}
            aria-label={`Page ${p}`}
          >
            {content}
          </Link>
        ) : (
          <button
            type="button"
            aria-current={isActive ? "page" : undefined}
            aria-label={`Page ${p}`}
            onClick={() => onPageChange?.(p)}
          >
            {content}
          </button>
        )}
      </span>
    );
  };

  return (
    <div
      className={cn(
        "mt-12 flex items-center justify-center gap-1",
        className
      )}
    >
      {pages.map(renderPage)}
    </div>
  );
}
