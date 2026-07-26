"use client";

import Link from "next/link";
import { useSiteSettings } from "@/hooks/useWooCommerce";
import { MessageCircle } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn, safeImageSrc } from "@/lib/utils";

export function WhatsAppButton() {
  const { data: settings } = useSiteSettings();
  const number =
    settings?.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!number) return null;

  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center bg-royal text-cream shadow-lift transition-transform hover:scale-105"
    >
      <MessageCircle className="h-5 w-5" strokeWidth={1.5} />
    </a>
  );
}

/** Logo loaded from settings API — never hardcoded in header logic beyond fallback path via seed settings */
export function BrandLogo({
  className,
  light,
}: {
  className?: string;
  light?: boolean;
}) {
  const { data: settings } = useSiteSettings();
  const logo = settings?.logo;
  const name = settings?.site_name || "House of Parampara";

  if (safeImageSrc(logo)) {
    return (
      <SafeImage
        src={logo}
        alt={name}
        width={280}
        height={72}
        className={
          className ||
          "h-9 w-auto max-w-full object-contain object-left sm:h-10 md:h-11"
        }
        priority
      />
    );
  }

  return (
    <span
      className={
        className ||
        cn(
          "font-display block whitespace-nowrap text-base font-light tracking-[0.08em] sm:text-lg md:text-xl lg:text-2xl",
          light ? "text-cream" : ""
        )
      }
    >
      {name}
    </span>
  );
}

export function BrandLink({
  light,
  className,
}: {
  light?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={cn("relative z-10 flex min-w-0 items-center", className)}
      aria-label="Home"
    >
      <BrandLogo light={light} />
    </Link>
  );
}
