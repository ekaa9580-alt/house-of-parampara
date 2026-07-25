"use client";

import { usePage, useSiteSettings } from "@/hooks/useWooCommerce";
import { Skeleton } from "@/components/ui/Skeleton";
import { SafeImage } from "@/components/ui/SafeImage";
import { safeImageSrc } from "@/lib/utils";

export default function AboutPage() {
  const { data: page, isLoading } = usePage("about");
  const { data: settings } = useSiteSettings();

  return (
    <div className="pb-20 pt-28">
      <div className="container-luxury">
        <p className="mb-3 text-xs tracking-[0.3em] uppercase text-gold">
          {settings?.tagline || "Bringing Tradition to Life"}
        </p>
        <h1 className="section-heading">
          {page?.title?.rendered || "About House of Parampara"}
        </h1>
      </div>

      <div className="container-luxury mt-12 grid gap-12 md:grid-cols-2 md:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden bg-brand-100 dark:bg-brand-900">
          {safeImageSrc(settings?.about_image) ? (
            <SafeImage
              src={settings?.about_image}
              alt="About"
              fill
              className="object-cover"
              sizes="50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-display text-5xl text-brand-400">परंपरा</span>
            </div>
          )}
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
              className="prose prose-neutral max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html:
                  page?.content?.rendered ||
                  settings?.about_preview ||
                  "",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
