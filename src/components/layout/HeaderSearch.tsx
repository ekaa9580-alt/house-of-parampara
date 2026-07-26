"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useSearchProducts, useCategories, useSiteSettings } from "@/hooks/useWooCommerce";
import { formatPrice, safeImageSrc, cn } from "@/lib/utils";
import { SafeImage } from "@/components/ui/SafeImage";

const RECENT_KEY = "hop-recent-searches";

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]").slice(0, 5);
  } catch {
    return [];
  }
}

function saveRecent(q: string) {
  const next = [q, ...loadRecent().filter((x) => x !== q)].slice(0, 5);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

/** Inline header search — never navigates to a search page or fullscreen overlay */
export function HeaderSearch({ className }: { className?: string }) {
  const { data: settings } = useSiteSettings();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: products, isFetching } = useSearchProducts(query);
  const { data: categories } = useCategories(0);

  const placeholder =
    settings?.search_placeholder ||
    "Search sarees, kurtas, kids, handicrafts...";

  const catMatches =
    query.trim().length >= 2
      ? (categories || [])
          .filter(
            (c) =>
              c.name.toLowerCase().includes(query.toLowerCase()) ||
              c.slug.includes(query.toLowerCase())
          )
          .slice(0, 4)
      : [];

  const suggestions = (products || []).slice(0, 6);

  useEffect(() => setRecent(loadRecent()), []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const totalItems = catMatches.length + suggestions.length;
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, totalItems - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && query.trim()) {
      saveRecent(query.trim());
      setRecent(loadRecent());
    }
  };

  return (
    <div ref={wrapRef} className={cn("relative w-full max-w-xl", className)}>
      <label className="sr-only" htmlFor="header-search">
        Search
      </label>
      <div className="relative flex items-center">
        <Search
          className="pointer-events-none absolute left-3.5 h-4 w-4 text-ink-muted"
          strokeWidth={1.5}
          aria-hidden
        />
        <input
          id="header-search"
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls="header-search-listbox"
          aria-autocomplete="list"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full rounded-full border border-brand-200/80 bg-white/90 py-2.5 pl-10 pr-10 text-sm text-ink outline-none transition placeholder:text-ink-muted/55 focus:border-[var(--cms-primary,#1E3A8A)] focus:ring-2 focus:ring-[var(--cms-primary,#1E3A8A)]/15 dark:border-brand-700 dark:bg-brand-900/80 dark:text-cream"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            className="absolute right-3 text-ink-muted hover:text-ink"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (query.trim().length >= 2 || recent.length > 0) && (
        <div
          id="header-search-listbox"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-[60] max-h-[70vh] overflow-y-auto rounded-2xl border border-brand-200/80 bg-cream/98 py-2 shadow-lift backdrop-blur-xl dark:border-brand-700 dark:bg-brand-950/98"
        >
          {!query.trim() && recent.length > 0 && (
            <div className="px-3 py-2">
              <p className="mb-1.5 px-1 text-[10px] font-medium tracking-[0.2em] uppercase text-ink-muted">
                Recent
              </p>
              {recent.map((r) => (
                <button
                  key={r}
                  type="button"
                  className="block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-brand-100 dark:hover:bg-brand-900"
                  onClick={() => {
                    setQuery(r);
                    setOpen(true);
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          {query.trim().length >= 2 && (
            <>
              {isFetching && (
                <p className="px-4 py-3 text-xs text-ink-muted">Searching…</p>
              )}
              {catMatches.length > 0 && (
                <div className="border-t border-brand-200/60 px-3 py-2 dark:border-brand-800">
                  <p className="mb-1.5 px-1 text-[10px] font-medium tracking-[0.2em] uppercase text-ink-muted">
                    Categories
                  </p>
                  {catMatches.map((c, i) => (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
                      role="option"
                      aria-selected={active === i}
                      className={cn(
                        "block rounded-lg px-2 py-2 text-sm hover:bg-brand-100 dark:hover:bg-brand-900",
                        active === i && "bg-brand-100 dark:bg-brand-900"
                      )}
                      onClick={() => {
                        saveRecent(query.trim());
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
              {suggestions.length > 0 && (
                <div className="border-t border-brand-200/60 px-3 py-2 dark:border-brand-800">
                  <p className="mb-1.5 px-1 text-[10px] font-medium tracking-[0.2em] uppercase text-ink-muted">
                    Products
                  </p>
                  {suggestions.map((p, i) => {
                    const idx = catMatches.length + i;
                    return (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}`}
                        role="option"
                        aria-selected={active === idx}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-brand-100 dark:hover:bg-brand-900",
                          active === idx && "bg-brand-100 dark:bg-brand-900"
                        )}
                        onClick={() => {
                          saveRecent(query.trim());
                          setOpen(false);
                          setQuery("");
                        }}
                      >
                        <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-brand-100 dark:bg-brand-900">
                          {safeImageSrc(p.images?.[0]?.src) ? (
                            <SafeImage
                              src={p.images[0].src}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-base font-light">
                            {p.name}
                          </p>
                          <p className="text-xs text-ink-muted">
                            {formatPrice(p.price)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
              {!isFetching &&
                catMatches.length === 0 &&
                suggestions.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-ink-muted">
                    No matches
                  </p>
                )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
