import { NextRequest, NextResponse } from "next/server";
import { fetchSearchProducts } from "@/lib/data/products";
import { parseApiError } from "@/lib/api/client";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q") || "";
    const perPage = Number(request.nextUrl.searchParams.get("per_page") || 10);
    return NextResponse.json(await fetchSearchProducts(q, perPage));
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
