/**
 * Development seed data — WooCommerce-identical shapes.
 * Used ONLY when NEXT_PUBLIC_USE_MOCK=true OR WC credentials are missing.
 * UI components never import this file. Only the API data provider does.
 */
import type {
  WooProduct,
  WooCategory,
  WooReview,
  WooCart,
  WooCustomer,
  WooOrder,
  WooPaymentMethod,
  HeroBanner,
  SiteSettings,
  Testimonial,
} from "@/types/woocommerce";

const img = (path: string, alt = "") => ({
  id: Math.floor(Math.random() * 100000),
  src: path,
  name: alt,
  alt,
});

export const seedCategories: WooCategory[] = [
  {
    id: 1,
    name: "Sarees",
    slug: "sarees",
    parent: 0,
    description:
      "Handpicked sarees celebrating Indian craft — kasavu, silk, and festive weaves.",
    display: "default",
    image: img("/seed/banners/heritage-elegance.png", "Sarees"),
    menu_order: 1,
    count: 4,
  },
  {
    id: 2,
    name: "Festive Wear",
    slug: "festive-wear",
    parent: 0,
    description: "Occasion wear for Onam, Varamahalakshmi, and celebrations.",
    display: "default",
    image: img("/seed/banners/festive-collection.png", "Festive Wear"),
    menu_order: 2,
    count: 3,
  },
  {
    id: 3,
    name: "Onam Collection",
    slug: "onam-collection",
    parent: 0,
    description: "Prints that bloom this Onam — festive charm in every detail.",
    display: "default",
    image: img("/seed/banners/onam-collection.jpg.png", "Onam Collection"),
    menu_order: 3,
    count: 2,
  },
  {
    id: 4,
    name: "Menswear",
    slug: "menswear",
    parent: 0,
    description: "Kurtas and mundus in ivory, gold, and heritage weaves.",
    display: "default",
    image: img("/seed/banners/festive-collection.png", "Menswear"),
    menu_order: 4,
    count: 1,
  },
];

function product(
  partial: Partial<WooProduct> &
    Pick<WooProduct, "id" | "name" | "slug" | "price" | "regular_price">
): WooProduct {
  return {
    date_created: "2026-06-01T10:00:00",
    date_modified: "2026-07-01T10:00:00",
    type: "simple",
    status: "publish",
    featured: false,
    catalog_visibility: "visible",
    description: "",
    short_description: "",
    sku: `HOP-${partial.id}`,
    sale_price: "",
    on_sale: false,
    purchasable: true,
    total_sales: 0,
    virtual: false,
    downloadable: false,
    tax_status: "taxable",
    tax_class: "",
    manage_stock: true,
    stock_quantity: 25,
    stock_status: "instock",
    backorders: "no",
    backorders_allowed: false,
    backordered: false,
    sold_individually: false,
    weight: "",
    dimensions: { length: "", width: "", height: "" },
    shipping_required: true,
    shipping_taxable: true,
    shipping_class: "",
    shipping_class_id: 0,
    reviews_allowed: true,
    average_rating: "4.8",
    rating_count: 12,
    related_ids: [],
    upsell_ids: [],
    cross_sell_ids: [],
    parent_id: 0,
    categories: [],
    tags: [],
    images: [],
    attributes: [],
    default_attributes: [],
    variations: [],
    menu_order: 0,
    meta_data: [],
    permalink: `/product/${partial.slug}`,
    ...partial,
  };
}

export const seedProducts: WooProduct[] = [
  product({
    id: 101,
    name: "Kasavu Bloom Saree",
    slug: "kasavu-bloom-saree",
    price: "8999",
    regular_price: "10999",
    sale_price: "8999",
    on_sale: true,
    featured: true,
    total_sales: 48,
    short_description:
      "Cream kasavu saree with hand-painted marigold motifs and a luminous gold border.",
    description:
      "<p>Crafted for festive gatherings, this kasavu bloom saree pairs traditional Kerala weaving with contemporary floral prints. Lightweight, breathable, and finished with a rich zari border.</p><ul><li>Fabric: Soft cotton-silk blend</li><li>Border: Gold kasavu weave</li><li>Care: Dry clean recommended</li></ul>",
    categories: [{ id: 1, name: "Sarees", slug: "sarees" }],
    images: [
      img("/seed/banners/onam-collection.jpg.png", "Kasavu Bloom Saree"),
      img("/seed/banners/heritage-elegance.png", "Kasavu Bloom Saree detail"),
    ],
    average_rating: "4.9",
    rating_count: 18,
    related_ids: [102, 103, 105],
  }),
  product({
    id: 102,
    name: "Heritage Ivory Saree",
    slug: "heritage-ivory-saree",
    price: "12499",
    regular_price: "12499",
    featured: true,
    total_sales: 62,
    short_description:
      "Off-white heritage saree with thick gold-woven border and subtle motifs.",
    description:
      "<p>An ode to quiet luxury. Ivory body, luminous gold border, and serene draping for temple visits and evening celebrations.</p><ul><li>Fabric: Premium silk blend</li><li>Length: 5.5 metres + blouse piece</li><li>Care: Dry clean only</li></ul>",
    categories: [
      { id: 1, name: "Sarees", slug: "sarees" },
      { id: 2, name: "Festive Wear", slug: "festive-wear" },
    ],
    images: [
      img("/seed/banners/heritage-elegance.png", "Heritage Ivory Saree"),
      img("/seed/banners/festive-collection.png", "Heritage Ivory Saree styled"),
    ],
    average_rating: "5.0",
    rating_count: 24,
    related_ids: [101, 103, 104],
  }),
  product({
    id: 103,
    name: "Onam Floral Print Saree",
    slug: "onam-floral-print-saree",
    price: "7499",
    regular_price: "8999",
    sale_price: "7499",
    on_sale: true,
    featured: true,
    total_sales: 35,
    short_description:
      "Festive cream saree with yellow floral prints — prints that bloom this Onam.",
    description:
      "<p>Handpicked for Onam celebrations. Soft drape, festive prints, and a delicate gold-kissed border.</p>",
    categories: [
      { id: 1, name: "Sarees", slug: "sarees" },
      { id: 3, name: "Onam Collection", slug: "onam-collection" },
    ],
    images: [
      img("/seed/banners/onam-collection.jpg.png", "Onam Floral Print Saree"),
    ],
    related_ids: [101, 105],
  }),
  product({
    id: 104,
    name: "Rakhi Ivory Kurta Set",
    slug: "rakhi-ivory-kurta-set",
    price: "5999",
    regular_price: "5999",
    featured: false,
    total_sales: 28,
    short_description:
      "Ivory kurta with gold-border mundu — crafted for festive family rituals.",
    description:
      "<p>Matching festive menswear in ivory and gold. Soft handfeel, traditional silhouette, modern ease.</p>",
    categories: [
      { id: 4, name: "Menswear", slug: "menswear" },
      { id: 2, name: "Festive Wear", slug: "festive-wear" },
    ],
    images: [
      img("/seed/banners/festive-collection.png", "Rakhi Ivory Kurta Set"),
    ],
    related_ids: [102, 105],
  }),
  product({
    id: 105,
    name: "Temple Glow Kasavu Saree",
    slug: "temple-glow-kasavu-saree",
    price: "9999",
    regular_price: "9999",
    featured: true,
    total_sales: 41,
    short_description:
      "Classic kasavu with jasmine-ready elegance — made for temple and celebration.",
    description:
      "<p>Timeless Kerala kasavu reimagined with House of Parampara finishing. Pair with jasmine and heirloom gold.</p>",
    categories: [
      { id: 1, name: "Sarees", slug: "sarees" },
      { id: 2, name: "Festive Wear", slug: "festive-wear" },
    ],
    images: [
      img("/seed/banners/heritage-elegance.png", "Temple Glow Kasavu Saree"),
      img("/seed/banners/onam-collection.jpg.png", "Temple Glow alternate"),
    ],
    related_ids: [101, 102, 103],
  }),
  product({
    id: 106,
    name: "Varamahalakshmi Festive Saree",
    slug: "varamahalakshmi-festive-saree",
    price: "8499",
    regular_price: "9499",
    sale_price: "8499",
    on_sale: true,
    total_sales: 19,
    short_description:
      "Ivory saree with embroidered motifs — perfect for Varamahalakshmi and puja.",
    description:
      "<p>Celebrate abundance in ivory and gold. Subtle embroidery, soft fall, festive readiness.</p>",
    categories: [
      { id: 1, name: "Sarees", slug: "sarees" },
      { id: 2, name: "Festive Wear", slug: "festive-wear" },
    ],
    images: [
      img("/seed/banners/festive-collection.png", "Varamahalakshmi Festive Saree"),
    ],
    related_ids: [102, 104, 105],
  }),
  product({
    id: 107,
    name: "Palace Arch Silk Saree",
    slug: "palace-arch-silk-saree",
    price: "15999",
    regular_price: "15999",
    featured: true,
    total_sales: 15,
    short_description:
      "Premium silk saree with architectural gold border — quiet wealth, heritage grace.",
    description:
      "<p>A statement silk for evenings of ritual and celebration. Rich gold border, luminous ivory body.</p>",
    categories: [{ id: 1, name: "Sarees", slug: "sarees" }],
    images: [
      img("/seed/banners/heritage-elegance.png", "Palace Arch Silk Saree"),
    ],
    average_rating: "4.7",
    rating_count: 9,
    related_ids: [102, 105],
  }),
  product({
    id: 108,
    name: "Marigold Petal Onam Saree",
    slug: "marigold-petal-onam-saree",
    price: "6999",
    regular_price: "7999",
    sale_price: "6999",
    on_sale: true,
    total_sales: 22,
    short_description:
      "Onam-ready floral saree with marigold energy and gold-kissed edges.",
    description:
      "<p>Bring tradition to life this Onam. Soft print, festive colour story, easy drape.</p>",
    categories: [
      { id: 3, name: "Onam Collection", slug: "onam-collection" },
      { id: 1, name: "Sarees", slug: "sarees" },
    ],
    images: [
      img("/seed/banners/onam-collection.jpg.png", "Marigold Petal Onam Saree"),
    ],
    related_ids: [101, 103],
  }),
];

export const seedBanners: HeroBanner[] = [
  {
    id: 1,
    title: "Prints That Bloom This Onam",
    subtitle: "Onam Collection 2026",
    description: "Handpicked sarees with festive charm in every detail.",
    image: "/seed/banners/onam-collection.jpg.png",
    cta_text: "Shop Now",
    cta_url: "/category/onam-collection",
    text_position: "left",
    overlay_opacity: 0.25,
  },
  {
    id: 2,
    title: "Heritage, Reimagined",
    subtitle: "House of Parampara",
    description: "Timeless craft. Modern grace. Bringing tradition to life.",
    image: "/seed/banners/heritage-elegance.png",
    cta_text: "Explore Collection",
    cta_url: "/shop",
    secondary_cta_text: "Our Story",
    secondary_cta_url: "/about",
    text_position: "left",
    overlay_opacity: 0.2,
  },
  {
    id: 3,
    title: "Festive Bonds",
    subtitle: "Celebration Edit",
    description: "Ivory, gold, and rituals — crafted for moments that matter.",
    image: "/seed/banners/festive-collection.png",
    cta_text: "Shop Festive",
    cta_url: "/category/festive-wear",
    text_position: "left",
    overlay_opacity: 0.3,
  },
];

export const seedSettings: SiteSettings = {
  site_name: "House of Parampara",
  tagline: "Bringing Tradition to Life",
  logo: "/seed/logo.png",
  about_preview:
    "House of Parampara celebrates living Indian textile traditions — kasavu, silk, and festive craft — reimagined for the modern wardrobe. Each piece honours the makers who carry these skills forward.",
  about_image: "/seed/banners/heritage-elegance.png",
  newsletter_heading: "Join the Parampara Circle",
  newsletter_text:
    "Be first to discover new collections, private sales, and stories from the atelier.",
  contact_email: "support@houseofparampara.net",
  contact_phone: "+91 99999 99999",
  whatsapp: "919999999999",
  instagram: "https://instagram.com/houseofparampara",
  address: "India",
  testimonials: [],
  instagram_posts: [],
};

export const seedTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Ananya R.",
    role: "Bengaluru",
    content:
      "The kasavu drape felt ceremonial and effortless. Packaging was as considered as the saree itself.",
    rating: 5,
  },
  {
    id: 2,
    name: "Meera K.",
    role: "Chennai",
    content:
      "Quiet luxury done right. The ivory gold border caught the temple lamps beautifully.",
    rating: 5,
  },
  {
    id: 3,
    name: "Divya S.",
    role: "Kochi",
    content:
      "Ordered for Onam — prints, fall, and finish exceeded every expectation.",
    rating: 5,
  },
];

export const seedReviews: WooReview[] = [
  {
    id: 1,
    date_created: "2026-06-15T12:00:00",
    product_id: 102,
    status: "approved",
    reviewer: "Ananya R.",
    reviewer_email: "a@example.com",
    review: "Exquisite weave and finishing. Will order again.",
    rating: 5,
    verified: true,
  },
  {
    id: 2,
    date_created: "2026-06-20T12:00:00",
    product_id: 101,
    status: "approved",
    reviewer: "Meera K.",
    reviewer_email: "m@example.com",
    review: "The marigold motifs are stunning in person.",
    rating: 5,
    verified: true,
  },
];

export const seedPaymentMethods: WooPaymentMethod[] = [
  {
    id: "cod",
    title: "Cash on Delivery",
    description: "Pay with cash upon delivery.",
    order: 1,
    enabled: true,
    method_title: "Cash on Delivery",
    method_description: "COD",
  },
  {
    id: "razorpay",
    title: "Razorpay",
    description: "Pay securely via Razorpay (UPI, cards, wallets).",
    order: 2,
    enabled: true,
    method_title: "Razorpay",
    method_description: "Online payments",
  },
];

/** In-memory cart for mock mode */
const mockCart: WooCart = {
  items: [],
  coupons: [],
  totals: {
    total_items: "0",
    total_items_tax: "0",
    total_fees: "0",
    total_fees_tax: "0",
    total_discount: "0",
    total_discount_tax: "0",
    total_shipping: "0",
    total_shipping_tax: "0",
    total_price: "0",
    total_tax: "0",
    currency_code: "INR",
    currency_symbol: "₹",
    currency_minor_unit: 0,
  },
  items_count: 0,
  needs_payment: false,
  needs_shipping: true,
  has_calculated_shipping: false,
  payment_methods: ["cod", "razorpay"],
};

function recalcCart() {
  const subtotal = mockCart.items.reduce((sum, item) => {
    return sum + parseFloat(item.prices.price) * item.quantity;
  }, 0);
  const discount = mockCart.coupons.reduce((sum, c) => {
    return sum + parseFloat(c.totals.total_discount || "0");
  }, 0);
  const total = Math.max(0, subtotal - discount);
  mockCart.items_count = mockCart.items.reduce((n, i) => n + i.quantity, 0);
  mockCart.needs_payment = mockCart.items_count > 0;
  mockCart.totals = {
    ...mockCart.totals,
    total_items: String(subtotal),
    total_discount: String(discount),
    total_price: String(total),
    total_tax: "0",
    total_shipping: mockCart.items_count > 0 ? "0" : "0",
  };
}

export function getMockCart(): WooCart {
  return structuredClone(mockCart);
}

export function mockAddToCart(
  productId: number,
  quantity = 1
): WooCart {
  const product = seedProducts.find((p) => p.id === productId);
  if (!product) throw new Error("Product not found");

  const existing = mockCart.items.find((i) => i.id === productId);
  if (existing) {
    existing.quantity += quantity;
    existing.totals.line_total = String(
      parseFloat(existing.prices.price) * existing.quantity
    );
    existing.totals.line_subtotal = existing.totals.line_total;
  } else {
    mockCart.items.push({
      key: `mock-${productId}-${Date.now()}`,
      id: productId,
      quantity,
      name: product.name,
      sku: product.sku,
      permalink: `/product/${product.slug}`,
      images: product.images,
      prices: {
        price: product.price,
        regular_price: product.regular_price,
        sale_price: product.sale_price || product.price,
        currency_code: "INR",
        currency_symbol: "₹",
        currency_minor_unit: 0,
      },
      totals: {
        line_subtotal: String(parseFloat(product.price) * quantity),
        line_total: String(parseFloat(product.price) * quantity),
        currency_code: "INR",
        currency_symbol: "₹",
        currency_minor_unit: 0,
      },
    });
  }
  recalcCart();
  return getMockCart();
}

export function mockUpdateCartItem(key: string, quantity: number): WooCart {
  const item = mockCart.items.find((i) => i.key === key);
  if (item) {
    if (quantity <= 0) {
      mockCart.items = mockCart.items.filter((i) => i.key !== key);
    } else {
      item.quantity = quantity;
      item.totals.line_total = String(
        parseFloat(item.prices.price) * quantity
      );
      item.totals.line_subtotal = item.totals.line_total;
    }
  }
  recalcCart();
  return getMockCart();
}

export function mockRemoveCartItem(key: string): WooCart {
  mockCart.items = mockCart.items.filter((i) => i.key !== key);
  recalcCart();
  return getMockCart();
}

export function mockApplyCoupon(code: string): WooCart {
  if (code.toUpperCase() === "PARAMPARA10") {
    const discount = parseFloat(mockCart.totals.total_items) * 0.1;
    mockCart.coupons = [
      {
        code: "PARAMPARA10",
        discount_type: "percent",
        totals: {
          total_discount: String(Math.round(discount)),
          total_discount_tax: "0",
          currency_code: "INR",
          currency_symbol: "₹",
          currency_minor_unit: 0,
        },
      },
    ];
    recalcCart();
    return getMockCart();
  }
  throw Object.assign(new Error("Invalid coupon code"), {
    response: { data: { code: "invalid_coupon", message: "Invalid coupon code" }, status: 400 },
  });
}

export function mockRemoveCoupon(): WooCart {
  mockCart.coupons = [];
  recalcCart();
  return getMockCart();
}

export function clearMockCart(): WooCart {
  mockCart.items = [];
  mockCart.coupons = [];
  recalcCart();
  return getMockCart();
}

export const seedCustomer: WooCustomer = {
  id: 1,
  email: "patron@houseofparampara.com",
  first_name: "Ananya",
  last_name: "Rao",
  username: "ananya",
  billing: {
    first_name: "Ananya",
    last_name: "Rao",
    address_1: "12 Heritage Lane",
    city: "Bengaluru",
    state: "KA",
    postcode: "560001",
    country: "IN",
    email: "patron@houseofparampara.com",
    phone: "+919999999999",
  },
  shipping: {
    first_name: "Ananya",
    last_name: "Rao",
    address_1: "12 Heritage Lane",
    city: "Bengaluru",
    state: "KA",
    postcode: "560001",
    country: "IN",
  },
};

export const seedOrders: WooOrder[] = [
  {
    id: 1001,
    parent_id: 0,
    status: "completed",
    currency: "INR",
    date_created: "2026-06-10T10:00:00",
    date_modified: "2026-06-12T10:00:00",
    discount_total: "0",
    discount_tax: "0",
    shipping_total: "0",
    shipping_tax: "0",
    cart_tax: "0",
    total: "12499",
    total_tax: "0",
    customer_id: 1,
    order_key: "wc_order_mock_1001",
    billing: seedCustomer.billing,
    shipping: seedCustomer.shipping,
    payment_method: "cod",
    payment_method_title: "Cash on Delivery",
    transaction_id: "",
    customer_note: "",
    line_items: [
      {
        id: 1,
        name: "Heritage Ivory Saree",
        product_id: 102,
        variation_id: 0,
        quantity: 1,
        tax_class: "",
        subtotal: "12499",
        subtotal_tax: "0",
        total: "12499",
        total_tax: "0",
        sku: "HOP-102",
        price: 12499,
        image: seedProducts[1].images[0],
      },
    ],
    shipping_lines: [],
    coupon_lines: [],
    meta_data: [],
  },
];

export const seedPages: Record<
  string,
  { id: number; title: { rendered: string }; content: { rendered: string }; excerpt: { rendered: string } }
> = {
  about: {
    id: 1,
    title: { rendered: "About House of Parampara" },
    excerpt: { rendered: "Bringing tradition to life." },
    content: {
      rendered: `<p>House of Parampara is a celebration of Indian textile heritage — where ancestral craft meets contemporary elegance.</p><p>From Kerala kasavu to festive silks, every piece is curated to honour the makers and the rituals that give clothing meaning.</p><p>Our promise: timeless design, considered materials, and a shopping experience as refined as the garments themselves.</p>`,
    },
  },
  "privacy-policy": {
    id: 2,
    title: { rendered: "Privacy Policy" },
    excerpt: { rendered: "" },
    content: {
      rendered: `<p>We respect your privacy. Personal information collected during browsing, account creation, and checkout is used solely to fulfil orders and improve your experience. We do not sell your data.</p><p>Replace this content in WordPress Pages when connecting WooCommerce — the frontend will load it automatically.</p>`,
    },
  },
  "shipping-policy": {
    id: 3,
    title: { rendered: "Shipping Policy" },
    excerpt: { rendered: "" },
    content: {
      rendered: `<p>Orders are typically dispatched within 2–4 business days. Delivery timelines vary by location. You will receive tracking once your order ships.</p><p>Manage this page in WordPress — no frontend code changes required.</p>`,
    },
  },
  "return-policy": {
    id: 4,
    title: { rendered: "Return Policy" },
    excerpt: { rendered: "" },
    content: {
      rendered: `<p>Unworn items with tags may be returned within 7 days of delivery. Custom and sale items may be final sale. Contact us to initiate a return.</p>`,
    },
  },
  contact: {
    id: 5,
    title: { rendered: "Contact" },
    excerpt: { rendered: "" },
    content: {
      rendered: `<p>We would love to hear from you. Reach out for styling advice, order help, or atelier visits.</p>`,
    },
  },
};
