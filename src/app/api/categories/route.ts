import { NextRequest, NextResponse } from "next/server";
import { fetchCategories } from "@/lib/data/products";
import { parseApiError } from "@/lib/api/client";

export async function GET(request: NextRequest) {
  try {
    const parent = request.nextUrl.searchParams.get("parent");
    const data = await fetchCategories(
      parent !== null ? Number(parent) : undefined
    );
    return NextResponse.json(data);
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
