import { NextResponse } from "next/server";
import { fetchBanners } from "@/lib/data/commerce";
import { parseApiError } from "@/lib/api/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const banners = await fetchBanners();
    return NextResponse.json(banners, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
