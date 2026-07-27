"use client";

import { useEffect, useState } from "react";
import { usePage, useSiteSettings } from "@/hooks/useWooCommerce";
import { Accordion, type AccordionItem } from "@/components/ui/Accordion";
import { Skeleton } from "@/components/ui/Skeleton";

const DEFAULT_FAQS: AccordionItem[] = [
  {
    id: "shipping",
    question: "How long does shipping take?",
    answer:
      "Orders are typically processed within 1–2 business days. Domestic delivery usually takes 3–7 business days depending on your location. You will receive tracking details once your order ships.",
  },
  {
    id: "returns",
    question: "What is your return and exchange policy?",
    answer:
      "We accept returns and exchanges on eligible unused items in original condition within the timeframe stated in our Return Policy. Custom or final-sale pieces may not be eligible. Please contact support for guidance before sending anything back.",
  },
  {
    id: "payment",
    question: "Which payment methods do you accept?",
    answer:
      "We accept major cards and the payment methods enabled at checkout through our secure WooCommerce payment gateways. All transactions are encrypted.",
  },
  {
    id: "sizing",
    question: "How do I choose the right size?",
    answer:
      "Each product page includes available sizes and details. If you need help with measurements or fit, email us with the product name and we will assist you.",
  },
  {
    id: "care",
    question: "How should I care for my garments?",
    answer:
      "Most pieces benefit from gentle hand wash or dry clean, depending on the fabric. Care notes are listed on the product page when available. Avoid harsh detergents and direct sunlight when drying.",
  },
  {
    id: "contact",
    question: "How can I reach House of Parampara?",
    answer:
      "Write to support@houseofparampara.net or use the Contact page form. For quick questions, you can also reach us on WhatsApp during working hours.",
  },
];

function parseFaqHtml(html: string): AccordionItem[] {
  if (!html.trim()) return [];
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const details = Array.from(doc.querySelectorAll("details"));
    if (details.length) {
      return details
        .map((el, i) => ({
          id: `cms-${i}`,
          question:
            el.querySelector("summary")?.textContent?.trim() ||
            `Question ${i + 1}`,
          answer:
            Array.from(el.childNodes)
              .filter((n) => (n as Element).tagName !== "SUMMARY")
              .map((n) => n.textContent?.trim() || "")
              .filter(Boolean)
              .join(" ") || "",
        }))
        .filter((x) => x.question && x.answer);
    }

    const headings = Array.from(doc.querySelectorAll("h2, h3, h4"));
    if (headings.length) {
      return headings
        .map((h, i) => {
          let answer = "";
          let sib = h.nextElementSibling;
          while (sib && !/^H[2-4]$/.test(sib.tagName)) {
            answer += (sib.textContent || "") + " ";
            sib = sib.nextElementSibling;
          }
          return {
            id: `cms-h-${i}`,
            question: h.textContent?.trim() || `Question ${i + 1}`,
            answer: answer.trim(),
          };
        })
        .filter((x) => x.question && x.answer);
    }
  } catch {
    /* ignore */
  }
  return [];
}

export default function FaqPage() {
  const { data: page, isLoading: pageLoading } = usePage("faq");
  const { data: settings, isLoading: settingsLoading } = useSiteSettings();
  const html = settings?.faq_content?.trim() || page?.content?.rendered || "";
  const isLoading = settingsLoading || (!settings?.faq_content && pageLoading);
  const [items, setItems] = useState<AccordionItem[]>(DEFAULT_FAQS);

  useEffect(() => {
    const parsed = parseFaqHtml(html);
    setItems(parsed.length ? parsed : DEFAULT_FAQS);
  }, [html]);

  return (
    <div className="mx-auto max-w-3xl pb-12 pt-2 md:pb-16">
      <h1 className="section-heading text-ink">
        {page?.title?.rendered || "FAQ"}
      </h1>
      <p className="section-subheading text-ink-soft">
        Answers to common questions about orders, shipping, and care.
      </p>
      {isLoading ? (
        <div className="mt-10 space-y-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : (
        <Accordion items={items} className="mt-10" />
      )}
    </div>
  );
}
