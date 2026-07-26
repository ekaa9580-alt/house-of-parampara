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

  return (
    <div className="container-luxury pb-20 pt-32 md:pt-36">
      <h1 className="section-heading">
        {page?.title?.rendered || "Contact"}
      </h1>
      {page?.content?.rendered ? (
        <div
          className="prose prose-neutral mt-4 dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: page.content.rendered }}
        />
      ) : info ? (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-muted md:text-base">
          {info}
        </p>
      ) : null}

      <div className="mt-12 grid gap-12 md:grid-cols-2">
        <div className="space-y-4 text-sm">
          {settings?.contact_email && (
            <p>
              <span className="text-ink-muted">Email · </span>
              <a
                href={`mailto:${settings.contact_email}`}
                className="link-underline"
              >
                {settings.contact_email}
              </a>
            </p>
          )}
          {settings?.contact_phone && (
            <p>
              <span className="text-ink-muted">Phone · </span>
              <a href={`tel:${settings.contact_phone}`}>
                {settings.contact_phone}
              </a>
            </p>
          )}
          {settings?.whatsapp && (
            <p>
              <span className="text-ink-muted">WhatsApp · </span>
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline"
              >
                Chat with us
              </a>
            </p>
          )}
          {settings?.working_hours && (
            <p>
              <span className="text-ink-muted">Hours · </span>
              {settings.working_hours}
            </p>
          )}
          {settings?.address && (
            <p>
              <span className="text-ink-muted">Address · </span>
              {settings.address}
            </p>
          )}
          {settings?.maps_url && (
            <p>
              <a
                href={settings.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline"
              >
                Open in Google Maps
              </a>
            </p>
          )}
          {settings?.contact_page_info && page?.content?.rendered && (
            <p className="pt-2 leading-relaxed text-ink-muted">
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
            className="input-field"
            placeholder="Name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            type="email"
            className="input-field"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <textarea
            className="input-field min-h-[140px]"
            placeholder="Message"
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
