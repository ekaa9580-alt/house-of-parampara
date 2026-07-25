import { NextRequest, NextResponse } from "next/server";
import { fetchOrders } from "@/lib/data/commerce";
import { parseApiError } from "@/lib/api/client";

export async function GET(request: NextRequest) {
  try {
    const customerId = Number(
      request.nextUrl.searchParams.get("customer_id")
    );
    const page = Number(request.nextUrl.searchParams.get("page") || 1);
    if (!customerId) {
      return NextResponse.json(
        { code: "missing_customer", message: "customer_id is required" },
        { status: 400 }
      );
    }
    return NextResponse.json(await fetchOrders(customerId, page));
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
