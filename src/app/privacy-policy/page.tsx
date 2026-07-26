"use client";

import { usePage, useSiteSettings } from "@/hooks/useWooCommerce";
import { Skeleton } from "@/components/ui/Skeleton";
import type { SiteSettings } from "@/types/woocommerce";

type PolicyKey = keyof Pick<
  SiteSettings,
  "privacy_policy" | "shipping_policy" | "return_policy" | "exchange_policy"
>;

function PolicyPage({
  slug,
  fallbackTitle,
  settingsKeys,
}: {
  slug: string;
  fallbackTitle: string;
  settingsKeys: PolicyKey[];
}) {
  const { data: page, isLoading: pageLoading } = usePage(slug);
  const { data: settings, isLoading: settingsLoading } = useSiteSettings();

  const fromSettings = settingsKeys
    .map((key) => settings?.[key])
    .find((value) => typeof value === "string" && value.trim().length > 0);

  const html =
    fromSettings ||
    page?.content?.rendered ||
    "<p>Content managed in WordPress Site Settings or Pages.</p>";

  const isLoading = settingsLoading || (!fromSettings && pageLoading);

  return (
    <div className="container-luxury pb-20 pt-32 md:pt-36">
      <h1 className="section-heading">
        {page?.title?.rendered || fallbackTitle}
      </h1>
      {isLoading ? (
        <div className="mt-8 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
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

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      slug="privacy-policy"
      fallbackTitle="Privacy Policy"
      settingsKeys={["privacy_policy"]}
    />
  );
}
