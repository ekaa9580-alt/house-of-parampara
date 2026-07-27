"use client";

import { useState } from "react";
import { useNewsletter, useSiteSettings } from "@/hooks/useWooCommerce";

/** Luxury coming-soon / notify block */
export function ComingSoon() {
  const { data: s } = useSiteSettings();
  const newsletter = useNewsletter();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const title = s?.home_sale_title || "Coming Soon";
  const subtitle =
    s?.home_sale_subtitle ||
    "New weaves and festive edits are on the way. Be first to know.";

  return (
    <section className="relative my-8 overflow-hidden bg-[#0f172a] py-14 text-cream md:my-12 md:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(30,58,138,0.35),_transparent_55%)]" />
      <div className="relative z-10 mx-auto max-w-2xl px-4 text-center">
        <p className="mb-3 text-[11px] tracking-[0.28em] uppercase text-blue-200/80">
          Preview
        </p>
        <h2 className="font-display text-4xl font-light tracking-wide md:text-5xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-cream/75 md:text-lg">
          {subtitle}
        </p>
        {done ? (
          <p className="mt-8 text-sm text-blue-200">You are on the list.</p>
        ) : (
          <form
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email) return;
              newsletter.mutate(email, {
                onSuccess: () => {
                  setEmail("");
                  setDone(true);
                },
              });
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="min-w-0 flex-1 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-base text-cream outline-none placeholder:text-cream/40 focus:border-blue-300"
            />
            <button
              type="submit"
              disabled={newsletter.isPending}
              className="shrink-0 rounded-full bg-[var(--cms-primary,#1E3A8A)] px-8 py-3 text-xs font-medium tracking-[0.18em] uppercase text-cream transition hover:brightness-110 disabled:opacity-50"
            >
              Notify Me
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
