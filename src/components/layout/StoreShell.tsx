"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { StoreSidebar } from "./StoreSidebar";
import { cn } from "@/lib/utils";

function shouldShowSidebar(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/shop") ||
    pathname.startsWith("/category") ||
    pathname.startsWith("/product")
  );
}

/** Desktop: sticky left sidebar on catalog routes. Content pages use full main width. */
export function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = shouldShowSidebar(pathname);

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[90rem] gap-0 px-3 sm:px-4 lg:px-5",
        showSidebar && "lg:gap-5"
      )}
    >
      {showSidebar && (
        <div className="sticky top-[5.5rem] hidden h-[calc(100vh-5.5rem)] w-[200px] shrink-0 overflow-y-auto py-4 lg:block xl:w-[216px]">
          <Suspense fallback={null}>
            <StoreSidebar />
          </Suspense>
        </div>
      )}
      <div className="min-w-0 flex-1 pb-12 pt-4 md:pb-16 md:pt-5">{children}</div>
    </div>
  );
}
