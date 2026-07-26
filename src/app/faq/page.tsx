"use client";

import { usePage, useSiteSettings } from "@/hooks/useWooCommerce";
import { Skeleton } from "@/components/ui/Skeleton";

export default function FaqPage() {
  const { data: page, isLoading: pageLoading } = usePage("faq");
  const { data: settings, isLoading: settingsLoading } = useSiteSettings();
  const html =
    settings?.faq_content?.trim() || page?.content?.rendered || "";
  const isLoading = settingsLoading || (!settings?.faq_content && pageLoading);

  return (
    <div className="container-luxury pb-20 pt-32 md:pt-36">
      <h1 className="section-heading">{page?.title?.rendered || "FAQ"}</h1>
      {isLoading ? (
        <div className="mt-8 space-y-3">
          <Skeleton className="h-4 w-full" />
        </div>
      ) : (
        <div
          className="prose prose-neutral mt-8 max-w-3xl dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}
