import { NextRequest, NextResponse } from "next/server";
import { isMockDataMode } from "@/lib/data/mode";
import { parseApiError } from "@/lib/api/client";
import { sessionFromRequest, jsonWithCartSession } from "@/lib/api/cart-cookies";

/** GET /api/cart/shipping-rates */
export async function GET(request: NextRequest) {
  try {
    if (isMockDataMode()) {
      return NextResponse.json([
        {
          package_id: 0,
          name: "Shipment 1",
          shipping_rates: [
            {
              rate_id: "flat_rate:1",
              name: "Standard Shipping",
              description: "3–5 business days",
              delivery_time: "",
              price: "0",
              taxes: "0",
              instance_id: 1,
              method_id: "flat_rate",
              selected: true,
              currency_code: "INR",
              currency_symbol: "₹",
              currency_minor_unit: 0,
            },
          ],
        },
      ]);
    }
    const { getShippingRates } = await import("@/lib/api/cart");
    try {
      const { packages, session } = await getShippingRates(
        sessionFromRequest(request)
      );
      return jsonWithCartSession(packages, session);
    } catch (inner) {
      const err = parseApiError(inner);
      if (err.data?.status === 404 || err.code === "rest_no_route") {
        return NextResponse.json([]);
      }
      throw inner;
    }
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
