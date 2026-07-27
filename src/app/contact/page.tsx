"use client";

import { useState } from "react";
import { Mail, Phone, MessageCircle, MapPin, Clock } from "lucide-react";
import { usePage, useSiteSettings } from "@/hooks/useWooCommerce";
import { clientApi, parseApiError } from "@/lib/api/client";
import {
  BUSINESS_PHONE,
  BUSINESS_WHATSAPP,
  resolveBusinessEmail,
} from "@/lib/site-contact";
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

  const contactEmail = resolveBusinessEmail(settings?.contact_email);
  const contactPhone = BUSINESS_PHONE || settings?.contact_phone;
  const whatsapp =
    settings?.whatsapp || BUSINESS_WHATSAPP;
  const whatsappHref = whatsapp
    ? whatsapp.startsWith("http")
      ? whatsapp
      : `https://wa.me/${whatsapp}`
    : null;

  const info =
    settings?.contact_page_info ||
    "We are happy to assist you with product enquiries, orders, and collections.";

  const fieldClass =
    "input-field text-base text-ink placeholder:text-ink-soft/50 focus:border-[var(--cms-primary,#1E3A8A)]";

  return (
    <div className="mx-auto max-w-5xl pb-12 pt-2 md:pb-16">
      <h1 className="section-heading text-ink">
        {page?.title?.rendered || "Contact"}
      </h1>
      <p className="section-subheading max-w-2xl text-ink-soft">{info}</p>

      <div className="mt-10 grid gap-10 md:mt-12 md:grid-cols-2 md:gap-14">
        <div className="space-y-5">
          <a
            href={`mailto:${contactEmail}`}
            className="flex items-start gap-3 text-ink transition hover:text-[var(--cms-primary,#1E3A8A)]"
          >
            <Mail className="mt-0.5 h-6 w-6 shrink-0 text-[var(--cms-primary,#1E3A8A)]" strokeWidth={1.5} />
            <span>
              <span className="block text-xs font-medium tracking-[0.16em] uppercase text-ink-soft">
                Email
              </span>
              <span className="mt-1 block text-base md:text-lg">{contactEmail}</span>
            </span>
          </a>

          {contactPhone && (
            <a
              href={`tel:${contactPhone}`}
              className="flex items-start gap-3 text-ink transition hover:text-[var(--cms-primary,#1E3A8A)]"
            >
              <Phone className="mt-0.5 h-6 w-6 shrink-0 text-[var(--cms-primary,#1E3A8A)]" strokeWidth={1.5} />
              <span>
                <span className="block text-xs font-medium tracking-[0.16em] uppercase text-ink-soft">
                  Phone
                </span>
                <span className="mt-1 block text-base md:text-lg">{contactPhone}</span>
              </span>
            </a>
          )}

          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 text-ink transition hover:text-[var(--cms-primary,#1E3A8A)]"
            >
              <MessageCircle className="mt-0.5 h-6 w-6 shrink-0 text-[var(--cms-primary,#1E3A8A)]" strokeWidth={1.5} />
              <span>
                <span className="block text-xs font-medium tracking-[0.16em] uppercase text-ink-soft">
                  WhatsApp
                </span>
                <span className="mt-1 block text-base md:text-lg">Chat with us</span>
              </span>
            </a>
          )}

          {settings?.working_hours && (
            <div className="flex items-start gap-3 text-ink">
              <Clock className="mt-0.5 h-6 w-6 shrink-0 text-[var(--cms-primary,#1E3A8A)]" strokeWidth={1.5} />
              <span>
                <span className="block text-xs font-medium tracking-[0.16em] uppercase text-ink-soft">
                  Hours
                </span>
                <span className="mt-1 block text-base md:text-lg">{settings.working_hours}</span>
              </span>
            </div>
          )}

          {settings?.address && (
            <div className="flex items-start gap-3 text-ink">
              <MapPin className="mt-0.5 h-6 w-6 shrink-0 text-[var(--cms-primary,#1E3A8A)]" strokeWidth={1.5} />
              <span>
                <span className="block text-xs font-medium tracking-[0.16em] uppercase text-ink-soft">
                  Address
                </span>
                <span className="mt-1 block text-base md:text-lg">{settings.address}</span>
              </span>
            </div>
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
            className={`${fieldClass} min-h-[160px]`}
            placeholder="Message"
            aria-label="Message"
            required
            value={form.message}
            onChange={(e) =>
              setForm((f) => ({ ...f, message: e.target.value }))
            }
          />
          <button type="submit" disabled={pending} className="btn-primary rounded-full">
            {pending ? "Sending…" : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
}
