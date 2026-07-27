"use client";

import { useState } from "react";
import Link from "next/link";
import { clientApi, parseApiError } from "@/lib/api/client";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      await clientApi.post("/auth/forgot-password", { email });
      setDone(true);
      toast.success("Check your email for reset instructions");
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-12 md:py-16">
      <div className="w-full max-w-md text-center">
        <h1 className="font-display text-4xl font-light">Reset Password</h1>
        {done ? (
          <p className="mt-6 text-ink-muted">
            If an account exists for {email}, a reset link has been sent.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-4 text-left">
            <input
              className="input-field"
              required
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              disabled={pending}
              className="btn-primary w-full"
            >
              {pending ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        )}
        <Link
          href="/login"
          className="mt-6 inline-block text-sm text-ink-muted hover:text-ink"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
