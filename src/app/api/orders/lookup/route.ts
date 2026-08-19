import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/api/auth";
import { parseApiError } from "@/lib/api/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function isPaidStatus(status: string, datePaid?: string | null, transactionId?: string) {
  const s = (status || "").toLowerCase();
  if (["processing", "completed"].includes(s)) return true;
  if (datePaid) return true;
  if (transactionId && !["pending", "failed", "cancelled"].includes(s)) {
    return false;
  }
  return false;
}

export async function GET(request: NextRequest) {
  try {
    const id = Number(request.nextUrl.searchParams.get("id") || 0);
    const key = (request.nextUrl.searchParams.get("key") || "").trim();
    if (!id || !key) {
      return NextResponse.json(
        { code: "missing_params", message: "id and key are required" },
        { status: 400 }
      );
    }

    const order = await getOrder(id);
    if (!order || order.order_key !== key) {
      return NextResponse.json(
        { code: "not_found", message: "Order not found" },
        { status: 404 }
      );
    }

    const status = order.status || "";
    const transactionId = order.transaction_id || "";
    const paid = isPaidStatus(
      status,
      (order as { date_paid?: string | null }).date_paid,
      transactionId
    );

    return NextResponse.json(
      {
        order_id: order.id,
        number: String(order.id),
        status,
        paid,
        payment_method: order.payment_method,
        transaction_id: transactionId || null,
        needs_payment: ["pending", "failed"].includes(status.toLowerCase()),
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
