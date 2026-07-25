import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/data/commerce";
import { parseApiError } from "@/lib/api/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await loginUser({
      username: body.username,
      password: body.password,
    });
    return NextResponse.json(result);
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 401 });
  }
}
