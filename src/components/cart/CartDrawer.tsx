"use client";

import { useCartStore } from "@/store/useCartStore";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function CartDrawer() {
  const t = useTranslations("Cart");
  const { items, isOpen, toggleCart, updateQuantity, removeItem, getTotal } = useCartStore();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={() => toggleCart(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 inset-e-0 h-full w-full max-w-md bg-card z-50 shadow-2xl flex flex-col animate-[slideIn_0.3s_ease-out]">
        
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> {t("title")}
          </h2>
          <button onClick={() => toggleCart(false)} className="p-2 hover:bg-background rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center text-muted mt-10">{t("empty")}</div>
          ) : (
            items.map((item) => (
              <div key={item.menuItemId} className="flex gap-4 bg-background p-3 rounded-xl border border-border">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                  {item.imageUrl && (
                    <Image 
                      src={item.imageUrl} 
                      alt={item.name} 
                      fill 
                      sizes="80px"
                      className="object-cover" 
                    />
                  )}
                </div>
                <div className="flex-1 flex flex-col">
                  <span className="font-bold text-sm line-clamp-1">{item.name}</span>
                  <span className="text-accent-dark font-medium text-sm mt-1">{item.price} AED</span>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-2 py-1">
                      <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="p-1 hover:text-accent">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="p-1 hover:text-accent">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.menuItemId)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-border bg-card">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">{t("subtotal")}</span>
              <span className="text-xl font-bold text-accent-dark">{getTotal()} AED</span>
            </div>
            <Link
              href="/checkout"
              onClick={() => toggleCart(false)}
              className="w-full flex items-center justify-center bg-accent hover:bg-accent-dark text-white font-medium py-3 rounded-full transition-colors"
            >
              {t("checkout")}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}