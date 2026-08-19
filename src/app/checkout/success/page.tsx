"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type OrderLookup = {
  order_id: number;
  number: string;
  status: string;
  paid: boolean;
  needs_payment?: boolean;
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const orderKey = searchParams.get("key") || "";
  const [lookup, setLookup] = useState<OrderLookup | null>(null);

  useEffect(() => {
    if (!orderId || !orderKey) return;
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 20;

    const tick = async () => {
      try {
        const res = await fetch(
          `/api/orders/lookup?id=${encodeURIComponent(orderId)}&key=${encodeURIComponent(orderKey)}`,
          { cache: "no-store" }
        );
        if (!res.ok) return false;
        const data = (await res.json()) as OrderLookup;
        if (cancelled) return true;
        setLookup(data);
        return data.paid;
      } catch {
        return false;
      }
    };

    const run = async () => {
      const paid = await tick();
      if (paid || cancelled) return;
      const timer = setInterval(async () => {
        attempts += 1;
        const done = await tick();
        if (done || attempts >= maxAttempts) {
          clearInterval(timer);
        }
      }, 2000);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [orderId, orderKey]);

  const displayId = lookup?.number || orderId;
  const paid = !!lookup?.paid;

  return (
    <div className="py-12 md:py-16 text-center">
      <p className="mb-3 text-xs tracking-[0.3em] uppercase text-gold">
        Thank you
      </p>
      <h1 className="font-display text-4xl font-light tracking-wide md:text-5xl">
        {paid ? "Payment received" : "Order received"}
      </h1>
      {displayId && (
        <p className="mt-4 text-ink-muted">
          Your order reference is #{displayId}
        </p>
      )}
      <p className="mx-auto mt-4 max-w-md text-sm text-ink-muted">
        {paid
          ? "Your payment was confirmed. A confirmation email will arrive shortly."
          : "If you chose an online payment method, your order is confirmed only after Razorpay payment succeeds. Pending Payment orders are not yet paid."}
      </p>
      <Link href="/shop" className="btn-primary mt-10 inline-flex">
        Continue Shopping
      </Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 md:py-16 text-center text-ink-muted">
          Loading…
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
