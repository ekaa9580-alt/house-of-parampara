import { NextRequest, NextResponse } from "next/server";
import { fetchProducts } from "@/lib/data/products";
import { parseApiError } from "@/lib/api/client";
import type { ProductsQueryParams } from "@/types/woocommerce";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const params: ProductsQueryParams = {
      page: Number(sp.get("page") || 1),
      per_page: Number(sp.get("per_page") || 12),
    };
    if (sp.get("search")) params.search = sp.get("search")!;
    if (sp.get("category")) params.category = sp.get("category")!;
    if (sp.get("tag")) params.tag = sp.get("tag")!;
    if (sp.get("featured")) params.featured = sp.get("featured") === "true";
    if (sp.get("on_sale")) params.on_sale = sp.get("on_sale") === "true";
    if (sp.get("orderby"))
      params.orderby = sp.get("orderby") as ProductsQueryParams["orderby"];
    if (sp.get("order"))
      params.order = sp.get("order") as ProductsQueryParams["order"];
    if (sp.get("min_price")) params.min_price = Number(sp.get("min_price"));
    if (sp.get("max_price")) params.max_price = Number(sp.get("max_price"));
    if (sp.get("stock_status"))
      params.stock_status =
        sp.get("stock_status") as ProductsQueryParams["stock_status"];
    if (sp.get("include")) {
      params.include = sp
        .get("include")!
        .split(",")
        .map((id) => Number(id.trim()))
        .filter(Boolean);
    }
    if (sp.get("slug")) params.slug = sp.get("slug")!;

    return NextResponse.json(await fetchProducts(params));
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
