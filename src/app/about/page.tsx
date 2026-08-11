"use client";

import { useMemo } from "react";
import { usePage, useSiteSettings } from "@/hooks/useWooCommerce";
import { Skeleton } from "@/components/ui/Skeleton";
import { SafeImage } from "@/components/ui/SafeImage";
import { safeImageSrc } from "@/lib/utils";

function stripMeetTeamSection(html: string): string {
  if (!html || typeof window === "undefined") return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const meetHeading = Array.from(
    doc.querySelectorAll("h1, h2, h3, h4, h5, h6")
  ).find((node) => /meet\s*the\s*team/i.test(node.textContent || ""));

  if (!meetHeading) return html;

  // Remove the closest meaningful container so no empty spacing remains.
  const removableContainer =
    meetHeading.closest("section") ||
    meetHeading.closest(".wp-block-group") ||
    meetHeading.closest(".wp-block-columns") ||
    meetHeading.closest("div");

  if (removableContainer) {
    removableContainer.remove();
  } else {
    meetHeading.remove();
  }

  return doc.body.innerHTML;
}

export default function AboutPage() {
  const { data: page, isLoading } = usePage("about");
  const { data: settings } = useSiteSettings();
  const aboutHtml = useMemo(
    () => stripMeetTeamSection(page?.content?.rendered || settings?.about_preview || ""),
    [page?.content?.rendered, settings?.about_preview]
  );

  return (
    <div className="pb-12 pt-2 md:pb-16">
      {settings?.tagline && (
        <p className="mb-3 text-xs tracking-[0.3em] uppercase text-gold">
          {settings.tagline}
        </p>
      )}
      <h1
        className={
          /parampara/i.test(page?.title?.rendered || settings?.site_name || "")
            ? "section-heading brand-wordmark"
            : "section-heading"
        }
      >
        {page?.title?.rendered || settings?.site_name}
      </h1>

      <div className="mt-12 grid gap-12 md:grid-cols-2 md:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden bg-brand-100 dark:bg-brand-900">
          {safeImageSrc(settings?.about_image) ? (
            <SafeImage
              src={settings?.about_image}
              alt=""
              fill
              className="object-cover"
              sizes="50vw"
            />
          ) : null}
        </div>
        <div>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : (
            <div
              className="prose prose-neutral max-w-none text-ink prose-headings:text-ink prose-p:text-ink-soft dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: aboutHtml,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
