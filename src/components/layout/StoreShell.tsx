"use client";

import { Suspense } from "react";
import { StoreSidebar } from "./StoreSidebar";

/** Desktop: sticky left sidebar + main. Mobile: full-width main (drawer in Header). */
export function StoreShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl gap-0 px-3 sm:px-5 lg:gap-5 lg:px-4 xl:px-5">
      <div className="sticky top-[4.5rem] hidden h-[calc(100vh-4.5rem)] w-[208px] shrink-0 overflow-y-auto py-5 lg:block xl:w-[220px]">
        <Suspense fallback={null}>
          <StoreSidebar />
        </Suspense>
      </div>
      <div className="min-w-0 flex-1 pb-16 pt-2 lg:pt-4">{children}</div>
    </div>
  );
}
