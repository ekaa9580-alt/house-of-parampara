"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useUIStore } from "@/store";
import { useSearchProducts } from "@/hooks/useWooCommerce";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { formatPrice } from "@/lib/utils";
import { SafeImage } from "@/components/ui/SafeImage";

export function SearchOverlay() {
  const { isSearchOpen, setSearchOpen } = useUIStore();
  const [query, setQuery] = useState("");
  const { data: results, isFetching } = useSearchProducts(query);

  useBodyScrollLock(isSearchOpen);

  useEffect(() => {
    if (!isSearchOpen) setQuery("");
  }, [isSearchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] overflow-y-auto bg-cream/95 backdrop-blur-xl dark:bg-brand-950/95"
        >
          <div className="container-luxury pt-24 md:pt-32">
            <div className="mx-auto max-w-2xl">
              <div className="flex items-center gap-4 border-b border-ink/20 pb-4 dark:border-cream/20">
                <Search
                  className="h-6 w-6 shrink-0 text-ink-muted"
                  strokeWidth={1.5}
                />
                <input
                  autoFocus
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search the collection…"
                  className="w-full min-w-0 bg-transparent font-display text-2xl font-light outline-none placeholder:text-ink-muted/40 md:text-3xl"
                />
                <button
                  type="button"
                  aria-label="Close search"
                  onClick={() => setSearchOpen(false)}
                >
                  <X className="h-6 w-6" strokeWidth={1.5} />
                </button>
              </div>

              <div className="mt-8 max-h-[60vh] overflow-y-auto">
                {isFetching && (
                  <p className="text-sm text-ink-muted">Searching…</p>
                )}
                {!isFetching && query.length >= 2 && results?.length === 0 && (
                  <p className="text-sm text-ink-muted">
                    No results for &ldquo;{query}&rdquo;
                  </p>
                )}
                <ul className="space-y-4">
                  {results?.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/product/${product.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-4 transition-opacity hover:opacity-70"
                      >
                        <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-brand-100">
                          <SafeImage
                            src={product.images?.[0]?.src}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display text-lg font-light">
                            {product.name}
                          </p>
                          <p className="text-sm text-ink-muted">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
