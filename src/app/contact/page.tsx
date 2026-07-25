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

  return (
    <div className="container-luxury pb-20 pt-28">
      <h1 className="section-heading">
        {page?.title?.rendered || "Contact"}
      </h1>
      {page?.content?.rendered && (
        <div
          className="prose prose-neutral mt-4 dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: page.content.rendered }}
        />
      )}

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
              <a href={`tel:${settings.contact_phone}`}>{settings.contact_phone}</a>
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
          {settings?.address && (
            <p>
              <span className="text-ink-muted">Address · </span>
              {settings.address}
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
              toast.success(data.message || "Thank you — we will be in touch.");
              setForm({ name: "", email: "", message: "" });
            } catch (err) {
              toast.error(parseApiError(err).message);
            } finally {
              setPending(false);
            }
          }}
        >
          <input
            className="input-field"
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            className="input-field"
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <textarea
            className="input-field min-h-[120px]"
            required
            placeholder="Message"
            value={form.message}
            onChange={(e) =>
              setForm((f) => ({ ...f, message: e.target.value }))
            }
          />
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? "Sending…" : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
