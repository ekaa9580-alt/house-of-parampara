import { NextRequest, NextResponse } from "next/server";
import { fetchCart } from "@/lib/data/commerce";
import { parseApiError } from "@/lib/api/client";
import { sessionFromRequest, jsonWithCartSession } from "@/lib/api/cart-cookies";

export async function GET(request: NextRequest) {
  try {
    const { cart, session } = await fetchCart(sessionFromRequest(request));
    return jsonWithCartSession(cart, session);
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
