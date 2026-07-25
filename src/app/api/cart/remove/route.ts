import { NextRequest, NextResponse } from "next/server";
import { removeItemFromCart } from "@/lib/data/commerce";
import { parseApiError } from "@/lib/api/client";
import { sessionFromRequest, jsonWithCartSession } from "@/lib/api/cart-cookies";

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();
    const { cart, session } = await removeItemFromCart(
      key,
      sessionFromRequest(request)
    );
    return jsonWithCartSession(cart, session);
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
