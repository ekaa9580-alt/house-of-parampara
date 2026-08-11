"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { clientApi, parseApiError } from "@/lib/api/client";
import type {
  WooProduct,
  WooCategory,
  WooCart,
  WooReview,
  WooCustomer,
  WooOrder,
  HeroBanner,
  SiteSettings,
  Testimonial,
  ProductsQueryParams,
  PaginatedResponse,
  LoginCredentials,
  RegisterData,
  CheckoutPayload,
  WooPaymentMethod,
} from "@/types/woocommerce";
import toast from "react-hot-toast";

/* ─── Products ─── */

export function useProducts(params: ProductsQueryParams = {}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const { data } = await clientApi.get<PaginatedResponse<WooProduct>>(
        "/products",
        { params }
      );
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await clientApi.get<WooProduct>(`/products/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
}

export function useFeaturedProducts(perPage = 8) {
  return useQuery({
    queryKey: ["products", "featured", perPage],
    queryFn: async () => {
      const { data } = await clientApi.get<WooProduct[]>("/products/featured", {
        params: { per_page: perPage },
      });
      return data;
    },
  });
}

export function useLatestProducts(perPage = 8) {
  return useQuery({
    queryKey: ["products", "latest", perPage],
    queryFn: async () => {
      const { data } = await clientApi.get<WooProduct[]>("/products/latest", {
        params: { per_page: perPage },
      });
      return data;
    },
  });
}

export function useBestSellers(perPage = 8) {
  return useQuery({
    queryKey: ["products", "bestsellers", perPage],
    queryFn: async () => {
      const { data } = await clientApi.get<WooProduct[]>(
        "/products/bestsellers",
        { params: { per_page: perPage } }
      );
      return data;
    },
  });
}

export function useSaleProducts(perPage = 8) {
  return useQuery({
    queryKey: ["products", "sale", perPage],
    queryFn: async () => {
      const { data } = await clientApi.get<WooProduct[]>("/products/sale", {
        params: { per_page: perPage },
      });
      return data;
    },
  });
}

export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: ["products", "search", query],
    queryFn: async () => {
      const { data } = await clientApi.get<WooProduct[]>("/products/search", {
        params: { q: query },
      });
      return data;
    },
    enabled: query.trim().length >= 2,
  });
}

export function useRelatedProducts(slug: string) {
  return useQuery({
    queryKey: ["products", "related", slug],
    queryFn: async () => {
      const { data } = await clientApi.get<WooProduct[]>(
        `/products/${slug}/related`
      );
      return data;
    },
    enabled: !!slug,
  });
}

/* ─── Categories ─── */

export function useCategories(parent?: number) {
  return useQuery({
    queryKey: ["categories", parent],
    queryFn: async () => {
      const { data } = await clientApi.get<WooCategory[]>("/categories", {
        params: parent !== undefined ? { parent } : {},
      });
      return data;
    },
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data } = await clientApi.get<WooCategory>(`/categories/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
}

/* ─── Cart ─── */

export function useCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await clientApi.get<WooCart>("/cart");
      return data;
    },
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      productId: number;
      quantity?: number;
      variationId?: number;
      variation?: { attribute: string; value: string }[];
    }) => {
      const { data } = await clientApi.post<WooCart>("/cart/add", payload);
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["cart"], data);
      toast.success("Added to bag");
    },
    onError: (err) => {
      toast.error(parseApiError(err).message);
    },
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, quantity }: { key: string; quantity: number }) => {
      const { data } = await clientApi.post<WooCart>("/cart/update", {
        key,
        quantity,
      });
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["cart"], data);
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (key: string) => {
      const { data } = await clientApi.post<WooCart>("/cart/remove", { key });
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["cart"], data);
      toast.success("Removed from bag");
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });
}

export function useApplyCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const { data } = await clientApi.post<WooCart>("/cart/coupon", { code });
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["cart"], data);
      toast.success("Coupon applied");
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });
}

export function useRemoveCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const { data } = await clientApi.delete<WooCart>("/cart/coupon", {
        data: { code },
      });
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["cart"], data);
      toast.success("Coupon removed");
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });
}

/* ─── Auth ─── */

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await clientApi.post("/auth/login", credentials);
      return data;
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (payload: RegisterData) => {
      const { data } = await clientApi.post("/auth/register", payload);
      return data;
    },
    onSuccess: () => toast.success("Account created successfully"),
    onError: (err) => toast.error(parseApiError(err).message),
  });
}

export function useCustomer(id: number | null) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const { data } = await clientApi.get<WooCustomer>(`/auth/customer/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: Partial<WooCustomer> & { id: number }) => {
      const { data } = await clientApi.put<WooCustomer>(
        `/auth/customer/${id}`,
        payload
      );
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["customer", data.id], data);
      toast.success("Profile updated");
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });
}

export function useOrders(customerId: number | null, page = 1) {
  return useQuery({
    queryKey: ["orders", customerId, page],
    queryFn: async () => {
      const { data } = await clientApi.get<{
        orders: WooOrder[];
        total: number;
        totalPages: number;
      }>("/orders", { params: { customer_id: customerId, page } });
      return data;
    },
    enabled: !!customerId,
  });
}

/* ─── Content ─── */

export function useHeroBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data } = await clientApi.get<HeroBanner[]>("/banners");
      return data;
    },
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await clientApi.get<SiteSettings>("/settings");
      return data;
    },
  });
}

export function useMenu(location: string) {
  return useQuery({
    queryKey: ["menu", location],
    queryFn: async () => {
      const { data } = await clientApi.get<{
        location: string;
        items: import("@/types/woocommerce").CmsMenuItem[];
      }>(`/menus/${location}`);
      return data.items || [];
    },
    enabled: !!location,
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data } = await clientApi.get<Testimonial[]>("/testimonials");
      return data;
    },
  });
}

export function useReviews(productId: number) {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data } = await clientApi.get<{
        reviews: WooReview[];
        total: number;
      }>("/reviews", { params: { product_id: productId } });
      return data;
    },
    enabled: !!productId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      product_id: number;
      review: string;
      reviewer: string;
      reviewer_email: string;
      rating: number;
    }) => {
      const { data } = await clientApi.post("/reviews", payload);
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["reviews", vars.product_id] });
      toast.success("Review submitted");
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const { data } = await clientApi.get<WooPaymentMethod[]>(
        "/checkout/payment-methods"
      );
      return data;
    },
  });
}

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CheckoutPayload) => {
      const { data } = await clientApi.post("/checkout", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });
}

export function useNewsletter() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await clientApi.post<{
        success: boolean;
        message: string;
      }>("/newsletter", { email });
      return data;
    },
    onSuccess: (data) => toast.success(data.message),
    onError: (err) => toast.error(parseApiError(err).message),
  });
}

export function usePage(slug: string) {
  return useQuery({
    queryKey: ["page", slug],
    queryFn: async () => {
      const { data } = await clientApi.get(`/pages/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
}
