import type { WooCategory } from "@/types/woocommerce";

/** Recursively collect a category id plus all descendant ids. */
export function getDescendantCategoryIds(
  all: WooCategory[],
  rootId: number
): number[] {
  const ids = [rootId];
  const children = all.filter((c) => c.parent === rootId);
  for (const child of children) {
    ids.push(...getDescendantCategoryIds(all, child.id));
  }
  return ids;
}

export type CategoryTreeNode = WooCategory & {
  children: WooCategory[];
  /** Direct count + children counts (for nav display) */
  totalCount: number;
};

/** Build parent → children tree from a flat WC category list. */
export function buildCategoryTree(
  categories: WooCategory[]
): CategoryTreeNode[] {
  const list = (categories || []).filter((c) => c.slug !== "uncategorized");
  const parents = list.filter((c) => !c.parent || c.parent === 0);

  return parents
    .map((p) => {
      const children = list
        .filter((c) => c.parent === p.id)
        .sort((a, b) => a.name.localeCompare(b.name));
      const totalCount =
        (p.count || 0) + children.reduce((sum, c) => sum + (c.count || 0), 0);
      return { ...p, children, totalCount };
    })
    .filter((p) => p.totalCount > 0 || p.children.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}
