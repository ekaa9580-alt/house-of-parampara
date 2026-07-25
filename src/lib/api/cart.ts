import {
  storeApi,
  wcApi,
  ensureConfigured,
  headerGet,
} from "./client";
import type {
  WooCart,
  WooAddress,
  CheckoutPayload,
  WooPaymentMethod,
  WooShippingMethod,
  WooShippingPackage,
} from "@/types/woocommerce";

export type CartSession = {
  nonce: string | null;
  token: string | null;
};

function cartHeaders(session: CartSession) {
  const headers: Record<string, string> = {};
  if (session.nonce) {
    headers.Nonce = session.nonce;
    headers["X-WC-Store-API-Nonce"] = session.nonce;
  }
  if (session.token) {
    headers["Cart-Token"] = session.token;
  }
  return headers;
}

function captureTokens(
  session: CartSession,
  headers: Record<string, unknown>
): CartSession {
  const nonce =
    headerGet(headers, "nonce") ||
    headerGet(headers, "x-wc-store-api-nonce");
  const token = headerGet(headers, "cart-token");
  return {
    nonce: nonce || session.nonce,
    token: token || session.token,
  };
}

export type CartResult = {
  cart: WooCart;
  session: CartSession;
};

/** Bootstrap nonce/token via GET /cart when missing. */
async function ensureSession(session: CartSession): Promise<CartSession> {
  ensureConfigured();
  if (session.nonce && session.token) return session;
  const response = await storeApi.get<WooCart>("/cart", {
    headers: {
      ...cartHeaders(session),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    },
    // Hostinger/LiteSpeed caches GET /cart — bust it
    params: { _: Date.now() },
  });
  return captureTokens(session, response.headers as Record<string, unknown>);
}

export async function getCart(
  session: CartSession = { nonce: null, token: null }
): Promise<CartResult> {
  ensureConfigured();
  let s = session;
  const response = await storeApi.get<WooCart>("/cart", {
    headers: {
      ...cartHeaders(s),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    },
    params: { _: Date.now() },
  });
  s = captureTokens(s, response.headers as Record<string, unknown>);
  return { cart: response.data, session: s };
}

export async function addToCart(
  productId: number,
  quantity = 1,
  variationId?: number,
  variation?: { attribute: string; value: string }[],
  session: CartSession = { nonce: null, token: null }
): Promise<CartResult> {
  let s = await ensureSession(session);

  const body: Record<string, unknown> = {
    id: variationId || productId,
    quantity,
  };
  if (variation?.length) {
    body.variation = variation.map((v) => ({
      attribute: v.attribute.startsWith("attribute_")
        ? v.attribute
        : v.attribute.startsWith("pa_")
          ? `attribute_${v.attribute}`
          : `attribute_${v.attribute.replace(/^attribute_/, "")}`,
      value: v.value,
    }));
    if (!variationId) body.id = productId;
  }

  const response = await storeApi.post<WooCart>("/cart/add-item", body, {
    headers: cartHeaders(s),
  });
  s = captureTokens(s, response.headers as Record<string, unknown>);
  return { cart: response.data, session: s };
}

export async function updateCartItem(
  key: string,
  quantity: number,
  session: CartSession = { nonce: null, token: null }
): Promise<CartResult> {
  let s = await ensureSession(session);
  const response = await storeApi.post<WooCart>(
    "/cart/update-item",
    { key, quantity },
    { headers: cartHeaders(s) }
  );
  s = captureTokens(s, response.headers as Record<string, unknown>);
  return { cart: response.data, session: s };
}

export async function removeCartItem(
  key: string,
  session: CartSession = { nonce: null, token: null }
): Promise<CartResult> {
  let s = await ensureSession(session);
  const response = await storeApi.post<WooCart>(
    "/cart/remove-item",
    { key },
    { headers: cartHeaders(s) }
  );
  s = captureTokens(s, response.headers as Record<string, unknown>);
  return { cart: response.data, session: s };
}

export async function applyCoupon(
  code: string,
  session: CartSession = { nonce: null, token: null }
): Promise<CartResult> {
  let s = await ensureSession(session);
  const response = await storeApi.post<WooCart>(
    "/cart/apply-coupon",
    { code },
    { headers: cartHeaders(s) }
  );
  s = captureTokens(s, response.headers as Record<string, unknown>);
  return { cart: response.data, session: s };
}

export async function removeCoupon(
  code: string,
  session: CartSession = { nonce: null, token: null }
): Promise<CartResult> {
  let s = await ensureSession(session);
  const response = await storeApi.post<WooCart>(
    "/cart/remove-coupon",
    { code },
    { headers: cartHeaders(s) }
  );
  s = captureTokens(s, response.headers as Record<string, unknown>);
  return { cart: response.data, session: s };
}

export async function updateCustomer(
  billing?: Partial<WooAddress>,
  shipping?: Partial<WooAddress>,
  session: CartSession = { nonce: null, token: null }
): Promise<CartResult> {
  let s = await ensureSession(session);
  const response = await storeApi.post<WooCart>(
    "/cart/update-customer",
    {
      billing_address: billing,
      shipping_address: shipping,
    },
    { headers: cartHeaders(s) }
  );
  s = captureTokens(s, response.headers as Record<string, unknown>);
  return { cart: response.data, session: s };
}

export async function selectShippingRate(
  packageId: number,
  rateId: string,
  session: CartSession = { nonce: null, token: null }
): Promise<CartResult> {
  let s = await ensureSession(session);
  const response = await storeApi.post<WooCart>(
    "/cart/select-shipping-rate",
    { package_id: packageId, rate_id: rateId },
    { headers: cartHeaders(s) }
  );
  s = captureTokens(s, response.headers as Record<string, unknown>);
  return { cart: response.data, session: s };
}

export async function getShippingRates(
  session: CartSession = { nonce: null, token: null }
): Promise<{ packages: WooShippingPackage[]; session: CartSession }> {
  let s = await ensureSession(session);
  const response = await storeApi.get<unknown>("/cart/shipping-rates", {
    headers: cartHeaders(s),
  });
  s = captureTokens(s, response.headers as Record<string, unknown>);
  const raw = response.data;
  let packages: WooShippingPackage[] = [];
  if (Array.isArray(raw)) {
    packages = raw.map((pkg: any, i: number) => {
      if (pkg && Array.isArray(pkg.shipping_rates)) {
        return {
          package_id: pkg.package_id ?? i,
          name: pkg.name,
          shipping_rates: pkg.shipping_rates,
        };
      }
      if (Array.isArray(pkg)) {
        return { package_id: i, shipping_rates: pkg as WooShippingMethod[] };
      }
      return { package_id: i, shipping_rates: [] };
    });
  }
  return { packages, session: s };
}

export async function getPaymentMethods(): Promise<WooPaymentMethod[]> {
  ensureConfigured();
  try {
    const response = await wcApi.get<WooPaymentMethod[]>("/payment_gateways", {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
      params: { _: Date.now() },
    });
    const all = response.data || [];
    const enabled = all.filter(
      (g) => g.enabled === true || String(g.enabled) === "yes"
    );
    return enabled.length ? enabled : all;
  } catch {
    return [];
  }
}

export async function checkout(
  payload: CheckoutPayload,
  session: CartSession = { nonce: null, token: null }
): Promise<{
  result: {
    order_id: number;
    status: string;
    order_key: string;
    customer_id?: number;
    payment_result?: {
      payment_status: string;
      payment_details: { key: string; value: string }[];
      redirect_url: string;
    };
  };
  session: CartSession;
}> {
  let s = await ensureSession(session);

  if (payload.billing_address || payload.shipping_address) {
    const updated = await updateCustomer(
      payload.billing_address,
      payload.shipping_address,
      s
    );
    s = updated.session;
  }

  if (payload.shipping_rate?.rate_id != null) {
    const selected = await selectShippingRate(
      payload.shipping_rate.package_id ?? 0,
      payload.shipping_rate.rate_id,
      s
    );
    s = selected.session;
  }

  const body = {
    billing_address: payload.billing_address,
    shipping_address: payload.shipping_address,
    customer_note: payload.customer_note || "",
    create_account: payload.create_account || false,
    payment_method: payload.payment_method,
    payment_data: payload.payment_data || [],
  };

  const response = await storeApi.post("/checkout", body, {
    headers: cartHeaders(s),
  });
  s = captureTokens(s, response.headers as Record<string, unknown>);
  return { result: response.data, session: s };
}
