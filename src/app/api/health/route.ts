import { NextResponse } from "next/server";
import { getDataMode, isMockDataMode } from "@/lib/data/mode";
import { getWcBaseUrl, pingWooCommerce } from "@/lib/api/client";

export async function GET() {
  const mode = getDataMode();
  const url = getWcBaseUrl();

  if (isMockDataMode()) {
    return NextResponse.json({
      mode,
      connected: false,
      message:
        "Mock mode active. Set NEXT_PUBLIC_USE_MOCK=false and valid WC credentials in .env.local, then restart.",
      url: url || null,
    });
  }

  const ping = await pingWooCommerce();
  return NextResponse.json({
    mode,
    connected: ping.ok,
    url: ping.url,
    products: ping.products ?? 0,
    error: ping.error ?? null,
    message: ping.ok
      ? "WooCommerce connected. Frontend is live."
      : `WooCommerce connection failed: ${ping.error}`,
  });
}
