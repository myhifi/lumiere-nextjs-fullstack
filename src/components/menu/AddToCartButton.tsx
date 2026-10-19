"use client";

import { useState } from "react";
import { ShoppingBag, Check, Plus } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import type { MenuItem } from "@prisma/client";

type Props = {
  item: Pick<MenuItem, "id" | "name" | "price" | "imageUrl" | "isAvailable" | "stock">;
  className?: string;
  showText?: boolean;
};

export function AddToCartButton({ item, className = "", showText = true }: Props) {
  const { addItem, toggleCart } = useCartStore();
  const [isAdded, setIsAdded] = useState(false);

  function handleAdd() {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      quantity: 1,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
    
    // Auto-open the cart drawer when an item is added
    toggleCart(true); 
  }

  return (
    <button
      onClick={handleAdd}
      disabled={!item.isAvailable || item.stock <= 0}
      className={`flex items-center justify-center gap-2 rounded-full font-medium transition-all ${
        isAdded
          ? "bg-green-500 text-white"
          : "bg-accent hover:bg-accent-dark text-white disabled:opacity-50 disabled:cursor-not-allowed"
      } ${className}`}
    >
      {isAdded ? (
        <>
          <Check className="w-5 h-5" />
          {showText && <span>Added</span>}
        </>
      ) : (
        <>
          {/* 👇 UX FIX: Use Plus if it's an icon-only button, otherwise use Bag */}
          {showText ? <ShoppingBag className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showText && <span>Add to Cart</span>}
        </>
      )}
    </button>
  );
}