"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { useCustomer, useUpdateCustomer } from "@/hooks/useWooCommerce";

export default function MyAccountPage() {
  const router = useRouter();
  const { customerId, displayName, email, logout, isAuthenticated, token } =
    useAuthStore();
  const { data: customer } = useCustomer(customerId);
  const update = useUpdateCustomer();
  const [mounted, setMounted] = useState(false);

  const [billing, setBilling] = useState({
    first_name: "",
    last_name: "",
    address_1: "",
    city: "",
    state: "",
    postcode: "",
    country: "IN",
    phone: "",
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !token) router.replace("/login");
  }, [mounted, token, router]);

  useEffect(() => {
    if (customer?.billing) {
      setBilling({
        first_name: customer.billing.first_name || customer.first_name || "",
        last_name: customer.billing.last_name || customer.last_name || "",
        address_1: customer.billing.address_1 || "",
        city: customer.billing.city || "",
        state: customer.billing.state || "",
        postcode: customer.billing.postcode || "",
        country: customer.billing.country || "IN",
        phone: customer.billing.phone || "",
      });
    }
  }, [customer]);

  if (!mounted || !isAuthenticated()) {
    return (
      <div className="py-12 md:py-16 text-ink-muted">Loading…</div>
    );
  }

  return (
    <div className="pb-12 pt-2 md:pb-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="section-heading">My Account</h1>
          <p className="section-subheading">
            {displayName || email}
          </p>
        </div>
        <button
          type="button"
          className="btn-outline"
          onClick={() => {
            logout();
            router.push("/");
          }}
        >
          Logout
        </button>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <Link
          href="/orders"
          className="border border-brand-200 p-6 transition hover:border-royal dark:border-brand-800"
        >
          <h2 className="font-display text-xl font-light">Orders</h2>
          <p className="mt-2 text-sm text-ink-muted">View order history</p>
        </Link>
        <div className="border border-brand-200 p-6 dark:border-brand-800 md:col-span-2">
          <h2 className="font-display text-xl font-light">Addresses</h2>
          <form
            className="mt-4 grid gap-3 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!customerId) return;
              update.mutate({
                id: customerId,
                first_name: billing.first_name,
                last_name: billing.last_name,
                billing: {
                  ...billing,
                  email: email || "",
                },
                shipping: {
                  first_name: billing.first_name,
                  last_name: billing.last_name,
                  address_1: billing.address_1,
                  city: billing.city,
                  state: billing.state,
                  postcode: billing.postcode,
                  country: billing.country,
                },
              });
            }}
          >
            {(
              [
                ["first_name", "First name"],
                ["last_name", "Last name"],
                ["address_1", "Address"],
                ["city", "City"],
                ["state", "State"],
                ["postcode", "Postcode"],
                ["phone", "Phone"],
              ] as const
            ).map(([key, label]) => (
              <input
                key={key}
                className="input-field"
                placeholder={label}
                value={billing[key]}
                onChange={(e) =>
                  setBilling((b) => ({ ...b, [key]: e.target.value }))
                }
              />
            ))}
            <button type="submit" className="btn-primary sm:col-span-2">
              Save Address
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
