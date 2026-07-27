"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuthStore } from "@/store";
import { useOrders } from "@/hooks/useWooCommerce";
import { formatPrice } from "@/lib/utils";

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customerId, token, isAuthenticated } = useAuthStore();
  const { data, isLoading } = useOrders(customerId);
  const [mounted, setMounted] = useState(false);
  const ordered = searchParams.get("ordered");

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && !token) router.replace("/login");
  }, [mounted, token, router]);

  if (!mounted || !isAuthenticated()) {
    return (
      <div className="py-12 md:py-16 text-ink-muted">Loading…</div>
    );
  }

  return (
    <div className="pb-12 pt-2 md:pb-16">
      <h1 className="section-heading mb-4">Orders</h1>
      {ordered && (
        <p className="mb-8 border border-royal/30 bg-royal/5 px-4 py-3 text-sm text-royal">
          Thank you — your order has been placed successfully.
        </p>
      )}

      {isLoading && <p className="text-ink-muted">Loading orders…</p>}

      {!isLoading && (!data?.orders || data.orders.length === 0) && (
        <div className="py-16 text-center">
          <p className="font-display text-2xl font-light">No orders yet</p>
          <Link href="/shop" className="btn-primary mt-6 inline-flex">
            Start Shopping
          </Link>
        </div>
      )}

      <ul className="divide-y divide-brand-200 dark:divide-brand-800">
        {data?.orders?.map((order) => (
          <li key={order.id} className="flex flex-wrap items-center justify-between gap-4 py-6">
            <div>
              <p className="font-medium">Order #{order.id}</p>
              <p className="text-sm text-ink-muted">
                {new Date(order.date_created).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {" · "}
                <span className="capitalize">{order.status}</span>
              </p>
              <p className="mt-1 text-sm">
                {order.line_items.map((i) => i.name).join(", ")}
              </p>
            </div>
            <p className="font-medium">
              {formatPrice(order.total, "₹")}
            </p>
          </li>
        ))}
      </ul>

      <Link
        href="/my-account"
        className="mt-8 inline-block text-sm text-ink-muted hover:text-ink"
      >
        ← Back to account
      </Link>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 md:py-16 text-ink-muted">Loading…</div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
