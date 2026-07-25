import { NextRequest, NextResponse } from "next/server";
import { fetchProductBySlug } from "@/lib/data/products";
import { parseApiError } from "@/lib/api/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await fetchProductBySlug(slug);
    if (!product) {
      return NextResponse.json(
        { code: "not_found", message: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(product);
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
