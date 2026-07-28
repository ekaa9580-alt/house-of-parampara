import type { ComponentType, SVGProps } from "react";
import { Shirt, Baby, Sparkles } from "lucide-react";
import { DressIcon } from "@/components/icons/DressIcon";

export type CatIcon = ComponentType<
  SVGProps<SVGSVGElement> & { strokeWidth?: number }
>;

export type StoreSubcategory = {
  label: string;
  /** Search / filter query used when WC child category is missing */
  search: string;
  /** Optional WC slug matchers */
  match?: string[];
};

export type StoreCategory = {
  label: string;
  match: string[];
  icon: CatIcon;
  href: string;
  children: StoreSubcategory[];
};

/** Shared category tree for sidebar + site nav */
export const STORE_CATEGORIES: StoreCategory[] = [
  {
    label: "Women",
    match: ["women", "womens", "woman", "saree"],
    icon: DressIcon,
    href: "/shop?search=Women",
    children: [
      {
        label: "Set Mundu",
        search: "Set Mundu",
        match: ["set-mundu", "set mundu", "mundu"],
      },
      {
        label: "Cotton Saree",
        search: "Cotton Saree",
        match: ["cotton-saree", "cotton saree"],
      },
      {
        label: "Tissue Saree",
        search: "Tissue Saree",
        match: ["tissue-saree", "tissue saree", "tissue"],
      },
    ],
  },
  {
    label: "Men",
    match: ["men", "mens", "man", "kurta"],
    icon: Shirt,
    href: "/shop?search=Men",
    children: [
      { label: "Kurta", search: "Kurta", match: ["kurta"] },
      { label: "Shirt", search: "Shirt", match: ["shirt", "shirts"] },
      { label: "Mundu", search: "Mundu", match: ["mundu"] },
    ],
  },
  {
    label: "Kids",
    match: ["kids", "kid", "children", "child"],
    icon: Baby,
    href: "/shop?search=Kids",
    /** Provision — subcategories can be added later */
    children: [],
  },
  {
    label: "Handicrafts",
    match: ["handicrafts", "handicraft", "craft"],
    icon: Sparkles,
    href: "/shop?search=Handicrafts",
    /** Provision — subcategories can be added later */
    children: [],
  },
];
