import { NextRequest, NextResponse } from "next/server";
import { fetchCategoryBySlug } from "@/lib/data/products";
import { parseApiError } from "@/lib/api/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const category = await fetchCategoryBySlug(slug);
    if (!category) {
      return NextResponse.json(
        { code: "not_found", message: "Category not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(category);
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
