"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useApplyCoupon,
  useRemoveCoupon,
} from "@/hooks/useWooCommerce";
import { formatPrice, cartItemHref } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SafeImage } from "@/components/ui/SafeImage";
import { useState, useRef, useCallback } from "react";

function useDebouncedQuantity(
  updateItem: ReturnType<typeof useUpdateCartItem>
) {
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pending = useRef<Record<string, number>>({});

  const schedule = useCallback(
    (key: string, quantity: number) => {
      pending.current[key] = quantity;
      if (timers.current[key]) clearTimeout(timers.current[key]);
      timers.current[key] = setTimeout(() => {
        updateItem.mutate({ key, quantity: pending.current[key] });
        delete timers.current[key];
        delete pending.current[key];
      }, 400);
    },
    [updateItem]
  );

  return { schedule, pending };
}

export default function CartPage() {
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();
  const [code, setCode] = useState("");
  const { schedule: scheduleUpdate } = useDebouncedQuantity(updateItem);
  const [localQty, setLocalQty] = useState<Record<string, number>>({});

  const minor = cart?.totals?.currency_minor_unit ?? 0;
  const symbol = cart?.totals?.currency_symbol;

  return (
    <div className="pb-12 pt-2 md:pb-16">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Bag" }]}
        className="mb-6"
      />
      <h1 className="section-heading mb-10">Your Bag</h1>

      {isLoading && <p className="text-ink-muted">Loading…</p>}

      {!isLoading && (!cart?.items || cart.items.length === 0) && (
        <div className="py-20 text-center">
          <p className="font-display text-2xl font-light">Your bag is empty</p>
          <Link href="/shop" className="btn-primary mt-6 inline-flex">
            Continue Shopping
          </Link>
        </div>
      )}

      {cart && cart.items.length > 0 && (
        <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
          <ul className="divide-y divide-brand-200 dark:divide-brand-800">
            {cart.items.map((item) => (
              <li key={item.key} className="flex gap-4 py-6">
                <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-brand-100">
                  <SafeImage
                    src={item.images?.[0]?.src}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <Link
                      href={cartItemHref(item.permalink)}
                      className="font-display text-lg font-light"
                    >
                      {item.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeItem.mutate(item.key)}
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4 text-ink-muted" />
                    </button>
                  </div>
                  <p className="mt-1 text-sm">
                    {formatPrice(
                      item.prices.price,
                      item.prices.currency_symbol,
                      item.prices.currency_minor_unit
                    )}
                  </p>
                  <div className="mt-auto flex items-center gap-3 pt-3">
                    <div className="flex items-center border border-brand-200 dark:border-brand-700">
                      <button
                        type="button"
                        className="px-3 py-1.5"
                        onClick={() => {
                          const cur = localQty[item.key] ?? item.quantity;
                          const next = Math.max(1, cur - 1);
                          setLocalQty((q) => ({ ...q, [item.key]: next }));
                          scheduleUpdate(item.key, next);
                        }}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="min-w-[2ch] text-center text-sm">
                        {localQty[item.key] ?? item.quantity}
                      </span>
                      <button
                        type="button"
                        className="px-3 py-1.5"
                        onClick={() => {
                          const cur = localQty[item.key] ?? item.quantity;
                          const next = cur + 1;
                          setLocalQty((q) => ({ ...q, [item.key]: next }));
                          scheduleUpdate(item.key, next);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="ml-auto text-sm font-medium">
                      {formatPrice(
                        item.totals.line_total,
                        item.totals.currency_symbol,
                        item.totals.currency_minor_unit
                      )}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit border border-brand-200 bg-brand-50 p-6 dark:border-brand-800 dark:bg-brand-950">
            <h2 className="font-display text-xl font-light">Summary</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Subtotal</dt>
                <dd>
                  {formatPrice(cart.totals.total_items, symbol, minor)}
                </dd>
              </div>
              {parseFloat(cart.totals.total_discount) > 0 && (
                <div className="flex justify-between text-royal">
                  <dt>Discount</dt>
                  <dd>
                    −
                    {formatPrice(cart.totals.total_discount, symbol, minor)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between border-t border-brand-200 pt-3 text-base font-medium dark:border-brand-800">
                <dt>Total</dt>
                <dd>
                  {formatPrice(cart.totals.total_price, symbol, minor)}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              {cart.coupons?.length > 0 ? (
                <div className="space-y-2">
                  {cart.coupons.map((c) => (
                    <div
                      key={c.code}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-royal">{c.code}</span>
                      <button
                        type="button"
                        className="text-xs text-ink-muted underline"
                        onClick={() => removeCoupon.mutate(c.code)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <form
                  className="flex gap-0"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (code) applyCoupon.mutate(code);
                  }}
                >
                  <input
                    className="input-field flex-1 border-r-0 py-2.5"
                    placeholder="Coupon code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                  <button type="submit" className="btn-outline px-4 py-2.5">
                    Apply
                  </button>
                </form>
              )}
              <p className="mt-2 text-[11px] text-ink-muted">
                Mock coupon: PARAMPARA10
              </p>
            </div>

            <Link href="/checkout" className="btn-primary mt-6 w-full">
              Checkout
            </Link>
            <Link
              href="/shop"
              className="mt-3 block text-center text-xs tracking-wider uppercase text-ink-muted hover:text-ink"
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
