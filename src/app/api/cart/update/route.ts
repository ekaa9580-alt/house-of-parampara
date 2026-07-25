import { NextRequest, NextResponse } from "next/server";
import { updateItemInCart } from "@/lib/data/commerce";
import { parseApiError } from "@/lib/api/client";
import { sessionFromRequest, jsonWithCartSession } from "@/lib/api/cart-cookies";

export async function POST(request: NextRequest) {
  try {
    const { key, quantity } = await request.json();
    const { cart, session } = await updateItemInCart(
      key,
      quantity,
      sessionFromRequest(request)
    );
    return jsonWithCartSession(cart, session);
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
