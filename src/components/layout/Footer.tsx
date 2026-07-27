"use client";

import { useState } from "react";
import Link from "next/link";
import { Facebook, Instagram, MessageCircle, Youtube } from "lucide-react";
import { useNewsletter, useSiteSettings, useMenu } from "@/hooks/useWooCommerce";
import { SafeImage } from "@/components/ui/SafeImage";
import { safeImageSrc } from "@/lib/utils";
import {
  BUSINESS_EMAIL,
  BUSINESS_INSTAGRAM,
  BUSINESS_PHONE,
  BUSINESS_WHATSAPP,
} from "@/lib/site-contact";
import type { CmsMenuItem } from "@/types/woocommerce";

const DEFAULT_CATEGORIES = [
  { href: "/shop?search=Women", label: "Women" },
  { href: "/shop?search=Men", label: "Men" },
  { href: "/shop?search=Kids", label: "Kids" },
  { href: "/shop?search=Handicrafts", label: "Handicrafts" },
  { href: "/shop", label: "Shop All" },
];

const DEFAULT_SERVICE: CmsMenuItem[] = [
  { id: 1, title: "Privacy Policy", url: "/privacy-policy" },
  { id: 2, title: "Shipping Policy", url: "/shipping-policy" },
  { id: 3, title: "Returns & Refunds", url: "/return-policy" },
  { id: 4, title: "Terms of Service", url: "/terms" },
  { id: 5, title: "FAQ", url: "/faq" },
  { id: 6, title: "Contact", url: "/contact" },
];

export function Footer() {
  const { data: settings } = useSiteSettings();
  const { data: quickLinks = [] } = useMenu("footer");
  const { data: policyLinks = [] } = useMenu("footer_policies");
  const newsletter = useNewsletter();
  const [email, setEmail] = useState("");

  const brand = settings?.site_name || "HOUSE OF PARAMPARA";
  const logo = settings?.logo;
  const contactEmail = BUSINESS_EMAIL;
  const contactPhone = BUSINESS_PHONE || settings?.contact_phone;
  const instagramUrl =
    settings?.instagram || BUSINESS_INSTAGRAM;
  const whatsappRaw = settings?.whatsapp || BUSINESS_WHATSAPP;
  const whatsappUrl = whatsappRaw
    ? whatsappRaw.startsWith("http")
      ? whatsappRaw
      : `https://wa.me/${whatsappRaw}`
    : null;

  const categories = quickLinks.length
    ? quickLinks.map((i) => ({ href: i.url, label: i.title }))
    : DEFAULT_CATEGORIES;
  const service = policyLinks.length > 0 ? policyLinks : DEFAULT_SERVICE;

  return (
    <footer className="border-t border-brand-200 bg-[#f8f6f2] dark:border-brand-800 dark:bg-brand-950">
      <div className="border-b border-brand-200 dark:border-brand-800">
        <div className="mx-auto flex w-full max-w-[90rem] flex-col items-center gap-5 px-4 py-12 text-center sm:px-5 md:py-14">
          <h2 className="font-display text-3xl font-light tracking-wide text-ink md:text-4xl dark:text-cream">
            {settings?.newsletter_heading || "Stay in the circle"}
          </h2>
          <p className="max-w-md text-base text-ink-soft">
            {settings?.newsletter_text ||
              "New arrivals, heritage edits, and exclusive offers — delivered thoughtfully."}
          </p>
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
              className="min-w-0 flex-1 rounded-full border border-brand-200 bg-white px-5 py-3.5 text-base text-ink outline-none placeholder:text-ink-soft/50 focus:border-[var(--cms-primary,#1E3A8A)] dark:border-brand-700 dark:bg-brand-900 dark:text-cream"
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

      <div className="mx-auto grid w-full max-w-[90rem] gap-8 px-4 py-10 sm:grid-cols-2 sm:px-5 lg:grid-cols-[minmax(0,1.3fr)_repeat(4,minmax(0,1fr))] lg:gap-8 lg:py-12">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            {safeImageSrc(logo) && (
              <SafeImage
                src={logo}
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 object-contain"
              />
            )}
            <h3 className="font-display text-xl font-medium tracking-[0.05em] text-[var(--cms-primary,#1E3A8A)]">
              {brand.toUpperCase().includes("PARAMPARA")
                ? brand.toUpperCase()
                : "HOUSE OF PARAMPARA"}
            </h3>
          </Link>
          {settings?.tagline && (
            <p className="mt-3 text-sm tracking-[0.12em] uppercase text-ink-soft">
              {settings.tagline}
            </p>
          )}
        </div>

        <div>
          <h4 className="text-xs font-medium tracking-[0.2em] uppercase text-ink">
            Categories
          </h4>
          <ul className="mt-4 space-y-2.5 text-base text-ink-soft">
            {categories.map((c) => (
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
          <h4 className="text-xs font-medium tracking-[0.2em] uppercase text-ink">
            Customer Service
          </h4>
          <ul className="mt-4 space-y-2.5 text-base text-ink-soft">
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
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-medium tracking-[0.2em] uppercase text-ink">
            Contact
          </h4>
          <ul className="mt-4 space-y-2.5 text-base text-ink-soft">
            <li>
              <a
                href={`mailto:${contactEmail}`}
                className="transition hover:text-[var(--cms-primary,#1E3A8A)]"
              >
                {contactEmail}
              </a>
            </li>
            {contactPhone && (
              <li>
                <a
                  href={`tel:${contactPhone}`}
                  className="transition hover:text-[var(--cms-primary,#1E3A8A)]"
                >
                  {contactPhone}
                </a>
              </li>
            )}
            {settings?.working_hours && <li>{settings.working_hours}</li>}
            {settings?.address && <li>{settings.address}</li>}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-medium tracking-[0.2em] uppercase text-ink">
            Follow Us
          </h4>
          <div className="mt-4 flex flex-wrap gap-3">
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram
                  className="h-6 w-6 text-ink-soft transition hover:text-[var(--cms-primary,#1E3A8A)]"
                  strokeWidth={1.5}
                />
              </a>
            )}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <MessageCircle
                  className="h-6 w-6 text-ink-soft transition hover:text-[var(--cms-primary,#1E3A8A)]"
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
                  className="h-6 w-6 text-ink-soft transition hover:text-[var(--cms-primary,#1E3A8A)]"
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
                  className="h-6 w-6 text-ink-soft transition hover:text-[var(--cms-primary,#1E3A8A)]"
                  strokeWidth={1.5}
                />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-brand-200 py-5 dark:border-brand-800">
        <div className="mx-auto flex w-full max-w-[90rem] flex-col items-center justify-between gap-2 px-4 text-sm text-ink-soft sm:flex-row sm:px-5">
          <p>
            {settings?.footer_copyright ||
              `© ${new Date().getFullYear()} HOUSE OF PARAMPARA. All rights reserved.`}
          </p>
          <p>
            Developed by{" "}
            <a
              href="https://forgemuze.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium tracking-wide transition hover:text-[var(--cms-primary,#1E3A8A)]"
            >
              FORGE MUZE
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
