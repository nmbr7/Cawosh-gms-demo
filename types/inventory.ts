// types/inventory.ts
export type StockStatus = "IN_STOCK" | "LOW" | "OUT";
export type MovementType = "INCREASE" | "DECREASE" | "SET";

export interface StockMovement {
  id: string;
  itemId: string;
  type: MovementType;
  quantity: number; // positive integer
  reason: string; // enum later
  reference?: string; // e.g., JOB-123, INV-55
  performedBy: string; // user id/email
  createdAt: string; // ISO
  resultingQuantity: number;

  // Traceability (NEW)
  referenceType?: "JOB_SHEET" | "BOOKING" | "MANUAL" | "SYSTEM";
  jobSheetId?: string;
  bookingId?: string;
  serviceId?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: "pc" | "pair" | "bottle" | "litre" | "kg" | "box";
  quantity: number;
  reorderLevel: number; // threshold
  cost: number; // per unit
  price: number; // per unit
  supplier?: string;
  location?: string; // aisle/bin
  status?: StockStatus; // derived on read
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
}
