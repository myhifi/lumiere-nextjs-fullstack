import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/order";

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (open?: boolean) => void;
  getTotal: () => number;
  getItemCount: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.menuItemId === item.menuItemId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.menuItemId === item.menuItemId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (menuItemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.menuItemId !== menuItemId),
        })),

      updateQuantity: (menuItemId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0), // Remove if quantity becomes 0
        })),

      clearCart: () => set({ items: [] }),
      
      toggleCart: (open) =>
        set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen })),

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "lumiere-cart-storage", // Key in localStorage
      partialize: (state) => ({ items: state.items }), // Don't persist isOpen state
    }
  )
);