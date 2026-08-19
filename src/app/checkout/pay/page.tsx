"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { buildOrderPayUrl, getWcPublicBaseUrl } from "@/lib/checkout-payment";

function PayContent() {
  const searchParams = useSearchParams();
  const orderId = Number(searchParams.get("id") || 0);
  const orderKey = searchParams.get("key") || "";
  const [failed, setFailed] = useState(false);

  const payUrl = useMemo(() => {
    if (!orderId || !orderKey) return "";
    return buildOrderPayUrl(
      orderId,
      orderKey,
      getWcPublicBaseUrl(),
      typeof window !== "undefined" ? window.location.origin : undefined
    );
  }, [orderId, orderKey]);

  useEffect(() => {
    if (!payUrl) {
      setFailed(true);
      return;
    }
    // Full navigation so WooCommerce + Razorpay scripts load on order-pay.
    window.location.assign(payUrl);
    const t = setTimeout(() => setFailed(true), 4000);
    return () => clearTimeout(t);
  }, [payUrl]);

  if (!orderId || !orderKey) {
    return (
      <div className="py-12 md:py-16 text-center">
        <h1 className="font-display text-3xl font-light">Payment required</h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-ink-muted">
          Missing order details. Please return to checkout and try again.
        </p>
        <Link href="/checkout" className="btn-primary mt-8 inline-flex">
          Back to Checkout
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16 text-center">
      <p className="mb-3 text-xs tracking-[0.3em] uppercase text-gold">
        Secure payment
      </p>
      <h1 className="font-display text-3xl font-light md:text-4xl">
        Opening Razorpay…
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-ink-muted">
        Order #{orderId} is unpaid until you complete UPI / Card / Net Banking
        in Razorpay. Do not close this window.
      </p>
      {failed && payUrl && (
        <a href={payUrl} className="btn-primary mt-8 inline-flex">
          Continue to Payment
        </a>
      )}
      <p className="mt-6 text-xs text-ink-muted">
        If payment is cancelled, your order stays Pending Payment.
      </p>
    </div>
  );
}

export default function CheckoutPayPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 md:py-16 text-center text-ink-muted">
          Preparing payment…
        </div>
      }
    >
      <PayContent />
    </Suspense>
  );
}
