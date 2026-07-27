"use client";

import { useState } from "react";
import Link from "next/link";
import { Facebook, Instagram, MessageCircle, Youtube } from "lucide-react";
import { useNewsletter, useSiteSettings, useMenu } from "@/hooks/useWooCommerce";
import { SafeImage } from "@/components/ui/SafeImage";
import { safeImageSrc } from "@/lib/utils";
import type { CmsMenuItem } from "@/types/woocommerce";

export function Footer() {
  const { data: settings } = useSiteSettings();
  const { data: quickLinks = [] } = useMenu("footer");
  const { data: policyLinks = [] } = useMenu("footer_policies");
  const newsletter = useNewsletter();
  const [email, setEmail] = useState("");

  const brand = settings?.site_name || "HOUSE OF PARAMPARA";
  const logo = settings?.logo;

  // Social links — CMS settings take priority, env vars as reliable defaults
  const instagramUrl =
    settings?.instagram ||
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
    "https://instagram.com/houseofparampara";
  const whatsappUrl =
    settings?.whatsapp
      ? settings.whatsapp.startsWith("http")
        ? settings.whatsapp // already a full URL (e.g. community invite)
        : `https://wa.me/${settings.whatsapp}`
      : process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
        ? `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`
        : null;
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

      <div className="container-luxury grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,1fr))] lg:gap-10 lg:py-12">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            {safeImageSrc(logo) && (
              <SafeImage
                src={logo}
                alt=""
                width={42}
                height={42}
                className="h-10 w-10 shrink-0 object-contain"
              />
            )}
            <h3 className="font-display text-lg font-medium tracking-[0.06em] text-[var(--cms-primary,#1E3A8A)]">
              {brand.toUpperCase().includes("PARAMPARA")
                ? brand.toUpperCase()
                : "HOUSE OF PARAMPARA"}
            </h3>
          </Link>
        </div>

        <div>
          <h4 className="text-[11px] font-medium tracking-[0.2em] uppercase text-ink">
            Categories
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
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
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
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
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
            {(settings?.contact_email || process.env.NEXT_PUBLIC_CONTACT_EMAIL) && (
              <li>
                <a
                  href={`mailto:${settings?.contact_email || process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}
                  className="transition hover:text-[var(--cms-primary,#1E3A8A)]"
                >
                  {settings?.contact_email || process.env.NEXT_PUBLIC_CONTACT_EMAIL}
                </a>
              </li>
            )}
            {settings?.contact_phone && (
              <li>
                <a
                  href={`tel:${settings.contact_phone}`}
                  className="transition hover:text-[var(--cms-primary,#1E3A8A)]"
                >
                  {settings.contact_phone}
                </a>
              </li>
            )}
            {settings?.working_hours && <li>{settings.working_hours}</li>}
            {settings?.address && <li>{settings.address}</li>}
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-medium tracking-[0.2em] uppercase text-ink">
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
                  className="h-5 w-5 text-ink-muted transition hover:text-[var(--cms-primary,#1E3A8A)]"
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
      </div>

      <div className="border-t border-brand-200 py-5 dark:border-brand-800">
        <div className="container-luxury flex flex-col items-center justify-between gap-2 text-xs text-ink-muted sm:flex-row">
          <p>
            {settings?.footer_copyright ||
              `© ${new Date().getFullYear()} HOUSE OF PARAMPARA`}
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
