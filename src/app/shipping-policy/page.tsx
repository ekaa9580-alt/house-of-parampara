"use client";

import { usePage, useSiteSettings } from "@/hooks/useWooCommerce";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ShippingPolicyPage() {
  const { data: page, isLoading: pageLoading } = usePage("shipping-policy");
  const { data: settings, isLoading: settingsLoading } = useSiteSettings();

  const fromSettings = settings?.shipping_policy?.trim();
  const html =
    fromSettings ||
    page?.content?.rendered ||
    "<p>Content managed in WordPress Site Settings or Pages.</p>";
  const isLoading = settingsLoading || (!fromSettings && pageLoading);

  return (
    <div className="container-luxury pb-20 pt-32 md:pt-36">
      <h1 className="section-heading">
        {page?.title?.rendered || "Shipping Policy"}
      </h1>
      {isLoading ? (
        <div className="mt-8 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
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
