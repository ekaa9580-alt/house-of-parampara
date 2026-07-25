"use client";

import { usePage } from "@/hooks/useWooCommerce";
import { Skeleton } from "@/components/ui/Skeleton";

function PolicyPage({ slug, fallbackTitle }: { slug: string; fallbackTitle: string }) {
  const { data: page, isLoading } = usePage(slug);

  return (
    <div className="container-luxury pb-20 pt-28">
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
          dangerouslySetInnerHTML={{
            __html: page?.content?.rendered || "<p>Content managed in WordPress.</p>",
          }}
        />
      )}
    </div>
  );
}

export default function PrivacyPolicyPage() {
  return <PolicyPage slug="privacy-policy" fallbackTitle="Privacy Policy" />;
}
