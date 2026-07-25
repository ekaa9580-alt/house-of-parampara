"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/useWooCommerce";
import { useAuthStore } from "@/store";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { username, password },
      {
        onSuccess: (data) => {
          setAuth({
            token: data.token,
            customerId: data.customerId,
            email: data.user_email,
            displayName: data.user_display_name,
          });
          toast.success("Welcome back");
          router.push("/my-account");
        },
      }
    );
  };

  return (
    <div className="container-luxury flex min-h-[70vh] items-center justify-center py-28">
      <div className="w-full max-w-md">
        <h1 className="text-center font-display text-4xl font-light">
          Welcome Back
        </h1>
        <p className="mt-2 text-center text-sm text-ink-muted">
          Sign in to your House of Parampara account
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
          <input
            className="input-field"
            required
            type="text"
            placeholder="Email or username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <input
            className="input-field"
            required
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button
            type="submit"
            disabled={login.isPending}
            className="btn-primary w-full"
          >
            {login.isPending ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          <Link href="/register" className="link-underline text-ink dark:text-cream">
            Create account
          </Link>
          {" · "}
          <Link href="/login/forgot-password" className="link-underline">
            Forgot password
          </Link>
        </p>
        <p className="mt-4 text-center text-[11px] text-ink-muted">
          Mock mode: any email + password (4+ chars)
        </p>
      </div>
    </div>
  );
}
