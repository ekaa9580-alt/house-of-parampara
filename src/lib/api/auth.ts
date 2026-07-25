import axios from "axios";
import { wpApi, wcApi, ensureConfigured, createWpApi, getWcBaseUrl } from "./client";
import type {
  AuthTokens,
  LoginCredentials,
  RegisterData,
  WooCustomer,
  WooOrder,
  WooAddress,
} from "@/types/woocommerce";

/**
 * Login via JWT plugin (if installed), else WordPress wp-login.php session,
 * else Application Passwords. Uses only WP/WC mechanisms — no custom auth DB.
 */
export async function login(
  credentials: LoginCredentials
): Promise<AuthTokens & { customerId?: number }> {
  ensureConfigured();

  const jwtPath =
    process.env.NEXT_PUBLIC_JWT_AUTH_URL || "/jwt-auth/v1/token";

  // 1. JWT Authentication for WP REST API
  try {
    const response = await wpApi.post<AuthTokens>(jwtPath, {
      username: credentials.username,
      password: credentials.password,
    });
    if (response.data?.token) return response.data;
  } catch {
    /* try next */
  }

  // 2. Alternate JWT paths
  for (const path of ["/jwt-auth/v1/token", "/simple-jwt-login/v1/auth"]) {
    try {
      const response = await wpApi.post<AuthTokens | { data?: AuthTokens }>(
        path,
        {
          username: credentials.username,
          password: credentials.password,
          email: credentials.username,
        }
      );
      const data = (response.data as AuthTokens)?.token
        ? (response.data as AuthTokens)
        : (response.data as { data?: AuthTokens })?.data;
      if (data?.token) return data;
    } catch {
      /* continue */
    }
  }

  // 3. WordPress wp-login.php → authenticated /wp/v2/users/me
  try {
    const wpLogin = await loginViaWpLogin(credentials);
    if (wpLogin) return wpLogin;
  } catch {
    /* try next */
  }

  // 4. Application Passwords → /wp/v2/users/me
  try {
    const me = await createWpApi().get<{
      id: number;
      name: string;
      slug: string;
      email?: string;
    }>("/wp/v2/users/me", {
      auth: {
        username: credentials.username,
        password: credentials.password,
      },
      params: { context: "edit" },
    });

    const email =
      me.data.email ||
      (credentials.username.includes("@")
        ? credentials.username
        : `${me.data.slug}@users.local`);

    let customerId: number | undefined = me.data.id;
    try {
      const customers = await wcApi.get<WooCustomer[]>("/customers", {
        params: { email, role: "all" },
      });
      const match =
        customers.data.find((c) => c.email === email) ||
        customers.data.find((c) => c.id === me.data.id) ||
        customers.data[0];
      if (match) customerId = match.id;
    } catch {
      /* keep id */
    }

    return {
      token: Buffer.from(
        `${credentials.username}:${credentials.password}`
      ).toString("base64"),
      user_email: email,
      user_nicename: me.data.slug,
      user_display_name: me.data.name,
      customerId,
    };
  } catch {
    /* fall through */
  }

  throw Object.assign(new Error("Invalid username or password"), {
    response: {
      data: {
        code: "invalid_credentials",
        message:
          "Invalid username or password. Install the JWT Authentication plugin on WordPress for the best headless login experience.",
      },
      status: 401,
    },
  });
}

/**
 * Authenticate against wp-login.php. On success, resolve WooCommerce customer
 * via REST (consumer keys) — cookie auth for /users/me needs a WP nonce.
 */
async function loginViaWpLogin(
  credentials: LoginCredentials
): Promise<(AuthTokens & { customerId?: number }) | null> {
  const base = getWcBaseUrl();
  const jar = axios.create({
    baseURL: base,
    timeout: 30000,
    maxRedirects: 0,
    validateStatus: (s) => s >= 200 && s < 400,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; HouseOfParampara/1.0; +https://houseofparampara.net)",
    },
  });

  const page = await jar.get("/wp-login.php");
  const setCookies = page.headers["set-cookie"] || [];
  let cookieHeader = setCookies.map((c) => c.split(";")[0]).join("; ");

  const body = new URLSearchParams({
    log: credentials.username,
    pwd: credentials.password,
    "wp-submit": "Log In",
    redirect_to: `${base}/my-account/`,
    testcookie: "1",
  });

  const loginRes = await jar.post("/wp-login.php", body.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookieHeader,
    },
    maxRedirects: 0,
    validateStatus: (s) => s >= 200 && s < 400,
  });

  const loginCookies = loginRes.headers["set-cookie"] || [];
  const allCookies = [...setCookies, ...loginCookies]
    .map((c) => c.split(";")[0])
    .filter(Boolean);

  const loggedInCookie = allCookies.find((c) =>
    c.startsWith("wordpress_logged_in_")
  );
  if (!loggedInCookie) return null;

  const email = credentials.username.includes("@")
    ? credentials.username
    : credentials.username;

  let customer: WooCustomer | null = null;
  try {
    customer = await getCustomerByEmail(email);
  } catch {
    customer = null;
  }

  // If username wasn't email, search customers
  if (!customer && !credentials.username.includes("@")) {
    try {
      const response = await wcApi.get<WooCustomer[]>("/customers", {
        params: { search: credentials.username, role: "all" },
      });
      customer =
        response.data.find((c) => c.username === credentials.username) ||
        response.data[0] ||
        null;
    } catch {
      /* none */
    }
  }

  const token = Buffer.from(
    `wplogin:${credentials.username}:${credentials.password}`
  ).toString("base64");

  return {
    token,
    user_email: customer?.email || email,
    user_nicename: customer?.username || credentials.username,
    user_display_name:
      [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") ||
      customer?.username ||
      credentials.username,
    customerId: customer?.id,
  };
}

export async function validateToken(token: string): Promise<boolean> {
  try {
    const jwtUrl =
      process.env.NEXT_PUBLIC_JWT_AUTH_URL || "/jwt-auth/v1/token";
    await wpApi.post(
      `${jwtUrl}/validate`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return true;
  } catch {
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      if (decoded.startsWith("wplogin:")) {
        const [, username, password] = decoded.split(":");
        const result = await loginViaWpLogin({ username, password });
        return !!result;
      }
      const [username, password] = decoded.split(":");
      if (!username || !password) return false;
      await createWpApi().get("/wp/v2/users/me", {
        auth: { username, password },
      });
      return true;
    } catch {
      return false;
    }
  }
}

export async function register(data: RegisterData): Promise<WooCustomer> {
  ensureConfigured();
  const response = await wcApi.post<WooCustomer>("/customers", {
    email: data.email,
    username: data.username || data.email,
    password: data.password,
    first_name: data.first_name || "",
    last_name: data.last_name || "",
  });
  return response.data;
}

export async function getCustomer(id: number): Promise<WooCustomer> {
  ensureConfigured();
  const response = await wcApi.get<WooCustomer>(`/customers/${id}`);
  return response.data;
}

export async function getCustomerByEmail(
  email: string
): Promise<WooCustomer | null> {
  ensureConfigured();
  const response = await wcApi.get<WooCustomer[]>("/customers", {
    params: { email, role: "all" },
  });
  return response.data[0] ?? null;
}

export async function updateCustomer(
  id: number,
  data: Partial<WooCustomer>
): Promise<WooCustomer> {
  ensureConfigured();
  const response = await wcApi.put<WooCustomer>(`/customers/${id}`, data);
  return response.data;
}

export async function updateCustomerAddresses(
  id: number,
  billing?: Partial<WooAddress>,
  shipping?: Partial<WooAddress>
): Promise<WooCustomer> {
  return updateCustomer(id, {
    ...(billing ? { billing: billing as WooAddress } : {}),
    ...(shipping ? { shipping: shipping as WooAddress } : {}),
  });
}

export async function getCustomerOrders(
  customerId: number,
  page = 1,
  perPage = 10
): Promise<{ orders: WooOrder[]; total: number; totalPages: number }> {
  ensureConfigured();
  const response = await wcApi.get<WooOrder[]>("/orders", {
    params: {
      customer: customerId,
      page,
      per_page: perPage,
      orderby: "date",
      order: "desc",
    },
  });
  const total = Number(response.headers["x-wp-total"] ?? 0);
  const totalPages = Number(response.headers["x-wp-totalpages"] ?? 0);
  return { orders: response.data, total, totalPages };
}

export async function getOrder(
  orderId: number,
  customerId?: number
): Promise<WooOrder> {
  ensureConfigured();
  const response = await wcApi.get<WooOrder>(`/orders/${orderId}`);
  if (customerId && response.data.customer_id !== customerId) {
    throw new Error("Order not found");
  }
  return response.data;
}

export async function requestPasswordReset(email: string): Promise<void> {
  ensureConfigured();
  const base = getWcBaseUrl();

  try {
    await wpApi.post("/bdpwr/v1/reset-password", { email });
    return;
  } catch {
    /* continue */
  }

  try {
    await wpApi.post("/wp/v2/users/lost-password", { user_login: email });
    return;
  } catch {
    throw new Error(
      `Password reset: visit ${base}/my-account/lost-password/ or install a WP password-reset REST plugin.`
    );
  }
}
