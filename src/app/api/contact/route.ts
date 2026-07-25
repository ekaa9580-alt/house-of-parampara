import { NextRequest, NextResponse } from "next/server";
import { useMockData } from "@/lib/data/mode";
import { parseApiError } from "@/lib/api/client";

/** POST /api/contact — soft capture for atelier enquiries */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { code: "invalid", message: "Name, email, and message are required" },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { code: "invalid", message: "Please enter a valid email" },
        { status: 400 }
      );
    }

    if (!useMockData()) {
      try {
        const { subscribeNewsletter } = await import("@/lib/api/content");
        await subscribeNewsletter(email).catch(() => null);
      } catch {
        /* soft fail — enquiry still accepted */
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Thank you — we will be in touch.",
    });
  } catch (error) {
    const err = parseApiError(error);
    return NextResponse.json(err, { status: err.data?.status || 500 });
  }
}
