import { NextRequest, NextResponse } from "next/server";
import { applyCartCoupon, removeCartCoupon } from "@/lib/data/commerce";
import { parseApiError } from "@/lib/api/client";
import { sessionFromRequest, jsonWithCartSession } from "@/lib/api/cart-cookies";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    const { cart, session } = await applyCartCoupon(
      code,
      sessionFromRequest(request)
    );
    return jsonWithCartSession(cart, session);
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { code } = await request.json();
    const { cart, session } = await removeCartCoupon(
      code,
      sessionFromRequest(request)
    );
    return jsonWithCartSession(cart, session);
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
