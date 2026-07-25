import { NextRequest, NextResponse } from "next/server";
import { fetchBestSellers } from "@/lib/data/products";
import { parseApiError } from "@/lib/api/client";

export async function GET(request: NextRequest) {
  try {
    const perPage = Number(request.nextUrl.searchParams.get("per_page") || 8);
    return NextResponse.json(await fetchBestSellers(perPage));
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
