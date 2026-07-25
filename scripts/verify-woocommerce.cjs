#!/usr/bin/env node
/**
 * Verify WooCommerce connection using .env.local credentials.
 * Usage: node scripts/verify-woocommerce.cjs
 */
const fs = require("fs");
const path = require("path");

function loadEnv(file) {
  const full = path.join(process.cwd(), file);
  if (!fs.existsSync(full)) return {};
  const out = {};
  for (const line of fs.readFileSync(full, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return out;
}

const env = { ...loadEnv(".env"), ...loadEnv(".env.local") };
const url = (env.NEXT_PUBLIC_WC_URL || "").replace(/\/+$/, "");
const key = env.WC_CONSUMER_KEY || "";
const secret = env.WC_CONSUMER_SECRET || "";
const useMock = env.NEXT_PUBLIC_USE_MOCK;

console.log("── House of Parampara · WooCommerce verify ──");
console.log("URL:     ", url || "(missing)");
console.log("Key:     ", key ? `${key.slice(0, 8)}…` : "(missing)");
console.log("Secret:  ", secret ? `${secret.slice(0, 8)}…` : "(missing)");
console.log("USE_MOCK:", useMock);

if (!url || url.includes("your-store") || !key.startsWith("ck_") || key.includes("xxx")) {
  console.error("\n✗ Credentials not configured.");
  console.error("Edit .env.local with your real store URL + REST API keys, set NEXT_PUBLIC_USE_MOCK=false, then re-run.");
  process.exit(1);
}

const endpoint = `${url}/wp-json/wc/v3/products?per_page=1&consumer_key=${encodeURIComponent(key)}&consumer_secret=${encodeURIComponent(secret)}`;

fetch(endpoint)
  .then(async (res) => {
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    if (!res.ok) {
      console.error("\n✗ WooCommerce API error", res.status, data);
      process.exit(1);
    }
    const total = res.headers.get("x-wp-total");
    console.log("\n✓ Connected.");
    console.log("  Products available:", total ?? (Array.isArray(data) ? data.length : "?"));
    if (Array.isArray(data) && data[0]) {
      console.log("  Sample product:", data[0].name, `→ /product/${data[0].slug}`);
    }
    if (useMock === "true") {
      console.warn("\n⚠ NEXT_PUBLIC_USE_MOCK is still true — set it to false and restart `npm run dev`.");
    }
  })
  .catch((err) => {
    console.error("\n✗ Network/connection failed:", err.message);
    process.exit(1);
  });
