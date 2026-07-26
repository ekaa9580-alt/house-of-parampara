/* ─────────────────────────────────────────────
   House of Parampara – WooCommerce TypeScript Types
   ───────────────────────────────────────────── */

export interface WooImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: string;
  image: WooImage | null;
  menu_order: number;
  count: number;
}

export interface WooTag {
  id: number;
  name: string;
  slug: string;
}

export interface WooAttribute {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface WooDimensions {
  length: string;
  width: string;
  height: string;
}

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_modified: string;
  type: "simple" | "grouped" | "external" | "variable";
  status: string;
  featured: boolean;
  catalog_visibility: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  tax_status: string;
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: "instock" | "outofstock" | "onbackorder";
  backorders: string;
  backorders_allowed: boolean;
  backordered: boolean;
  sold_individually: boolean;
  weight: string;
  dimensions: WooDimensions;
  shipping_required: boolean;
  shipping_taxable: boolean;
  shipping_class: string;
  shipping_class_id: number;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  related_ids: number[];
  upsell_ids: number[];
  cross_sell_ids: number[];
  parent_id: number;
  categories: Pick<WooCategory, "id" | "name" | "slug">[];
  tags: WooTag[];
  images: WooImage[];
  attributes: WooAttribute[];
  default_attributes: { id: number; name: string; option: string }[];
  variations: number[];
  menu_order: number;
  meta_data: { id: number; key: string; value: unknown }[];
}

export interface WooProductVariation {
  id: number;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: "instock" | "outofstock" | "onbackorder";
  stock_quantity: number | null;
  image: WooImage | null;
  attributes: { id: number; name: string; option: string }[];
}

export interface WooReview {
  id: number;
  date_created: string;
  product_id: number;
  status: string;
  reviewer: string;
  reviewer_email: string;
  review: string;
  rating: number;
  verified: boolean;
  reviewer_avatar_urls?: Record<string, string>;
}

export interface WooCartItem {
  key: string;
  id: number;
  quantity: number;
  name: string;
  sku?: string;
  permalink?: string;
  images?: WooImage[];
  prices: {
    price: string;
    regular_price: string;
    sale_price: string;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
  };
  totals: {
    line_subtotal: string;
    line_total: string;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
  };
  quantity_limits?: {
    minimum: number;
    maximum: number;
    multiple_of: number;
    editable: boolean;
  };
  variation?: { attribute: string; value: string }[];
}

export interface WooCartCoupon {
  code: string;
  discount_type: string;
  totals: {
    total_discount: string;
    total_discount_tax: string;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
  };
}

export interface WooCartTotals {
  total_items: string;
  total_items_tax: string;
  total_fees: string;
  total_fees_tax: string;
  total_discount: string;
  total_discount_tax: string;
  total_shipping: string;
  total_shipping_tax: string;
  total_price: string;
  total_tax: string;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
}

export interface WooCart {
  items: WooCartItem[];
  coupons: WooCartCoupon[];
  totals: WooCartTotals;
  items_count: number;
  needs_payment: boolean;
  needs_shipping: boolean;
  has_calculated_shipping: boolean;
  shipping_address?: WooAddress;
  billing_address?: WooAddress;
  payment_methods?: string[];
  payment_requirements?: string[];
  errors?: { code: string; message: string }[];
}

export interface WooAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface WooCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  billing: WooAddress;
  shipping: WooAddress;
  avatar_url?: string;
  date_created?: string;
  role?: string;
  is_paying_customer?: boolean;
  meta_data?: { id: number; key: string; value: unknown }[];
}

export interface WooOrderLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  tax_class: string;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  sku: string;
  price: number;
  image?: WooImage;
}

export interface WooOrder {
  id: number;
  parent_id: number;
  status: string;
  currency: string;
  date_created: string;
  date_modified: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  customer_id: number;
  order_key: string;
  billing: WooAddress;
  shipping: WooAddress;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  customer_note: string;
  line_items: WooOrderLineItem[];
  shipping_lines: {
    id: number;
    method_title: string;
    method_id: string;
    total: string;
  }[];
  coupon_lines: { id: number; code: string; discount: string }[];
  meta_data: { id: number; key: string; value: unknown }[];
}

export interface WooCoupon {
  id: number;
  code: string;
  amount: string;
  discount_type: "percent" | "fixed_cart" | "fixed_product";
  description: string;
  date_expires: string | null;
  usage_count: number;
  individual_use: boolean;
  free_shipping: boolean;
  minimum_amount: string;
  maximum_amount: string;
}

export interface WooPaymentMethod {
  id: string;
  title: string;
  description: string;
  order: number;
  enabled: boolean;
  method_title: string;
  method_description: string;
}

export interface WooShippingMethod {
  rate_id: string;
  name: string;
  description: string;
  delivery_time: string;
  price: string;
  taxes: string;
  instance_id: number;
  method_id: string;
  selected: boolean;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
}

export interface HeroBanner {
  id: number | string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  mobile_image?: string;
  cta_text?: string;
  cta_url?: string;
  secondary_cta_text?: string;
  secondary_cta_url?: string;
  overlay_opacity?: number;
  text_position?: "left" | "center" | "right";
}

export interface Testimonial {
  id: number | string;
  name: string;
  role?: string;
  content: string;
  rating?: number;
  avatar?: string;
}

export interface InstagramPost {
  id: string;
  media_url: string;
  permalink: string;
  caption?: string;
}

export interface CmsMenuItem {
  id: number;
  title: string;
  url: string;
  target?: string;
  children?: CmsMenuItem[];
}

export interface SiteSettings {
  site_name: string;
  tagline?: string;
  logo?: string;
  logo_dark?: string;
  favicon?: string;
  about_preview?: string;
  about_image?: string;
  newsletter_heading?: string;
  newsletter_text?: string;
  contact_email?: string;
  contact_phone?: string;
  whatsapp?: string;
  instagram?: string;
  instagram_handle?: string;
  facebook?: string;
  youtube?: string;
  pinterest?: string;
  address?: string;
  maps_url?: string;
  working_hours?: string;
  contact_page_info?: string;
  footer_copyright?: string;
  footer_tagline?: string;
  announcement_enabled?: boolean;
  announcement_text?: string;
  announcement_link?: string;
  announcement_link_text?: string;
  seo_title?: string;
  seo_description?: string;
  seo_og_image?: string;
  color_primary?: string;
  color_accent?: string;
  color_background?: string;
  color_ink?: string;
  color_cream?: string;
  color_gold?: string;
  font_display?: string;
  font_body?: string;
  home_categories_eyebrow?: string;
  home_categories_title?: string;
  home_categories_subtitle?: string;
  home_featured_eyebrow?: string;
  home_featured_title?: string;
  home_featured_subtitle?: string;
  home_featured_cta?: string;
  home_featured_cta_url?: string;
  home_latest_eyebrow?: string;
  home_latest_title?: string;
  home_latest_subtitle?: string;
  home_latest_cta?: string;
  home_latest_cta_url?: string;
  home_bestsellers_eyebrow?: string;
  home_bestsellers_title?: string;
  home_bestsellers_subtitle?: string;
  home_bestsellers_cta?: string;
  home_bestsellers_cta_url?: string;
  home_testimonials_eyebrow?: string;
  home_testimonials_title?: string;
  home_instagram_eyebrow?: string;
  home_instagram_title?: string;
  home_hero_fallback_eyebrow?: string;
  home_hero_fallback_title?: string;
  home_hero_fallback_text?: string;
  home_hero_fallback_cta?: string;
  home_hero_fallback_cta_url?: string;
  home_about_eyebrow?: string;
  home_about_title?: string;
  home_about_cta?: string;
  home_about_cta_url?: string;
  home_sale_eyebrow?: string;
  home_sale_title?: string;
  home_sale_subtitle?: string;
  home_sale_cta?: string;
  home_sale_cta_url?: string;
  show_about_preview?: boolean;
  show_sale_banner?: boolean;
  auth_login_title?: string;
  auth_login_subtitle?: string;
  auth_register_title?: string;
  auth_register_subtitle?: string;
  search_placeholder?: string;
  add_to_cart_label?: string;
  show_categories?: boolean;
  show_featured?: boolean;
  show_latest?: boolean;
  show_bestsellers?: boolean;
  show_testimonials?: boolean;
  show_instagram?: boolean;
  privacy_policy?: string;
  shipping_policy?: string;
  return_policy?: string;
  exchange_policy?: string;
  terms_policy?: string;
  faq_content?: string;
  mega_menu_cta_label?: string;
  mega_menu_cta_url?: string;
  testimonials?: Testimonial[];
  instagram_posts?: InstagramPost[];
}

export interface ProductsQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string | number;
  tag?: string | number;
  featured?: boolean;
  on_sale?: boolean;
  orderby?:
    | "date"
    | "id"
    | "title"
    | "slug"
    | "price"
    | "popularity"
    | "rating"
    | "menu_order";
  order?: "asc" | "desc";
  min_price?: number;
  max_price?: number;
  stock_status?: "instock" | "outofstock" | "onbackorder";
  attribute?: string;
  attribute_term?: string;
  include?: number[];
  exclude?: number[];
  slug?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
}

export interface AuthTokens {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface CheckoutPayload {
  billing_address: WooAddress;
  shipping_address: WooAddress;
  customer_note?: string;
  create_account?: boolean;
  payment_method: string;
  payment_data?: { key: string; value: string }[];
  shipping_rate?: { package_id: number; rate_id: string };
}

export interface WooShippingPackage {
  package_id: number;
  name?: string;
  shipping_rates: WooShippingMethod[];
}

export interface ApiError {
  code: string;
  message: string;
  data?: { status: number };
}
