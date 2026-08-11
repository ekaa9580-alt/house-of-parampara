"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useUIStore } from "@/store";
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
} from "@/hooks/useWooCommerce";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { formatPrice, cartItemHref } from "@/lib/utils";
import { SafeImage } from "@/components/ui/SafeImage";

function useDebouncedQty(updateItem: ReturnType<typeof useUpdateCartItem>) {
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const schedule = useCallback(
    (key: string, quantity: number) => {
      if (timers.current[key]) clearTimeout(timers.current[key]);
      timers.current[key] = setTimeout(() => {
        updateItem.mutate({ key, quantity });
        delete timers.current[key];
      }, 400);
    },
    [updateItem]
  );
  return schedule;
}

export function CartDrawer() {
  const { isCartDrawerOpen, setCartDrawerOpen } = useUIStore();
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const scheduleQty = useDebouncedQty(updateItem);
  const [localQty, setLocalQty] = useState<Record<string, number>>({});
  const removeItem = useRemoveCartItem();

  useBodyScrollLock(isCartDrawerOpen);

  useEffect(() => {
    if (!isCartDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCartDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isCartDrawerOpen, setCartDrawerOpen]);

  const minor = cart?.totals?.currency_minor_unit ?? 0;
  const symbol = cart?.totals?.currency_symbol;

  return (
    <AnimatePresence>
      {isCartDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-ink/40 backdrop-blur-sm"
            onClick={() => setCartDrawerOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-[56] flex w-full max-w-md flex-col bg-cream shadow-lift dark:bg-brand-950"
          >
            <div className="flex items-center justify-between border-b border-brand-200 px-6 py-5 dark:border-brand-800">
              <h2 className="font-display text-xl font-bold tracking-wide">
                Your Bag
                {cart?.items_count ? ` (${cart.items_count})` : ""}
              </h2>
              <button
                type="button"
                aria-label="Close cart"
                onClick={() => setCartDrawerOpen(false)}
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {isLoading && (
                <p className="text-sm text-ink-muted">Loading bag…</p>
              )}
              {!isLoading && (!cart?.items || cart.items.length === 0) && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="font-display text-2xl font-light">
                    Your bag is empty
                  </p>
                  <Link
                    href="/shop"
                    onClick={() => setCartDrawerOpen(false)}
                    className="btn-primary mt-6"
                  >
                    Continue Shopping
                  </Link>
                </div>
              )}

              <ul className="space-y-6">
                {cart?.items?.map((item) => (
                  <li key={item.key} className="flex gap-4">
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-brand-100">
                      <SafeImage
                        src={item.images?.[0]?.src}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <Link
                          href={cartItemHref(item.permalink)}
                          onClick={() => setCartDrawerOpen(false)}
                          className="font-display text-base font-light leading-snug"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          aria-label="Remove"
                          onClick={() => removeItem.mutate(item.key)}
                          className="shrink-0 text-ink-muted hover:text-ink"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-sm">
                        {formatPrice(
                          item.prices.price,
                          item.prices.currency_symbol,
                          item.prices.currency_minor_unit
                        )}
                      </p>
                      <div className="mt-auto flex items-center gap-3 pt-2">
                        <div className="flex items-center border border-brand-200 dark:border-brand-700">
                          <button
                            type="button"
                            aria-label="Decrease"
                            className="px-2 py-1"
                            onClick={() => {
                              const cur = localQty[item.key] ?? item.quantity;
                              const next = Math.max(1, cur - 1);
                              setLocalQty((q) => ({ ...q, [item.key]: next }));
                              scheduleQty(item.key, next);
                            }}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[2ch] text-center text-sm">
                            {localQty[item.key] ?? item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase"
                            className="px-2 py-1"
                            onClick={() => {
                              const cur = localQty[item.key] ?? item.quantity;
                              const next = cur + 1;
                              setLocalQty((q) => ({ ...q, [item.key]: next }));
                              scheduleQty(item.key, next);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {cart && cart.items.length > 0 && (
              <div className="border-t border-brand-200 px-6 py-6 dark:border-brand-800">
                <div className="mb-4 flex justify-between text-sm">
                  <span className="text-ink-muted">Subtotal</span>
                  <span className="font-medium">
                    {formatPrice(cart.totals.total_items, symbol, minor)}
                  </span>
                </div>
                <p className="mb-4 text-xs text-ink-muted">
                  Shipping & taxes calculated at checkout
                </p>
                <Link
                  href="/cart"
                  onClick={() => setCartDrawerOpen(false)}
                  className="btn-outline mb-3 w-full"
                >
                  View Bag
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setCartDrawerOpen(false)}
                  className="btn-primary w-full"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
