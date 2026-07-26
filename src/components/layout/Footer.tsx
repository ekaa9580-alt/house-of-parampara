"use client";

import { useState } from "react";
import Link from "next/link";
import { Facebook, Instagram, MessageCircle, Youtube } from "lucide-react";
import { useNewsletter, useSiteSettings, useMenu } from "@/hooks/useWooCommerce";
import type { CmsMenuItem } from "@/types/woocommerce";

export function Footer() {
  const { data: settings } = useSiteSettings();
  const { data: quickLinks = [] } = useMenu("footer");
  const { data: policyLinks = [] } = useMenu("footer_policies");
  const newsletter = useNewsletter();
  const [email, setEmail] = useState("");

  const brand = settings?.site_name || "HOUSE OF PARAMPARA";
  const cats = [
    { href: "/shop?search=Women", label: "Women" },
    { href: "/shop?search=Men", label: "Men" },
    { href: "/shop?search=Kids", label: "Kids" },
    { href: "/shop?search=Handicrafts", label: "Handicrafts" },
  ];
  const service: CmsMenuItem[] =
    policyLinks.length > 0
      ? policyLinks
      : [
          { id: 1, title: "Privacy", url: "/privacy-policy" },
          { id: 2, title: "Shipping", url: "/shipping-policy" },
          { id: 3, title: "Returns", url: "/return-policy" },
          { id: 4, title: "Refund", url: "/refund-policy" },
          { id: 5, title: "Terms", url: "/terms" },
        ];

  return (
    <footer className="border-t border-brand-200 bg-[#f8f6f2] dark:border-brand-800 dark:bg-brand-950">
      <div className="border-b border-brand-200 dark:border-brand-800">
        <div className="container-luxury flex flex-col items-center gap-6 py-14 text-center md:py-20">
          <h2 className="font-display text-3xl font-light tracking-wide md:text-4xl">
            {settings?.newsletter_heading || "Stay in the circle"}
          </h2>
          {settings?.newsletter_text && (
            <p className="max-w-md text-sm text-ink-muted">
              {settings.newsletter_text}
            </p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!email) return;
              newsletter.mutate(email, { onSuccess: () => setEmail("") });
            }}
            className="flex w-full max-w-lg flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="min-w-0 flex-1 rounded-full border border-brand-200 bg-white px-5 py-3.5 text-sm outline-none focus:border-[var(--cms-primary,#1E3A8A)] dark:border-brand-700 dark:bg-brand-900"
            />
            <button
              type="submit"
              disabled={newsletter.isPending}
              className="shrink-0 rounded-full bg-[var(--cms-primary,#1E3A8A)] px-8 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-cream transition hover:brightness-110 disabled:opacity-50"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="container-luxury grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-display text-lg font-medium tracking-[0.06em] text-[var(--cms-primary,#1E3A8A)]">
            {brand.toUpperCase().includes("PARAMPARA")
              ? brand.toUpperCase()
              : "HOUSE OF PARAMPARA"}
          </h3>
          {settings?.tagline && (
            <p className="mt-2 text-xs tracking-[0.16em] uppercase text-ink-muted">
              {settings.tagline}
            </p>
          )}
          {settings?.about_preview && (
            <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-ink-muted">
              {settings.about_preview}
            </p>
          )}
          <div className="mt-5 flex gap-3">
            {settings?.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram
                  className="h-5 w-5 text-ink-muted transition hover:text-[var(--cms-primary,#1E3A8A)]"
                  strokeWidth={1.5}
                />
              </a>
            )}
            {settings?.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <MessageCircle
                  className="h-5 w-5 text-ink-muted transition hover:text-[var(--cms-primary,#1E3A8A)]"
                  strokeWidth={1.5}
                />
              </a>
            )}
            {settings?.facebook && (
              <a
                href={settings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook
                  className="h-5 w-5 text-ink-muted transition hover:text-[var(--cms-primary,#1E3A8A)]"
                  strokeWidth={1.5}
                />
              </a>
            )}
            {settings?.youtube && (
              <a
                href={settings.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <Youtube
                  className="h-5 w-5 text-ink-muted transition hover:text-[var(--cms-primary,#1E3A8A)]"
                  strokeWidth={1.5}
                />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-medium tracking-[0.2em] uppercase text-ink">
            Categories
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
            {(quickLinks.length
              ? quickLinks.map((i) => ({ href: i.url, label: i.title }))
              : cats
            ).map((c) => (
              <li key={c.label}>
                <Link
                  href={c.href || "/shop"}
                  className="transition hover:text-[var(--cms-primary,#1E3A8A)]"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-medium tracking-[0.2em] uppercase text-ink">
            Customer Service
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
            {service.map((p) => (
              <li key={p.id}>
                <Link
                  href={p.url || "/"}
                  className="transition hover:text-[var(--cms-primary,#1E3A8A)]"
                >
                  {p.title}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/faq"
                className="transition hover:text-[var(--cms-primary,#1E3A8A)]"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="transition hover:text-[var(--cms-primary,#1E3A8A)]"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-medium tracking-[0.2em] uppercase text-ink">
            Contact
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
            {settings?.contact_email && (
              <li>
                <a href={`mailto:${settings.contact_email}`}>
                  {settings.contact_email}
                </a>
              </li>
            )}
            {settings?.contact_phone && (
              <li>
                <a href={`tel:${settings.contact_phone}`}>
                  {settings.contact_phone}
                </a>
              </li>
            )}
            {settings?.working_hours && <li>{settings.working_hours}</li>}
            {settings?.address && <li>{settings.address}</li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-200 py-5 dark:border-brand-800">
        <div className="container-luxury flex flex-col items-center justify-between gap-2 text-xs text-ink-muted sm:flex-row">
          <p>
            {settings?.footer_copyright ||
              `© ${new Date().getFullYear()} HOUSE OF PARAMPARA`}
          </p>
          {settings?.footer_tagline && <p>{settings.footer_tagline}</p>}
        </div>
      </div>
    </footer>
  );
}
