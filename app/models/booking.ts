export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled";

interface CustomerData {
  name: string;
  phone: string;
  email: string;
}

interface VehicleData {
  make: string;
  model: string;
  year: number;
  license: string;
  vin: string;
}

interface ServiceReference {
  _id: string;
  name: string;
  description: string;
  category: string;
}

export interface BookingService {
  serviceId: string | ServiceReference;
  name: string;
  description: string;
  duration: number;
  price: number;
  currency: string;
  currencySymbol: string;
  status: BookingStatus;
  startTime: string;
  endTime: string;
  _id?: string;
}

interface HistoryEntry {
  status: BookingStatus;
  changedBy:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
  changedAt: string;
  notes: string;
  _id?: string;
}

interface AssignedStaff {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

interface GarageInfo {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface BookingData {
  _id?: string;
  bookingId?: string;
  customer: CustomerData;
  vehicle: VehicleData;
  services: BookingService[];
  bookingDate: string;
  totalDuration: number;
  totalPrice: number;
  status: BookingStatus;
  assignedStaff: AssignedStaff;
  assignedBay: string;
  garage_id: string | GarageInfo;
  notes?: string;
  history: HistoryEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export class Booking {
  _id?: string;
  bookingId?: string;
  customer: CustomerData;
  vehicle: VehicleData;
  services: BookingService[];
  bookingDate: Date;
  totalDuration: number;
  totalPrice: number;
  status: BookingStatus;
  assignedStaff: AssignedStaff;
  assignedBay: string;
  garage_id: string | GarageInfo;
  notes?: string;
  history: HistoryEntry[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: BookingData) {
    this._id = data._id;
    this.bookingId = data.bookingId;
    this.customer = data.customer;
    this.vehicle = data.vehicle;
    this.services = data.services;
    this.bookingDate = new Date(data.bookingDate);
    this.totalDuration = data.totalDuration;
    this.totalPrice = data.totalPrice;
    this.status = data.status;
    this.assignedStaff = data.assignedStaff;
    this.assignedBay = data.assignedBay;
    this.garage_id =
      typeof data.garage_id === "string"
        ? {
            _id: data.garage_id,
            name: "",
            email: "",
            phone: "",
            address: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
          }
        : data.garage_id;
    this.notes = data.notes;
    this.history = data.history;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : undefined;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : undefined;
  }

  getStatusColor(): string {
    switch (this.status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  isActive(): boolean {
    return (
      this.status === "pending" ||
      this.status === "confirmed" ||
      this.status === "in-progress"
    );
  }

  isCompleted(): boolean {
    return this.status === "completed";
  }

  isCancelled(): boolean {
    return this.status === "cancelled";
  }

  getPrimaryService(): BookingService | undefined {
    return this.services[0];
  }

  getFormattedDate(): string {
    return this.bookingDate.toLocaleDateString();
  }

  getFormattedTime(): string {
    const primaryService = this.getPrimaryService();
    if (!primaryService) return "";

    const startTime = new Date(primaryService.startTime);
    const endTime = new Date(primaryService.endTime);

    return `${startTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${endTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  getLatestHistoryEntry(): HistoryEntry | undefined {
    return this.history.length > 0
      ? this.history[this.history.length - 1]
      : undefined;
  }

  // Check if this booking overlaps with another booking
  overlapsWith(other: Booking): boolean {
    if (this.assignedBay !== other.assignedBay) {
      return false;
    }

    const thisStart = this.bookingDate;
    const thisEnd = new Date(thisStart.getTime() + this.totalDuration * 60000);
    const otherStart = other.bookingDate;
    const otherEnd = new Date(
      otherStart.getTime() + other.totalDuration * 60000
    );

    return (
      (thisStart >= otherStart && thisStart < otherEnd) ||
      (thisEnd > otherStart && thisEnd <= otherEnd) ||
      (thisStart <= otherStart && thisEnd >= otherEnd)
    );
  }

  // Validate if the booking times are valid
  isValid(): boolean {
    const now = new Date();
    return (
      this.bookingDate >= now && this.totalDuration > 0 && this.totalPrice >= 0
    );
  }

  getTopPosition(): number {
    // Example: calculate top position based on start time (customize as needed)
    // Let's say your schedule starts at 8:00 AM
    const startHour = 8;
    const date =
      this.bookingDate instanceof Date
        ? this.bookingDate
        : new Date(this.bookingDate);
    const hour = date.getHours();
    const minute = date.getMinutes();
    return (hour - startHour) * 60 + minute; // 1px per minute, adjust as needed
  }

  getHeight(): number {
    // Example: return height based on totalDuration (in minutes)
    // 1 minute = 1px, so 60 minutes = 60px (adjust as needed)
    return this.totalDuration || 60;
  }
}
