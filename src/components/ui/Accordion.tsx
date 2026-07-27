"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccordionItem = {
  id: string;
  question: string;
  answer: string;
};

export function Accordion({
  items,
  className,
}: {
  items: AccordionItem[];
  className?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className={cn("divide-y divide-brand-200 border-y border-brand-200 dark:divide-brand-800 dark:border-brand-800", className)}>
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={`accordion-panel-${item.id}`}
              id={`accordion-header-${item.id}`}
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left transition hover:opacity-80"
            >
              <span className="font-display text-lg font-medium tracking-wide text-ink md:text-xl dark:text-cream">
                {item.question}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-ink-soft transition-transform duration-300",
                  open && "rotate-180"
                )}
                strokeWidth={1.5}
                aria-hidden
              />
            </button>
            <div
              id={`accordion-panel-${item.id}`}
              role="region"
              aria-labelledby={`accordion-header-${item.id}`}
              hidden={!open}
              className={cn("pb-5 pr-8", !open && "hidden")}
            >
              <p className="text-base leading-relaxed text-ink-soft md:text-[1.05rem]">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
