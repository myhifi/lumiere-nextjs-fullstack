// ═══════════════════════════════════════════════════
// 🛒 Order Types & Enums
// ═══════════════════════════════════════════════════

export type OrderStatus = 
  | "PENDING" 
  | "PAID" 
  | "PREPARING" 
  | "DELIVERED" 
  | "CANCELLED";

export type CartItem = {
  menuItemId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
};

export type CheckoutPayload = {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  deliveryAddress: string;
  items: {
    menuItemId: string;
    quantity: number;
  }[];
};