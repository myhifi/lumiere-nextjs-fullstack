"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type HelpItem = {
  id: string;
  title: string;
  desc: string;
  examples: string[];
};

export function HelpAccordion({ items }: { items: HelpItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div 
            key={item.id} 
            className={`border rounded-2xl overflow-hidden transition-colors ${
              isOpen ? "border-accent bg-card shadow-sm" : "border-border bg-card"
            }`}
          >
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <div>
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="text-sm text-muted mt-1">{item.desc}</p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                isOpen ? "bg-accent/10 text-accent" : "bg-gray-100 text-gray-500"
              }`}>
                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </button>
            
            {isOpen && (
              <div className="px-6 pb-6 pt-2 border-t border-border/50">
                <ul className="space-y-3">
                  {item.examples.map((ex, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                      <span className="w-6 h-6 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0 text-xs">
                        {idx + 1}
                      </span>
                      <span className="mt-0.5">{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}