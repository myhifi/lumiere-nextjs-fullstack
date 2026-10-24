"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { updateOrderStatus } from "@/actions/admin-orders";
import { getLocalizedName } from "@/lib/utils/locale"; // <-- Import helper
import { Clock, CheckCircle2, ChevronRight, ChefHat, BellRing } from "lucide-react";

// Export this type so page.tsx can use it
export type KDSOrder = {
  id: string;
  guestName: string;
  status: string;
  createdAt: string;
  items: { quantity: number; name: string; nameEn: string | null }[]; // <-- Raw names
};

export function KitchenBoard({ initialOrders, locale }: { initialOrders: KDSOrder[], locale: string }) {
  const t = useTranslations("Admin.kitchen");
  const [orders, setOrders] = useState(initialOrders);
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const playDing = useCallback(() => {
    if (!soundEnabled) return;
    try {
      // Fix the 'any' type safely
      const AudioContextClass = 
        window.AudioContext || 
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
      
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 1);
    } catch (e) {
      console.error("Audio failed", e);
    }
  }, [soundEnabled]);

  const refreshOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders/active");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const eventSource = new EventSource("/api/admin/orders/stream");

    eventSource.onopen = () => setIsConnected(true);
    eventSource.onerror = () => setIsConnected(false);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new-order") {
        playDing();
        refreshOrders();
      }
    };

    return () => eventSource.close();
  }, [playDing, refreshOrders]);

  const handleUpdate = async (id: string, newStatus: string) => {
    setOrders((prev) => 
      newStatus === "READY" 
        ? prev.filter((o) => o.id !== id)
        : prev.map((o) => o.id === id ? { ...o, status: newStatus } : o)
    );

    await updateOrderStatus(id, newStatus as "PREPARING" | "READY");
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <ChefHat className="w-8 h-8 text-accent" />
          <h1 className="text-2xl font-bold">{t("title")}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              soundEnabled ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            <BellRing className="w-5 h-5" />
            {soundEnabled ? t("soundOn") : t("soundOff")}
          </button>
          
          <div className={`flex items-center gap-2 text-sm ${isConnected ? "text-green-400" : "text-red-400"}`}>
            <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
            {isConnected ? t("live") : t("disconnected")}
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-32 text-gray-500">
          <CheckCircle2 className="w-20 h-20 mx-auto mb-4 opacity-50" />
          <p className="text-xl">{t("noOrders")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className={`flex flex-col rounded-2xl border-2 overflow-hidden shadow-xl ${
                order.status === "PAID" ? "border-blue-500 bg-gray-800" : "border-yellow-500 bg-gray-800"
              }`}
            >
              <div className={`p-4 flex justify-between items-center ${order.status === "PAID" ? "bg-blue-900/40" : "bg-yellow-900/40"}`}>
                <span className="font-mono font-bold text-lg">#{order.id.slice(0, 4).toUpperCase()}</span>
                <span className="flex items-center gap-1 text-sm opacity-80">
                  <Clock className="w-4 h-4" /> {formatTime(order.createdAt)}
                </span>
              </div>

              <div className="p-4 flex-1">
                <p className="text-gray-400 text-sm mb-3">{order.guestName}</p>
                <ul className="space-y-3">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-start text-lg">
                      <span className="font-bold text-accent">{item.quantity}x</span>
                      {/* USE HELPER HERE */}
                      <span className="flex-1 ml-3">{getLocalizedName(item.name, item.nameEn, locale)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 border-t border-gray-700 flex flex-col gap-2">
                <a 
                  href={`/api/orders/${order.id}/ticket?locale=${locale}`} 
                  target="_blank" 
                  className="text-center text-xs text-gray-400 hover:text-white underline mb-1"
                >
                  Print Ticket
                </a>
                {order.status === "PAID" ? (
                  <button 
                    onClick={() => handleUpdate(order.id, "PREPARING")}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    {t("startCooking")} <ChevronRight className="w-6 h-6" />
                  </button>
                ) : (
                  <button 
                    onClick={() => handleUpdate(order.id, "READY")}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    {t("markReady")} <CheckCircle2 className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}