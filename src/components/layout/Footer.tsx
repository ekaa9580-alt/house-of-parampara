"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Facebook, Instagram, MessageCircle, Youtube } from "lucide-react";
import { useNewsletter, useSiteSettings, useMenu, useCategories } from "@/hooks/useWooCommerce";
import { SafeImage } from "@/components/ui/SafeImage";
import { safeImageSrc } from "@/lib/utils";
import {
  resolveBusinessEmail,
  BUSINESS_INSTAGRAM,
  BUSINESS_PHONE,
  BUSINESS_WHATSAPP,
} from "@/lib/site-contact";
import { buildCategoryTree } from "@/lib/category-tree";
import type { CmsMenuItem } from "@/types/woocommerce";

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
  const { data: categories } = useCategories();
  const newsletter = useNewsletter();
  const [email, setEmail] = useState("");

  const logo = settings?.logo;
  const contactEmail = resolveBusinessEmail(settings?.contact_email);
  const contactPhone = settings?.contact_phone || BUSINESS_PHONE;
  const instagramUrl =
    settings?.instagram || BUSINESS_INSTAGRAM;
  const whatsappRaw = settings?.whatsapp || BUSINESS_WHATSAPP;
  const whatsappUrl = whatsappRaw
    ? whatsappRaw.startsWith("http")
      ? whatsappRaw
      : `https://wa.me/${whatsappRaw}`
    : null;

  const wcParents = useMemo(
    () => buildCategoryTree(categories || []),
    [categories]
  );

  const categoriesNav = quickLinks.length
    ? quickLinks.map((i) => ({ href: i.url, label: i.title }))
    : [
        ...wcParents.map((c) => ({
          href: `/category/${c.slug}`,
          label: c.name,
        })),
        { href: "/shop", label: "Shop All" },
      ];
  const service = policyLinks.length > 0 ? policyLinks : DEFAULT_SERVICE;

  return (
    <footer className="border-t border-brand-200 bg-[#f8f6f2] dark:border-brand-800 dark:bg-brand-950">
      <div className="border-b border-brand-200 dark:border-brand-800">
        <div className="mx-auto flex w-full max-w-[90rem] flex-col items-center gap-5 px-4 py-12 text-center sm:px-5 md:py-14">
          <h2 className="font-display text-3xl font-bold tracking-wide text-ink md:text-4xl dark:text-cream">
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
              className="min-w-0 flex-1 rounded-full border border-brand-200 bg-white px-5 py-3.5 text-base text-ink outline-none placeholder:text-ink-soft/50 focus:border-[var(--cms-primary,#7A3E1D)] dark:border-brand-700 dark:bg-brand-900 dark:text-cream"
            />
            <button
              type="submit"
              disabled={newsletter.isPending}
              className="shrink-0 rounded-full bg-[var(--cms-primary,#7A3E1D)] px-8 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-cream transition hover:brightness-110 disabled:opacity-50"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[90rem] gap-8 px-4 py-10 sm:grid-cols-2 sm:px-5 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_minmax(0,0.95fr)] lg:gap-10 lg:py-12 xl:gap-12">
        <div>
          <Link href="/" className="flex items-center gap-3">
            {safeImageSrc(logo) && (
              <SafeImage
                src={logo}
                alt=""
                width={56}
                height={56}
                className="h-14 w-14 shrink-0 object-contain"
              />
            )}
            <h3 className="brand-wordmark font-display text-xl font-bold tracking-[0.05em] md:text-2xl">
              HOUSE OF PARAMPARA
            </h3>
          </Link>
          {settings?.tagline && (
            <p className="mt-3 text-sm tracking-[0.12em] uppercase text-ink-soft">
              {settings.tagline}
            </p>
          )}
        </div>

        <div>
          <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-ink">
            Categories
          </h4>
          <ul className="mt-4 space-y-2.5 text-base text-ink-soft">
            {categoriesNav.map((c) => (
              <li key={c.label}>
                <Link
                  href={c.href || "/shop"}
                  className="transition hover:text-[var(--cms-primary,#7A3E1D)]"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-ink">
            Customer Service
          </h4>
          <ul className="mt-4 space-y-2.5 text-base text-ink-soft">
            {service.map((p) => (
              <li key={p.id}>
                <Link
                  href={p.url || "/"}
                  className="transition hover:text-[var(--cms-primary,#7A3E1D)]"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-ink">
            Contact
          </h4>
          <ul className="mt-4 space-y-2.5 text-base text-ink-soft">
            <li>
              <a
                href={`mailto:${contactEmail}`}
                className="transition hover:text-[var(--cms-primary,#7A3E1D)]"
              >
                {contactEmail}
              </a>
            </li>
            {contactPhone && (
              <li>
                <a
                  href={`tel:${contactPhone}`}
                  className="transition hover:text-[var(--cms-primary,#7A3E1D)]"
                >
                  {contactPhone}
                </a>
              </li>
            )}
            {settings?.working_hours && <li>{settings.working_hours}</li>}
            {settings?.address && <li>{settings.address}</li>}
          </ul>
        </div>

        <div className="pl-4 sm:pl-6 lg:border-l lg:border-brand-200/80 lg:pl-8 xl:pl-12 dark:lg:border-brand-800">
          <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-ink">
            Follow Us
          </h4>
          <div className="mt-4 flex flex-wrap gap-4 pl-3 sm:pl-5 lg:pl-1">
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-200 bg-white transition hover:border-[var(--cms-primary,#7A3E1D)]"
              >
                <Instagram
                  className="h-5 w-5 text-ink-soft transition hover:text-[var(--cms-primary,#7A3E1D)]"
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
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-200 bg-white transition hover:border-[var(--cms-primary,#7A3E1D)]"
              >
                <MessageCircle
                  className="h-5 w-5 text-ink-soft transition hover:text-[var(--cms-primary,#7A3E1D)]"
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
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-200 bg-white transition hover:border-[var(--cms-primary,#7A3E1D)]"
              >
                <Facebook
                  className="h-5 w-5 text-ink-soft transition hover:text-[var(--cms-primary,#7A3E1D)]"
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
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-200 bg-white transition hover:border-[var(--cms-primary,#7A3E1D)]"
              >
                <Youtube
                  className="h-5 w-5 text-ink-soft transition hover:text-[var(--cms-primary,#7A3E1D)]"
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
            {settings?.footer_copyright ? (
              settings.footer_copyright
            ) : (
              <>
                © {new Date().getFullYear()}{" "}
                <span className="brand-wordmark font-semibold">
                  HOUSE OF PARAMPARA
                </span>
                . All rights reserved.
              </>
            )}
          </p>
          <div className="flex flex-col items-center gap-1.5 sm:items-end">
            <p className="flex items-center gap-2">
              Developed by{" "}
              <a
                href="https://www.instagram.com/theforgemuse?igsh=dTJsbXcwY2M4ZHU1"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold tracking-wide text-[var(--cms-primary,#7A3E1D)] transition hover:opacity-80"
              >
                FORGE MUSE
              </a>
              <a
                href="https://www.instagram.com/theforgemuse?igsh=dTJsbXcwY2M4ZHU1"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="FORGE MUSE on Instagram"
                className="inline-flex text-[var(--cms-primary,#7A3E1D)] transition hover:opacity-80"
              >
                <Instagram className="h-4 w-4" strokeWidth={1.75} />
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
