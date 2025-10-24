export interface Customer {
  name: string;
  phone: string;
  email: string;
}

export interface Vehicle {
  make: string;
  model: string;
  year: number;
  license: string;
  vin: string;
}

export interface ServiceId {
  _id: string;
  name: string;
  description: string;
  category: string;
}

export interface TechnicianId {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

export interface ServicePause {
  startTime: string;
  endTime: string;
  reason: string;
  _id: string;
}

export interface Service {
  serviceId: ServiceId;
  name: string;
  description: string;
  duration: number;
  price: number;
  currency: string;
  currencySymbol: string;
  status:
    | "pending"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "awaiting_diagnosis";
  technicianId: TechnicianId;
  bayId: string;
  startTime: string;
  endTime: string;
  _id: string;
  pauses: ServicePause[];
}

export interface ChangedBy {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface GarageAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Bay {
  _id: string;
  name: string;
}

export interface Garage {
  _id: string;
  name: string;
  address: GarageAddress;
  bays: Bay[];
}

export interface HistoryEntry {
  status: string;
  changedBy: ChangedBy;
  changedAt: string;
  notes: string;
  _id: string;
}

export interface Booking {
  _id: string;
  customer: Customer;
  vehicle: Vehicle;
  services: Service[];
  bookingDate: string;
  totalDuration: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  notes: string;
  history: HistoryEntry[];
  createdAt: string;
  updatedAt: string;
  bookingId: string;
  garage_id: Garage;
  __v: number;
  requiresDiagnosis?: boolean;
  diagnosisNotes?: string;
}
