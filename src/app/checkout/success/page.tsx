"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  return (
    <div className="container-luxury py-28 text-center">
      <p className="mb-3 text-xs tracking-[0.3em] uppercase text-gold">
        Thank you
      </p>
      <h1 className="font-display text-4xl font-light tracking-wide md:text-5xl">
        Order placed
      </h1>
      {orderId && (
        <p className="mt-4 text-ink-muted">
          Your order reference is #{orderId}
        </p>
      )}
      <p className="mx-auto mt-4 max-w-md text-sm text-ink-muted">
        A confirmation will be sent to your email shortly.
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
        <div className="container-luxury py-28 text-center text-ink-muted">
          Loading…
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
