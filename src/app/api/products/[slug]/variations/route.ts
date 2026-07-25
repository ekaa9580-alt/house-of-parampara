import { NextRequest, NextResponse } from "next/server";
import { getProductVariations } from "@/lib/api/products";
import { useMockData } from "@/lib/data/mode";
import { parseApiError } from "@/lib/api/client";
import { fetchProductBySlug } from "@/lib/data/products";

/** GET /api/products/:slug/variations */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (useMockData()) {
      return NextResponse.json([]);
    }

    let productId: number | null = null;
    if (/^\d+$/.test(slug)) {
      productId = Number(slug);
    } else {
      const product = await fetchProductBySlug(slug);
      productId = product?.id ?? null;
    }

    if (!productId) return NextResponse.json([]);

    const variations = await getProductVariations(productId);
    return NextResponse.json(variations);
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
