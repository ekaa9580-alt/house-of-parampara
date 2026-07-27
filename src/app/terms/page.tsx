"use client";

import { usePage, useSiteSettings } from "@/hooks/useWooCommerce";
import { Skeleton } from "@/components/ui/Skeleton";

export default function TermsPage() {
  const { data: page, isLoading: pageLoading } = usePage("terms");
  const { data: settings, isLoading: settingsLoading } = useSiteSettings();
  const html =
    settings?.terms_policy?.trim() ||
    page?.content?.rendered ||
    "";
  const isLoading = settingsLoading || (!settings?.terms_policy && pageLoading);

  return (
    <div className="pb-12 pt-2 md:pb-16">
      <h1 className="section-heading">
        {page?.title?.rendered || "Terms"}
      </h1>
      {isLoading ? (
        <div className="mt-8 space-y-3">
          <Skeleton className="h-4 w-full" />
        </div>
      ) : (
        <div
          className="prose prose-neutral mt-8 max-w-3xl text-ink prose-headings:text-ink prose-p:text-ink-soft dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}
