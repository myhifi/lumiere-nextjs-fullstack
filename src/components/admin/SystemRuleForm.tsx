"use client";

import { useState, useTransition } from "react";
import { createSystemRule } from "@/actions/admin-system-rules";
import { inputClasses } from "@/components/ui/FormField";

export function SystemRuleForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [metric, setMetric] = useState("STOCK_LEVEL");
  const [threshold, setThreshold] = useState("5");
  const [type, setType] = useState("WARNING");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createSystemRule({ name, metric, threshold, type });
      if (!result.success) {
        setError(result.error || "An error occurred");
      } else {
        setName("");
        setThreshold("5");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 mt-6">
      <h2 className="text-lg font-bold mb-4">⚙️ Create Custom Auto-Alert Rule</h2>
      
      <div>
        <label className="block text-sm font-medium mb-1">Rule Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Low Stock Warning" required className={inputClasses} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Metric</label>
        <select value={metric} onChange={(e) => setMetric(e.target.value)} className={inputClasses}>
          <option value="STOCK_LEVEL">Product Stock Level</option>
          <option value="ORDER_TOTAL">Order Total Amount (AED)</option>
          <option value="PENDING_RESERVATIONS">Pending Reservation Time (Hours)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Threshold Value</label>
        <input type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} required className={inputClasses} />
        <p className="text-xs text-muted mt-1">
          {metric === "STOCK_LEVEL" && "Alert when stock is LESS THAN or equal to this."}
          {metric === "ORDER_TOTAL" && "Alert when order is GREATER THAN or equal to this."}
          {metric === "PENDING_RESERVATIONS" && "Alert when a reservation is pending for MORE than these hours."}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Alert Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className={inputClasses}>
          <option value="INFO">Info</option>
          <option value="WARNING">Warning</option>
          <option value="SUCCESS">Success</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={isPending} className="w-full bg-accent hover:bg-accent-dark text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50">
        {isPending ? "Saving..." : "Add Rule"}
      </button>
    </form>
  );
}