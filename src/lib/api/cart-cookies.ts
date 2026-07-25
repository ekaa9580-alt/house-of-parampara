import { NextRequest, NextResponse } from "next/server";
import type { CartSession } from "@/lib/api/cart";
import { useMockData } from "@/lib/data/mode";

export function sessionFromRequest(request: NextRequest): CartSession {
  return {
    nonce: request.cookies.get("wc_nonce")?.value || null,
    token: request.cookies.get("wc_cart_token")?.value || null,
  };
}

export function jsonWithCartSession(
  data: unknown,
  session: CartSession,
  status = 200
) {
  const response = NextResponse.json(data, { status });
  if (!useMockData()) {
    if (session.nonce) {
      response.cookies.set("wc_nonce", session.nonce, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    }
    if (session.token) {
      response.cookies.set("wc_cart_token", session.token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }
  }
  return response;
}
