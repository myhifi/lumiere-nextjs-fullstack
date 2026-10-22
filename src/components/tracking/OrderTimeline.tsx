import { CheckCircle2, ChefHat, Truck, PackageCheck, XCircle, Clock } from "lucide-react";

export type TimelineLabels = {
  statusPending: string;
  statusCancelled: string;
  timelinePaid: string;
  timelinePreparing: string;
  timelineOutForDelivery: string;
  timelineDelivered: string;
};

export type OrderTimelineProps = {
  status: string;
  labels: TimelineLabels;
};

export function OrderTimeline({ status, labels }: OrderTimelineProps) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
        <XCircle className="w-6 h-6 shrink-0" />
        <span className="font-medium">{labels.statusCancelled}</span>
      </div>
    );
  }

  if (status === "PENDING") {
    return (
      <div className="flex items-center gap-3 p-4 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
        <Clock className="w-6 h-6 shrink-0" />
        <span className="font-medium">{labels.statusPending}</span>
      </div>
    );
  }

  const steps = [
    { key: "PAID", label: labels.timelinePaid, icon: CheckCircle2 },
    { key: "PREPARING", label: labels.timelinePreparing, icon: ChefHat },
    { key: "OUT_FOR_DELIVERY", label: labels.timelineOutForDelivery, icon: Truck },
    { key: "DELIVERED", label: labels.timelineDelivered, icon: PackageCheck },
  ];

  let currentIndex = steps.findIndex((step) => step.key === status);
  if (status === "PAID") currentIndex = 0;
  else if (status === "PREPARING") currentIndex = 1;
  else if (status === "READY") currentIndex = 2; // <--- Maps to OUT_FOR_DELIVERY visually
  else if (status === "DELIVERED") currentIndex = 3;
  else currentIndex = 0; 

  return (
    <div className="w-full py-8">
      {/* Desktop Horizontal View */}
      <div className="hidden md:flex justify-between items-center relative">
        <div className="absolute left-0 right-0 top-5 h-1 bg-gray-200 z-0" />
        <div 
          className="absolute left-0 top-5 h-1 bg-accent z-0 transition-all duration-500 ease-in-out"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isActive = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-3 w-1/4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300 ${
                isCompleted ? "bg-accent border-accent text-white" : "bg-white border-gray-300 text-gray-400"
              } ${isActive ? "ring-4 ring-accent/20" : ""}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-sm font-medium text-center ${isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical View */}
      <div className="md:hidden flex flex-col gap-6 relative">
        <div className="absolute left-5 top-5 bottom-5 w-1 bg-gray-200 z-0" />
        <div 
          className="absolute left-5 top-5 w-1 bg-accent z-0 transition-all duration-500 ease-in-out"
          style={{ height: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isActive = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex items-center gap-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0 transition-colors duration-300 ${
                isCompleted ? "bg-accent border-accent text-white" : "bg-white border-gray-300 text-gray-400"
              } ${isActive ? "ring-4 ring-accent/20" : ""}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-sm font-medium ${isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}