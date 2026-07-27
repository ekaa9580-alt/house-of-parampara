"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WooProduct } from "@/types/woocommerce";

interface WishlistState {
  items: number[];
  add: (productId: number) => void;
  remove: (productId: number) => void;
  toggle: (productId: number) => void;
  has: (productId: number) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (productId) =>
        set((s) =>
          s.items.includes(productId)
            ? s
            : { items: [...s.items, productId] }
        ),
      remove: (productId) =>
        set((s) => ({ items: s.items.filter((id) => id !== productId) })),
      toggle: (productId) => {
        const { has, add, remove } = get();
        if (has(productId)) remove(productId);
        else add(productId);
      },
      has: (productId) => get().items.includes(productId),
      clear: () => set({ items: [] }),
    }),
    { name: "hop-wishlist" }
  )
);

interface RecentlyViewedState {
  items: WooProduct[];
  add: (product: WooProduct) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product) => {
        const filtered = get().items.filter((p) => p.id !== product.id);
        set({ items: [product, ...filtered].slice(0, 8) });
      },
      clear: () => set({ items: [] }),
    }),
    { name: "hop-recently-viewed" }
  )
);

interface UIState {
  isSearchOpen: boolean;
  isCartDrawerOpen: boolean;
  isMobileMenuOpen: boolean;
  quickViewProductId: number | null;
  setSearchOpen: (v: boolean) => void;
  setCartDrawerOpen: (v: boolean) => void;
  setMobileMenuOpen: (v: boolean) => void;
  setQuickView: (id: number | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSearchOpen: false,
  isCartDrawerOpen: false,
  isMobileMenuOpen: false,
  quickViewProductId: null,
  setSearchOpen: (v) => set({ isSearchOpen: v }),
  setCartDrawerOpen: (v) => set({ isCartDrawerOpen: v }),
  setMobileMenuOpen: (v) => set({ isMobileMenuOpen: v }),
  setQuickView: (id) => set({ quickViewProductId: id }),
}));

interface AuthState {
  token: string | null;
  customerId: number | null;
  email: string | null;
  displayName: string | null;
  setAuth: (data: {
    token: string;
    customerId: number;
    email: string;
    displayName: string;
  }) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      customerId: null,
      email: null,
      displayName: null,
      setAuth: (data) => set(data),
      logout: () =>
        set({
          token: null,
          customerId: null,
          email: null,
          displayName: null,
        }),
      isAuthenticated: () => !!get().token,
    }),
    { name: "hop-auth" }
  )
);
