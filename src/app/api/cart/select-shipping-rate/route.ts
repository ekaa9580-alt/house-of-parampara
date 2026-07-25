import { NextRequest, NextResponse } from "next/server";
import { isMockDataMode } from "@/lib/data/mode";
import { getMockCart } from "@/lib/data/seed";
import { parseApiError } from "@/lib/api/client";
import { sessionFromRequest, jsonWithCartSession } from "@/lib/api/cart-cookies";

/** POST /api/cart/select-shipping-rate */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (isMockDataMode()) {
      return NextResponse.json(getMockCart());
    }
    const { selectShippingRate } = await import("@/lib/api/cart");
    const { cart, session } = await selectShippingRate(
      Number(body.package_id ?? 0),
      String(body.rate_id || ""),
      sessionFromRequest(request)
    );
    return jsonWithCartSession(cart, session);
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
