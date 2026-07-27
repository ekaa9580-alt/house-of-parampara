"use client";

import { useState } from "react";
import { usePage, useSiteSettings } from "@/hooks/useWooCommerce";
import { clientApi, parseApiError } from "@/lib/api/client";
import toast from "react-hot-toast";

export default function ContactPage() {
  const { data: page } = usePage("contact");
  const { data: settings } = useSiteSettings();
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const info =
    settings?.contact_page_info ||
    (page?.content?.rendered
      ? undefined
      : "We are happy to assist you with product enquiries, orders, and collections.");

  const contactEmail =
    settings?.contact_email || process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const contactPhone =
    settings?.contact_phone || process.env.NEXT_PUBLIC_CONTACT_PHONE;

  const fieldClass =
    "input-field text-ink placeholder:text-ink-soft/55 focus:border-brand-600";

  return (
    <div className="container-luxury pb-20 pt-32 md:pt-36">
      <h1 className="section-heading text-ink">
        {page?.title?.rendered || "Contact"}
      </h1>
      {page?.content?.rendered ? (
        <div
          className="prose prose-neutral mt-4 text-ink prose-headings:text-ink prose-p:text-ink-soft prose-a:text-ink dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: page.content.rendered }}
        />
      ) : info ? (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft md:text-base">
          {info}
        </p>
      ) : null}

      <div className="mt-12 grid gap-12 md:grid-cols-2">
        <div className="space-y-4 text-sm text-ink">
          {contactEmail && (
            <p>
              <span className="font-medium text-ink-soft">Email · </span>
              <a
                href={`mailto:${contactEmail}`}
                className="link-underline text-ink transition hover:text-[var(--cms-primary,#1E3A8A)]"
              >
                {contactEmail}
              </a>
            </p>
          )}
          {contactPhone && (
            <p>
              <span className="font-medium text-ink-soft">Phone · </span>
              <a
                href={`tel:${contactPhone}`}
                className="text-ink transition hover:text-[var(--cms-primary,#1E3A8A)]"
              >
                {contactPhone}
              </a>
            </p>
          )}
          {settings?.whatsapp && (
            <p>
              <span className="font-medium text-ink-soft">WhatsApp · </span>
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-ink transition hover:text-[var(--cms-primary,#1E3A8A)]"
              >
                Chat with us
              </a>
            </p>
          )}
          {settings?.working_hours && (
            <p>
              <span className="font-medium text-ink-soft">Hours · </span>
              <span className="text-ink">{settings.working_hours}</span>
            </p>
          )}
          {settings?.address && (
            <p>
              <span className="font-medium text-ink-soft">Address · </span>
              <span className="text-ink">{settings.address}</span>
            </p>
          )}
          {settings?.maps_url && (
            <p>
              <a
                href={settings.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-ink transition hover:text-[var(--cms-primary,#1E3A8A)]"
              >
                Open in Google Maps
              </a>
            </p>
          )}
          {settings?.contact_page_info && page?.content?.rendered && (
            <p className="pt-2 leading-relaxed text-ink-soft">
              {settings.contact_page_info}
            </p>
          )}
        </div>

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            try {
              const { data } = await clientApi.post<{ message?: string }>(
                "/contact",
                form
              );
              toast.success(data.message || "Sent");
              setForm({ name: "", email: "", message: "" });
            } catch (err) {
              toast.error(parseApiError(err).message || "Could not send message");
            } finally {
              setPending(false);
            }
          }}
        >
          <input
            className={fieldClass}
            placeholder="Name"
            aria-label="Name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            type="email"
            className={fieldClass}
            placeholder="Email"
            aria-label="Email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <textarea
            className={`${fieldClass} min-h-[140px]`}
            placeholder="Message"
            aria-label="Message"
            required
            value={form.message}
            onChange={(e) =>
              setForm((f) => ({ ...f, message: e.target.value }))
            }
          />
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Sending…" : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
}
