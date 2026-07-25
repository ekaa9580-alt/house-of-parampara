import { NextRequest, NextResponse } from "next/server";
import { isMockDataMode } from "@/lib/data/mode";
import { getMockCart } from "@/lib/data/seed";
import { parseApiError } from "@/lib/api/client";
import { sessionFromRequest, jsonWithCartSession } from "@/lib/api/cart-cookies";

/** POST /api/cart/update-customer */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (isMockDataMode()) {
      return NextResponse.json(getMockCart());
    }
    const { updateCustomer } = await import("@/lib/api/cart");
    const { cart, session } = await updateCustomer(
      body.billing_address,
      body.shipping_address,
      sessionFromRequest(request)
    );
    return jsonWithCartSession(cart, session);
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
