import { NextRequest, NextResponse } from "next/server";
import { fetchReviews, createReview } from "@/lib/data/commerce";
import { parseApiError } from "@/lib/api/client";

export async function GET(request: NextRequest) {
  try {
    const productId = Number(request.nextUrl.searchParams.get("product_id"));
    if (!productId) {
      return NextResponse.json(
        { code: "missing", message: "product_id required" },
        { status: 400 }
      );
    }
    return NextResponse.json(await fetchReviews(productId));
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json(await createReview(body), { status: 201 });
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
