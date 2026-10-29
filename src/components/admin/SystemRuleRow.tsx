"use client";

import { useState, useTransition } from "react";
import { deleteSystemRule, updateSystemRule } from "@/actions/admin-system-rules";
import { inputClasses } from "@/components/ui/FormField";

type Rule = {
  id: string;
  key: string | null;
  name: string;
  metric: string;
  threshold: number;
  type: string;
  isActive: boolean;
};

export function SystemRuleRow({ rule }: { rule: Rule }) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  
  // We only need local state for the edit form
  const [editName, setEditName] = useState(rule.name);
  const [editThreshold, setEditThreshold] = useState(rule.threshold.toString());
  const [editType, setEditType] = useState(rule.type);

  const isBuiltIn = !!rule.key;

  function handleDelete() {
    if (!confirm(`Delete rule "${rule.name}"?`)) return;
    startTransition(async () => {
      await deleteSystemRule(rule.id);
    });
  }

  function handleToggleActive() {
    startTransition(async () => {
      const result = await updateSystemRule(rule.id, { 
        name: rule.name, 
        metric: rule.metric, 
        threshold: rule.threshold, 
        type: rule.type, 
        isActive: !rule.isActive 
      });
      if (!result.success) alert(result.error);
    });
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateSystemRule(rule.id, { 
        name: editName, 
        metric: rule.metric, 
        threshold: editThreshold, 
        type: editType, 
        isActive: rule.isActive 
      });
      if (!result.success) {
        alert(result.error);
      } else {
        setIsEditing(false);
      }
    });
  }

  function handleReset() {
    const defaults: Record<string, { name: string, threshold: number, type: string }> = {
      default_low_stock: { name: "Low Stock Default", threshold: 5, type: "WARNING" },
      default_order_total: { name: "High Order Default", threshold: 1000, type: "SUCCESS" },
      default_pending_res: { name: "Pending Reservation Default", threshold: 2, type: "URGENT" },
    };
    const def = defaults[rule.key || ""];
    if (!def) return;
    
    startTransition(async () => {
      const result = await updateSystemRule(rule.id, { 
        ...def, 
        metric: rule.metric, 
        isActive: true 
      });
      if (!result.success) alert(result.error);
    });
  }

  const metricLabels: Record<string, string> = {
    STOCK_LEVEL: "Stock <=",
    ORDER_TOTAL: "Order >=",
    PENDING_RESERVATIONS: "Pending >=",
  };

  if (isEditing) {
    return (
      <div className="p-4 border-b border-border last:border-0 space-y-3 bg-gray-50">
        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClasses} placeholder="Rule Name" />
        <div className="flex gap-2">
          <input type="number" value={editThreshold} onChange={(e) => setEditThreshold(e.target.value)} className={inputClasses} />
          <select value={editType} onChange={(e) => setEditType(e.target.value)} className={inputClasses}>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="SUCCESS">Success</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={handleSave} disabled={isPending} className="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Save</button>
          <button onClick={() => setIsEditing(false)} disabled={isPending} className="border border-border px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 border-b border-border last:border-0 flex flex-col gap-3 transition-opacity ${isPending ? "opacity-50" : ""} ${!rule.isActive ? "bg-gray-50/50" : ""}`}>
      
      {/* Rule info section */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className={`font-bold text-sm ${!rule.isActive ? "text-gray-500" : ""}`}>{rule.name}</h3>
          
          {/* Active / Disabled Badge */}
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
            rule.isActive 
              ? "bg-green-50 text-green-700 border-green-200" 
              : "bg-gray-100 text-gray-500 border-gray-300"
          }`}>
            {rule.isActive ? "Active" : "Disabled"}
          </span>

          {isBuiltIn && (
            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Built-in
            </span>
          )}
        </div>
        <p className="text-xs text-muted">
          {metricLabels[rule.metric]} {rule.threshold} • {rule.type}
        </p>
      </div>

      {/* Action buttons toolbar cleanly wrapped */}
      <div className="flex flex-wrap items-center gap-2 pt-3 mt-1 border-t border-gray-100">
        {/* Quick Toggle Button */}
        <button
          onClick={handleToggleActive}
          disabled={isPending}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors whitespace-nowrap ${
            rule.isActive 
              ? "border-amber-500 text-amber-700 hover:bg-amber-50" 
              : "border-green-600 text-green-700 bg-green-50 hover:bg-green-100"
          }`}
        >
          {rule.isActive ? "Disable" : "Enable"}
        </button>

        <button
          onClick={() => {
            setEditName(rule.name);
            setEditThreshold(rule.threshold.toString());
            setEditType(rule.type);
            setIsEditing(true);
          }}
          className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-accent hover:text-accent transition-colors whitespace-nowrap"
        >
          Edit
        </button>
        
        {isBuiltIn ? (
          <button
            onClick={handleReset}
            disabled={isPending}
            className="text-xs px-3 py-1.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors whitespace-nowrap"
            title="Reset to default values"
          >
            Reset
          </button>
        ) : (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs px-3 py-1.5 rounded-full border border-red-500 text-red-700 hover:bg-red-500 hover:text-white transition-colors whitespace-nowrap"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}