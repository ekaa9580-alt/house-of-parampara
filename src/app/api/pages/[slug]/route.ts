import { NextRequest, NextResponse } from "next/server";
import { fetchPage } from "@/lib/data/commerce";
import { parseApiError } from "@/lib/api/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const page = await fetchPage(slug);
    if (!page) {
      return NextResponse.json(
        { code: "not_found", message: "Page not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(page);
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
