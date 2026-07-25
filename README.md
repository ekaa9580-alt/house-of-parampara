# House of Parampara — Luxury WooCommerce Frontend

Production-ready Next.js ecommerce frontend for **House of Parampara**.

All products, categories, prices, images, banners, stock, coupons, orders, and reviews come from the **data layer**. Components never hardcode catalogue content.

---

## Connect WooCommerce in under 10 minutes

### 1. Create API keys in WordPress

1. Open **WooCommerce → Settings → Advanced → REST API**
2. Click **Add key**
3. Description: `House of Parampara Frontend`
4. User: an admin user
5. Permissions: **Read/Write**
6. Copy **Consumer Key** (`ck_…`) and **Consumer Secret** (`cs_…`)

### 2. Enable JWT login (for My Account)

Install one of:

- [JWT Authentication for WP REST API](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/)
- or a WooCommerce-compatible JWT plugin

Add to `wp-config.php`:

```php
define('JWT_AUTH_SECRET_KEY', 'your-long-random-secret');
define('JWT_AUTH_CORS_ENABLE', true);
```

### 3. Configure the frontend

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_WC_URL=https://your-store.com
WC_CONSUMER_KEY=ck_xxxxxxxx
WC_CONSUMER_SECRET=cs_xxxxxxxx
NEXT_PUBLIC_SITE_URL=https://your-frontend.com
```

### 4. Restart

```bash
npm install
npm run dev
```

**That is all.** No component, page, layout, or animation changes are required.

Check `/api/health` — it should return `{ "mode": "woocommerce" }`.

---

## Development (mock mode)

With no WooCommerce credentials (or `NEXT_PUBLIC_USE_MOCK=true`), the app uses **seed data** that mirrors WooCommerce REST shapes:

- Products, categories, banners, reviews, cart, checkout, auth, orders
- Brand logo + hero banners from `/public/seed/`

```bash
cp .env.example .env.local
# leave NEXT_PUBLIC_USE_MOCK=true (default when WC is not configured)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Mock helpers:

- Login: any email + password (4+ characters)
- Coupon: `PARAMPARA10`

---

## Architecture

```
UI Components  →  React Query Hooks  →  /api/* routes  →  Data Provider
                                                         ├─ mock (seed)
                                                         └─ WooCommerce REST
```

| Layer | Role |
|--------|------|
| `src/components/*` | Presentational only — receives props / hooks |
| `src/hooks/useWooCommerce.ts` | React Query hooks |
| `src/app/api/*` | Next.js API proxies |
| `src/lib/data/*` | Source switch + seed data |
| `src/lib/api/*` | Live WooCommerce / Store API clients |

Switching sources is controlled only by environment variables (`src/lib/data/mode.ts`).

---

## Pages

| Route | Source |
|--------|--------|
| `/` | Banners, categories, featured / latest / bestsellers |
| `/shop` | Products + filters |
| `/category/[slug]` | Category + products |
| `/product/[slug]` | Product, reviews, related |
| `/cart` | Store API cart |
| `/checkout` | Store API checkout + WC payment gateways |
| `/login` `/register` | JWT + WC customers |
| `/my-account` `/orders` | Customer + orders |
| `/about` `/contact` / policies | WP pages / settings |
| `/wishlist` | Local wishlist (IDs) + product API |

---

## Hero banners (no code changes)

When live, banners are loaded from:

1. Custom endpoint `NEXT_PUBLIC_BANNERS_ENDPOINT` (default `/wp-json/hop/v1/banners`)
2. ACF options `banners` (optional fallback)

### Install the banners bridge (required)

The Customizer Hero Slider lives in the WordPress theme. Next.js reads it via REST:

1. Copy `wordpress/hop-banners.php` to `wp-content/plugins/hop-banners/hop-banners.php`
   (or `wp-content/mu-plugins/hop-banners.php`)
2. Activate the plugin (skip for mu-plugins)
3. Keep slides under **Appearance → Customize → Hero Slider**
4. Confirm: `https://your-wordpress-site.com/wp-json/hop/v1/banners`

Expected JSON shape:

```json
[
  {
    "id": 1,
    "title": "…",
    "subtitle": "…",
    "description": "…",
    "image": "https://…",
    "cta_text": "Shop Now",
    "cta_url": "/shop",
    "text_position": "left"
  }
]
```

---

## Payments

Frontend only calls WooCommerce **Checkout / Store API**.

Enable in WP Admin:

- Cash on Delivery
- Razorpay / Stripe / PayPal plugins

Do not implement gateways in this repo.

---

## CORS / permalinks

- WooCommerce → Settings → Advanced → permalinks should be **Post name**
- Allow your frontend origin for Store API cookies if frontend and WP are on different domains
- For same-domain reverse-proxy setups, cart cookies work most reliably

---

## Deploy

```bash
npm run build
npm start
```

Or deploy to Vercel / any Node host. Set the same env vars in the host dashboard.

---

## Brand assets (seed only)

Development assets live in `public/seed/` (logo + banners). They are referenced **only** from `src/lib/data/seed.ts`. Live WooCommerce media replaces them automatically when you connect the store.

---

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · GSAP · Framer Motion · Swiper · TanStack Query · Axios · Zustand
