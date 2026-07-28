import { wcApi, ensureConfigured } from "./client";
import type { WooCategory } from "@/types/woocommerce";

export async function getCategories(
  params: {
    parent?: number;
    per_page?: number;
    hide_empty?: boolean;
    orderby?: string;
    order?: "asc" | "desc";
  } = {}
): Promise<WooCategory[]> {
  ensureConfigured();
  const response = await wcApi.get<WooCategory[]>("/products/categories", {
    params: {
      per_page: params.per_page ?? 100,
      hide_empty: params.hide_empty ?? false,
      // WC category orderby enum: id, include, name, slug, term_group, description, count
      orderby: params.orderby ?? "name",
      order: params.order ?? "asc",
      ...(params.parent !== undefined ? { parent: params.parent } : {}),
    },
  });
  return (response.data || []).filter((c) => c.slug !== "uncategorized");
}

export async function getCategoryBySlug(
  slug: string
): Promise<WooCategory | null> {
  ensureConfigured();
  const response = await wcApi.get<WooCategory[]>("/products/categories", {
    params: { slug },
  });
  return response.data[0] ?? null;
}

export async function getCategoryById(id: number): Promise<WooCategory> {
  ensureConfigured();
  const response = await wcApi.get<WooCategory>(`/products/categories/${id}`);
  return response.data;
}

export async function getParentCategories(): Promise<WooCategory[]> {
  return getCategories({ parent: 0, hide_empty: true });
}
