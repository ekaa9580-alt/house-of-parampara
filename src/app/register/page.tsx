"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRegister } from "@/hooks/useWooCommerce";

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate(
      {
        email: form.email,
        username: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
      },
      {
        onSuccess: () => router.push("/login"),
      }
    );
  };

  return (
    <div className="container-luxury flex min-h-[70vh] items-center justify-center py-28">
      <div className="w-full max-w-md">
        <h1 className="text-center font-display text-4xl font-light">
          Create Account
        </h1>
        <p className="mt-2 text-center text-sm text-ink-muted">
          Join the House of Parampara circle
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              className="input-field"
              placeholder="First name"
              value={form.first_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, first_name: e.target.value }))
              }
            />
            <input
              className="input-field"
              placeholder="Last name"
              value={form.last_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, last_name: e.target.value }))
              }
            />
          </div>
          <input
            className="input-field"
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <input
            className="input-field"
            required
            type="password"
            placeholder="Password"
            minLength={6}
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
          />
          <button
            type="submit"
            disabled={register.isPending}
            className="btn-primary w-full"
          >
            {register.isPending ? "Creating…" : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="link-underline text-ink dark:text-cream">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
