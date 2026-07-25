import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/data/commerce";
import { parseApiError } from "@/lib/api/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customer = await registerUser(body);
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
