"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import type { MenuItem } from "@prisma/client";

export function ProductDetailsActions({ item }: { item: MenuItem }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem, toggleCart } = useCartStore();

  function handleAdd() {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      quantity: quantity,
    });
    toggleCart(true); // Auto-open drawer
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4 bg-background border border-border rounded-full px-4 py-2">
        <button 
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="text-xl hover:text-accent font-bold"
        >
          -
        </button>
        <span className="text-lg font-bold w-6 text-center">{quantity}</span>
        <button 
          onClick={() => setQuantity(quantity + 1)}
          className="text-xl hover:text-accent font-bold"
        >
          +
        </button>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAdd}
        disabled={!item.isAvailable || item.stock <= 0}
        className="flex-1 bg-accent hover:bg-accent-dark text-white font-medium py-3 px-8 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add to Cart - {(item.price * quantity).toFixed(2)} AED
      </button>
    </div>
  );
}