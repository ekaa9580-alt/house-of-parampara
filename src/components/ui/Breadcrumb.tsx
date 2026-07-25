"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex flex-wrap items-center gap-1.5 text-sm", className)}
    >
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && (
            <ChevronRight className="h-3.5 w-3.5 text-ink-muted/50" />
          )}
          {item.href && i < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-ink-muted transition-colors hover:text-ink dark:hover:text-cream"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-ink dark:text-cream">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
