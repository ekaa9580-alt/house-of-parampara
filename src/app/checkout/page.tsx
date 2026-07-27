"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCart,
  useCheckout,
  usePaymentMethods,
} from "@/hooks/useWooCommerce";
import { formatPrice } from "@/lib/utils";
import { clientApi } from "@/lib/api/client";
import type {
  WooAddress,
  WooShippingPackage,
  WooShippingMethod,
} from "@/types/woocommerce";
import toast from "react-hot-toast";

const emptyAddress: WooAddress = {
  first_name: "",
  last_name: "",
  address_1: "",
  address_2: "",
  city: "",
  state: "",
  postcode: "",
  country: "IN",
  email: "",
  phone: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cart, isLoading, refetch: refetchCart } = useCart();
  const { data: methods } = usePaymentMethods();
  const checkout = useCheckout();

  const [billing, setBilling] = useState<WooAddress>(emptyAddress);
  const [shipping, setShipping] = useState<WooAddress>(emptyAddress);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [note, setNote] = useState("");
  const [packages, setPackages] = useState<WooShippingPackage[]>([]);
  const [selectedRateId, setSelectedRateId] = useState<string>("");
  const [selectedPackageId, setSelectedPackageId] = useState(0);
  const [ratesLoading, setRatesLoading] = useState(false);

  const minor = cart?.totals?.currency_minor_unit ?? 0;
  const symbol = cart?.totals?.currency_symbol;

  const setB = (key: keyof WooAddress, value: string) =>
    setBilling((b) => ({ ...b, [key]: value }));
  const setS = (key: keyof WooAddress, value: string) =>
    setShipping((s) => ({ ...s, [key]: value }));

  useEffect(() => {
    if (methods?.length && !methods.find((m) => m.id === paymentMethod)) {
      setPaymentMethod(methods[0].id);
    }
  }, [methods, paymentMethod]);

  const shipAddress = sameAsBilling ? billing : shipping;
  const addressReady =
    !!billing.first_name &&
    !!billing.last_name &&
    !!billing.address_1 &&
    !!billing.city &&
    !!billing.postcode &&
    !!billing.country &&
    !!shipAddress.address_1 &&
    !!shipAddress.city &&
    !!shipAddress.postcode &&
    !!shipAddress.country;

  useEffect(() => {
    if (!addressReady || !cart?.items?.length) return;
    let cancelled = false;
    const t = setTimeout(() => {
      setRatesLoading(true);
      clientApi
        .post("/cart/update-customer", {
          billing_address: billing,
          shipping_address: shipAddress,
        })
        .then(() => clientApi.get<WooShippingPackage[]>("/cart/shipping-rates"))
        .then(async (res) => {
          if (cancelled) return;
          const pkgs = Array.isArray(res.data) ? res.data : [];
          setPackages(pkgs);
          const first = pkgs[0];
          const rates = first?.shipping_rates || [];
          const preferred =
            rates.find((r) => r.selected) || rates[0] || null;
          if (preferred) {
            setSelectedRateId(preferred.rate_id);
            setSelectedPackageId(first?.package_id ?? 0);
            try {
              await clientApi.post("/cart/select-shipping-rate", {
                package_id: first?.package_id ?? 0,
                rate_id: preferred.rate_id,
              });
              refetchCart();
            } catch {
              /* rates may be optional */
            }
          }
        })
        .catch(() => {
          if (!cancelled) setPackages([]);
        })
        .finally(() => {
          if (!cancelled) setRatesLoading(false);
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [
    addressReady,
    billing,
    shipAddress,
    cart?.items?.length,
    refetchCart,
  ]);

  const selectRate = async (pkgId: number, rate: WooShippingMethod) => {
    setSelectedRateId(rate.rate_id);
    setSelectedPackageId(pkgId);
    try {
      await clientApi.post("/cart/select-shipping-rate", {
        package_id: pkgId,
        rate_id: rate.rate_id,
      });
      refetchCart();
    } catch {
      toast.error("Could not select shipping rate");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ship = sameAsBilling ? billing : shipping;
    checkout.mutate(
      {
        billing_address: billing,
        shipping_address: ship,
        payment_method: paymentMethod,
        customer_note: note,
        ...(selectedRateId
          ? {
              shipping_rate: {
                package_id: selectedPackageId,
                rate_id: selectedRateId,
              },
            }
          : {}),
      },
      {
        onSuccess: (data) => {
          toast.success(`Order #${data.order_id} placed`);
          const redirect = data.payment_result?.redirect_url;
          if (
            redirect &&
            redirect.startsWith("http") &&
            !redirect.includes("/orders")
          ) {
            window.location.href = redirect;
            return;
          }
          router.push(`/checkout/success?id=${data.order_id}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="py-12 md:py-16 text-ink-muted">Loading…</div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="py-12 md:py-16 text-center">
        <h1 className="font-display text-3xl font-light">Nothing to checkout</h1>
        <Link href="/shop" className="btn-primary mt-6 inline-flex">
          Shop Collection
        </Link>
      </div>
    );
  }

  const allRates = packages.flatMap((p) =>
    (p.shipping_rates || []).map((r) => ({ pkgId: p.package_id, rate: r }))
  );

  return (
    <div className="pb-12 pt-2 md:pb-16">
      <h1 className="section-heading mb-10">Checkout</h1>

      <form
        onSubmit={handleSubmit}
        className="grid gap-12 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-10">
          <section>
            <h2 className="mb-4 font-display text-xl font-light">
              Billing Details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className="input-field"
                required
                placeholder="First name"
                value={billing.first_name}
                onChange={(e) => setB("first_name", e.target.value)}
              />
              <input
                className="input-field"
                required
                placeholder="Last name"
                value={billing.last_name}
                onChange={(e) => setB("last_name", e.target.value)}
              />
              <input
                className="input-field sm:col-span-2"
                required
                type="email"
                placeholder="Email"
                value={billing.email}
                onChange={(e) => setB("email", e.target.value)}
              />
              <input
                className="input-field sm:col-span-2"
                required
                placeholder="Phone"
                value={billing.phone}
                onChange={(e) => setB("phone", e.target.value)}
              />
              <input
                className="input-field sm:col-span-2"
                required
                placeholder="Address"
                value={billing.address_1}
                onChange={(e) => setB("address_1", e.target.value)}
              />
              <input
                className="input-field"
                required
                placeholder="City"
                value={billing.city}
                onChange={(e) => setB("city", e.target.value)}
              />
              <input
                className="input-field"
                required
                placeholder="State"
                value={billing.state}
                onChange={(e) => setB("state", e.target.value)}
              />
              <input
                className="input-field"
                required
                placeholder="Postcode"
                value={billing.postcode}
                onChange={(e) => setB("postcode", e.target.value)}
              />
              <input
                className="input-field"
                required
                placeholder="Country"
                value={billing.country}
                onChange={(e) => setB("country", e.target.value)}
              />
            </div>
          </section>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sameAsBilling}
              onChange={(e) => setSameAsBilling(e.target.checked)}
            />
            Shipping address same as billing
          </label>

          {!sameAsBilling && (
            <section>
              <h2 className="mb-4 font-display text-xl font-light">
                Shipping Details
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  className="input-field"
                  required
                  placeholder="First name"
                  value={shipping.first_name}
                  onChange={(e) => setS("first_name", e.target.value)}
                />
                <input
                  className="input-field"
                  required
                  placeholder="Last name"
                  value={shipping.last_name}
                  onChange={(e) => setS("last_name", e.target.value)}
                />
                <input
                  className="input-field sm:col-span-2"
                  required
                  placeholder="Address"
                  value={shipping.address_1}
                  onChange={(e) => setS("address_1", e.target.value)}
                />
                <input
                  className="input-field"
                  required
                  placeholder="City"
                  value={shipping.city}
                  onChange={(e) => setS("city", e.target.value)}
                />
                <input
                  className="input-field"
                  required
                  placeholder="State"
                  value={shipping.state}
                  onChange={(e) => setS("state", e.target.value)}
                />
                <input
                  className="input-field"
                  required
                  placeholder="Postcode"
                  value={shipping.postcode}
                  onChange={(e) => setS("postcode", e.target.value)}
                />
                <input
                  className="input-field"
                  required
                  placeholder="Country"
                  value={shipping.country}
                  onChange={(e) => setS("country", e.target.value)}
                />
              </div>
            </section>
          )}

          {(ratesLoading || allRates.length > 0) && (
            <section>
              <h2 className="mb-4 font-display text-xl font-light">
                Shipping Method
              </h2>
              {ratesLoading && (
                <p className="text-sm text-ink-muted">Loading shipping…</p>
              )}
              <div className="space-y-3">
                {allRates.map(({ pkgId, rate }) => (
                  <label
                    key={`${pkgId}-${rate.rate_id}`}
                    className="flex cursor-pointer items-start gap-3 border border-brand-200 p-4 dark:border-brand-800"
                  >
                    <input
                      type="radio"
                      name="shipping"
                      checked={selectedRateId === rate.rate_id}
                      onChange={() => selectRate(pkgId, rate)}
                      className="mt-1"
                    />
                    <span className="flex flex-1 justify-between gap-4">
                      <span>
                        <span className="block text-sm font-medium">
                          {rate.name}
                        </span>
                        {(rate.description || rate.delivery_time) && (
                          <span className="text-xs text-ink-muted">
                            {rate.description || rate.delivery_time}
                          </span>
                        )}
                      </span>
                      <span className="text-sm">
                        {formatPrice(
                          rate.price,
                          rate.currency_symbol || symbol,
                          rate.currency_minor_unit ?? minor
                        )}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-4 font-display text-xl font-light">
              Payment Method
            </h2>
            <div className="space-y-3">
              {(methods || []).map((m) => (
                <label
                  key={m.id}
                  className="flex cursor-pointer items-start gap-3 border border-brand-200 p-4 dark:border-brand-800"
                >
                  <input
                    type="radio"
                    name="payment"
                    value={m.id}
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-medium">{m.title}</span>
                    {m.description && (
                      <span className="text-xs text-ink-muted">
                        {m.description}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <textarea
            className="input-field min-h-[80px]"
            placeholder="Order notes (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <aside className="h-fit border border-brand-200 bg-brand-50 p-6 dark:border-brand-800 dark:bg-brand-950">
          <h2 className="font-display text-xl font-light">Your Order</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {cart.items.map((item) => (
              <li key={item.key} className="flex justify-between gap-2">
                <span className="min-w-0">
                  {item.name} × {item.quantity}
                </span>
                <span className="shrink-0">
                  {formatPrice(
                    item.totals.line_total,
                    item.totals.currency_symbol,
                    item.totals.currency_minor_unit
                  )}
                </span>
              </li>
            ))}
          </ul>
          {parseFloat(cart.totals.total_shipping || "0") > 0 && (
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-ink-muted">Shipping</span>
              <span>
                {formatPrice(cart.totals.total_shipping, symbol, minor)}
              </span>
            </div>
          )}
          <div className="mt-4 flex justify-between border-t border-brand-200 pt-4 font-medium dark:border-brand-800">
            <span>Total</span>
            <span>
              {formatPrice(cart.totals.total_price, symbol, minor)}
            </span>
          </div>
          <button
            type="submit"
            disabled={checkout.isPending}
            className="btn-primary mt-6 w-full"
          >
            {checkout.isPending ? "Placing Order…" : "Place Order"}
          </button>
        </aside>
      </form>
    </div>
  );
}
