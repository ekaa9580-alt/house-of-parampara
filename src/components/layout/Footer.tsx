"use client";

import { useState } from "react";
import Link from "next/link";
import { Facebook, Instagram, MessageCircle, Youtube } from "lucide-react";
import { useNewsletter, useSiteSettings, useMenu } from "@/hooks/useWooCommerce";

export function Footer() {
  const { data: settings } = useSiteSettings();
  const { data: quickLinks = [] } = useMenu("footer");
  const { data: policyLinks = [] } = useMenu("footer_policies");
  const newsletter = useNewsletter();
  const [email, setEmail] = useState("");

  const whatsapp = settings?.whatsapp;
  const instagram = settings?.instagram;
  const facebook = settings?.facebook;
  const youtube = settings?.youtube;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    newsletter.mutate(email, { onSuccess: () => setEmail("") });
  };

  return (
    <footer className="border-t border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-950">
      {(settings?.newsletter_heading || settings?.newsletter_text) && (
        <div className="border-b border-brand-200 dark:border-brand-800">
          <div className="container-luxury grid gap-8 py-16 md:grid-cols-2 md:items-center">
            <div>
              {settings?.newsletter_heading && (
                <h2 className="font-display text-3xl font-light tracking-wide md:text-4xl">
                  {settings.newsletter_heading}
                </h2>
              )}
              {settings?.newsletter_text && (
                <p className="section-subheading">{settings.newsletter_text}</p>
              )}
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
                placeholder="Email"
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
      )}

      <div className="container-luxury grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          {settings?.site_name && (
            <h3 className="font-display text-xl font-light tracking-wide">
              {settings.site_name}
            </h3>
          )}
          {settings?.tagline && (
            <p className="mt-2 text-xs tracking-[0.18em] uppercase text-gold">
              {settings.tagline}
            </p>
          )}
          {settings?.about_preview && (
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              {settings.about_preview}
            </p>
          )}
          <div className="mt-6 flex items-center gap-4">
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="h-5 w-5 text-ink-muted" strokeWidth={1.5} />
              </a>
            )}
            {facebook && (
              <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook className="h-5 w-5 text-ink-muted" strokeWidth={1.5} />
              </a>
            )}
            {youtube && (
              <a href={youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <Youtube className="h-5 w-5 text-ink-muted" strokeWidth={1.5} />
              </a>
            )}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5 text-ink-muted" strokeWidth={1.5} />
              </a>
            )}
          </div>
        </div>

        {quickLinks.length > 0 && (
          <div>
            <ul className="mt-0 space-y-2.5 text-sm text-ink-muted">
              {quickLinks.map((item) => (
                <li key={item.id}>
                  <Link href={item.url || "/"} className="hover:text-ink dark:hover:text-cream">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {policyLinks.length > 0 && (
          <div>
            <ul className="mt-0 space-y-2.5 text-sm text-ink-muted">
              {policyLinks.map((item) => (
                <li key={item.id}>
                  <Link href={item.url || "/"} className="hover:text-ink dark:hover:text-cream">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <ul className="mt-0 space-y-2.5 text-sm text-ink-muted">
            {settings?.contact_email && (
              <li>
                <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
              </li>
            )}
            {settings?.contact_phone && (
              <li>
                <a href={`tel:${settings.contact_phone}`}>{settings.contact_phone}</a>
              </li>
            )}
            {settings?.working_hours && <li>{settings.working_hours}</li>}
            {settings?.address && <li>{settings.address}</li>}
            {settings?.maps_url && (
              <li>
                <a href={settings.maps_url} target="_blank" rel="noopener noreferrer">
                  Map
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-200 py-6 dark:border-brand-800">
        <div className="container-luxury flex flex-col items-center justify-between gap-2 text-xs text-ink-muted sm:flex-row">
          <p>{settings?.footer_copyright || settings?.site_name}</p>
          {settings?.footer_tagline && <p>{settings.footer_tagline}</p>}
        </div>
      </div>
    </footer>
  );
}
