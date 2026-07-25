import { NextResponse } from "next/server";
import { fetchBanners } from "@/lib/data/commerce";
import { parseApiError } from "@/lib/api/client";

export async function GET() {
  try {
    return NextResponse.json(await fetchBanners());
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
