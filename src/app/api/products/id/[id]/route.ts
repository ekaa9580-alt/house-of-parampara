import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/api/products";
import { isMockDataMode } from "@/lib/data/mode";
import { seedProducts } from "@/lib/data/seed";
import { parseApiError } from "@/lib/api/client";

/** GET /api/products/id/:id */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = Number(id);
    if (!numericId) {
      return NextResponse.json(
        { code: "invalid", message: "Invalid product id" },
        { status: 400 }
      );
    }

    if (isMockDataMode()) {
      const product = seedProducts.find((p) => p.id === numericId);
      if (!product) {
        return NextResponse.json(
          { code: "not_found", message: "Product not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(product);
    }

    return NextResponse.json(await getProductById(numericId));
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
