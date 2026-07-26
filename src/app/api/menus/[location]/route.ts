import { NextResponse } from "next/server";
import { fetchMenu } from "@/lib/data/commerce";
import { parseApiError } from "@/lib/api/client";

export async function GET(
  _request: Request,
  context: { params: Promise<{ location: string }> }
) {
  try {
    const { location } = await context.params;
    return NextResponse.json(await fetchMenu(location));
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
