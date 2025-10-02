"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useInventory } from "@/store/inventory";

function AlertBanner({
  tone,
  count,
  onClick,
  onDismiss,
}: {
  tone: "LOW" | "OUT";
  count: number;
  onClick: () => void;
  onDismiss: () => void;
}) {
  if (count === 0) return null;

  const isLow = tone === "LOW";
  const bg = isLow ? "bg-yellow-50" : "bg-red-50";
  const border = isLow ? "border-yellow-200" : "border-red-200";
  const text = isLow ? "text-yellow-900" : "text-red-900";
  const dot = isLow ? "bg-yellow-400" : "bg-red-400";

  const label =
    tone === "LOW"
      ? `${count} item${count > 1 ? "s" : ""} low in stock`
      : `${count} item${count > 1 ? "s" : ""} out of stock`;

  return (
    <div
      className={`w-full ${bg} ${border} ${text} border rounded-lg px-4 py-3 flex items-center justify-between`}
    >
      <div className="flex items-center gap-3">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" className={text} onClick={onClick}>
          View details
        </Button>
        <Button variant="ghost" className={text} onClick={onDismiss}>
          Ignore
        </Button>
      </div>
    </div>
  );
}

export function InventoryAlerts() {
  const { alerts, setFilters } = useInventory();
  const [dismissed, setDismissed] = useState<{ LOW: boolean; OUT: boolean }>({
    LOW: false,
    OUT: false,
  });

  const hasVisible =
    (alerts.lowCount > 0 && !dismissed.LOW) ||
    (alerts.outCount > 0 && !dismissed.OUT);

  if (!hasVisible) return null;

  return (
    <div className="mb-6 space-y-3">
      {alerts.lowCount > 0 && !dismissed.LOW && (
        <AlertBanner
          tone="LOW"
          count={alerts.lowCount}
          onClick={() => setFilters({ status: "LOW" })}
          onDismiss={() => setDismissed((s) => ({ ...s, LOW: true }))}
        />
      )}
      {alerts.outCount > 0 && !dismissed.OUT && (
        <AlertBanner
          tone="OUT"
          count={alerts.outCount}
          onClick={() => setFilters({ status: "OUT" })}
          onDismiss={() => setDismissed((s) => ({ ...s, OUT: true }))}
        />
      )}
    </div>
  );
}
