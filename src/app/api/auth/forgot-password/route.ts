import { NextRequest, NextResponse } from "next/server";
import { requestReset } from "@/lib/data/commerce";
import { parseApiError } from "@/lib/api/client";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    return NextResponse.json(await requestReset(email));
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(
      {
        success: true,
        message: "If an account exists, a reset link has been sent.",
      },
      { status: err.data?.status === 501 ? 501 : 200 }
    );
  }
}
