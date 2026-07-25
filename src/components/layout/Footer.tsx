"use client";

import { useState } from "react";
import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react";
import { SITE_NAME } from "@/lib/utils";
import { useNewsletter, useSiteSettings } from "@/hooks/useWooCommerce";

export function Footer() {
  const { data: settings } = useSiteSettings();
  const newsletter = useNewsletter();
  const [email, setEmail] = useState("");

  const whatsapp =
    settings?.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const instagram =
    settings?.instagram || process.env.NEXT_PUBLIC_INSTAGRAM_URL;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    newsletter.mutate(email, { onSuccess: () => setEmail("") });
  };

  return (
    <footer className="border-t border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-950">
      {/* Newsletter */}
      <div className="border-b border-brand-200 dark:border-brand-800">
        <div className="container-luxury grid gap-8 py-16 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-3xl font-light tracking-wide md:text-4xl">
              {settings?.newsletter_heading || "Join the Parampara Circle"}
            </h2>
            <p className="section-subheading">
              {settings?.newsletter_text ||
                "Be first to discover new collections, private sales, and stories from the atelier."}
            </p>
          </div>
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col gap-0 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="input-field min-w-0 flex-1 border-r-0 sm:border-r-0"
            />
            <button
              type="submit"
              disabled={newsletter.isPending}
              className="btn-primary shrink-0 px-6"
            >
              {newsletter.isPending ? "…" : "Subscribe"}
            </button>
          </form>
        </div>
      </div>

      <div className="container-luxury grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-display text-xl font-light tracking-wide">
            {settings?.site_name || SITE_NAME}
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            {settings?.about_preview ||
              "Timeless Indian craftsmanship reimagined for the modern wardrobe. Heritage weaves, contemporary silhouettes."}
          </p>
          <div className="mt-6 flex items-center gap-4">
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-ink-muted transition-colors hover:text-ink dark:hover:text-cream"
              >
                <Instagram className="h-5 w-5" strokeWidth={1.5} />
              </a>
            )}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-ink-muted transition-colors hover:text-ink dark:hover:text-cream"
              >
                <MessageCircle className="h-5 w-5" strokeWidth={1.5} />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium tracking-[0.2em] uppercase">
            Quick Links
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
            <li>
              <Link href="/shop" className="hover:text-ink dark:hover:text-cream">
                Shop
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-ink dark:hover:text-cream">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-ink dark:hover:text-cream">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/my-account" className="hover:text-ink dark:hover:text-cream">
                My Account
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-medium tracking-[0.2em] uppercase">
            Policies
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
            <li>
              <Link
                href="/shipping-policy"
                className="hover:text-ink dark:hover:text-cream"
              >
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link
                href="/return-policy"
                className="hover:text-ink dark:hover:text-cream"
              >
                Return Policy
              </Link>
            </li>
            <li>
              <Link
                href="/privacy-policy"
                className="hover:text-ink dark:hover:text-cream"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-medium tracking-[0.2em] uppercase">
            Contact
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
            {(settings?.contact_email ||
              process.env.NEXT_PUBLIC_CONTACT_EMAIL) && (
              <li>
                <a
                  href={`mailto:${settings?.contact_email || process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}
                  className="hover:text-ink dark:hover:text-cream"
                >
                  {settings?.contact_email ||
                    process.env.NEXT_PUBLIC_CONTACT_EMAIL}
                </a>
              </li>
            )}
            {(settings?.contact_phone ||
              process.env.NEXT_PUBLIC_CONTACT_PHONE) && (
              <li>
                <a
                  href={`tel:${settings?.contact_phone || process.env.NEXT_PUBLIC_CONTACT_PHONE}`}
                  className="hover:text-ink dark:hover:text-cream"
                >
                  {settings?.contact_phone ||
                    process.env.NEXT_PUBLIC_CONTACT_PHONE}
                </a>
              </li>
            )}
            {settings?.address && <li>{settings.address}</li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-200 py-6 dark:border-brand-800">
        <div className="container-luxury flex flex-col items-center justify-between gap-2 text-xs text-ink-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings?.site_name || SITE_NAME}. All
            rights reserved.
          </p>
          <p>Crafted with tradition.</p>
        </div>
      </div>
    </footer>
  );
}
