import { NextRequest, NextResponse } from "next/server";
import { fetchCustomer, updateCustomerProfile } from "@/lib/data/commerce";
import { parseApiError } from "@/lib/api/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return NextResponse.json(await fetchCustomer(Number(id)));
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    return NextResponse.json(await updateCustomerProfile(Number(id), body));
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
