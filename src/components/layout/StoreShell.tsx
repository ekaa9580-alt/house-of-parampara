"use client";

import { Suspense } from "react";
import { StoreSidebar } from "./StoreSidebar";

/** Desktop: sticky left sidebar + main. Mobile: full-width main (drawer in Header). */
export function StoreShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-luxury flex gap-0 lg:gap-8">
      <div className="sticky top-[4.5rem] hidden h-[calc(100vh-4.5rem)] w-[240px] shrink-0 overflow-y-auto py-6 lg:block xl:w-[260px]">
        <Suspense fallback={null}>
          <StoreSidebar />
        </Suspense>
      </div>
      <div className="min-w-0 flex-1 pb-16 pt-2 lg:pt-4">{children}</div>
    </div>
  );
}
