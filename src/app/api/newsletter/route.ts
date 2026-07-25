import { NextRequest, NextResponse } from "next/server";
import { subscribeEmail } from "@/lib/data/commerce";
import { parseApiError } from "@/lib/api/client";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { code: "invalid_email", message: "Please enter a valid email" },
        { status: 400 }
      );
    }
    return NextResponse.json(await subscribeEmail(email));
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
