export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

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

export interface BookingServiceRef {
  _id: string;
  name: string;
  description: string;
  category: string;
}

interface TechnicianData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

export interface BookingService {
  _id: string;
  serviceId: BookingServiceRef;
  name: string;
  description: string;
  duration: number;
  price: number;
  currency: string;
  currencySymbol: string;
  status: string;
  technicianId: TechnicianData;
  bayId: string;
  startTime: string;
  endTime: string;
  pauses: unknown[];
}

interface HistoryEntry {
  status: BookingStatus;
  changedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  changedAt: string;
  notes: string;
  _id?: string;
}

export interface GarageInfo {
  _id: string;
  name: string;
  subdomain?: string;
  email: string;
  phone: string;
  website?: string;
  tenantId?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  businessHours?: Array<{
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
    _id: string;
  }>;
  settings?: {
    timezone: string;
    currency: string;
    taxRate: number;
    allowOnlineBooking: boolean;
  };
  billing?: {
    taxRate: number;
    taxRegistrationNumber: string;
    taxRegistrationName: string;
    taxRegistrationAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  services?: Array<{
    serviceId: string;
    isActive: boolean;
    customPrice?: number;
    customDuration?: number;
  }>;
  bays?: Array<{
    _id: string;
    name: string;
    supportedServices: string[];
  }>;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
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
  garage_id: string;
  notes?: string;
  history: HistoryEntry[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  assignedStaff?: unknown;
  jobSheet?: unknown;
}

export interface BookingHistoryEntry {
  _id: string;
  status: string;
  changedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  changedAt: string;
  notes: string;
}

export interface BookingGarage {
  _id: string;
  name: string;
  subdomain?: string;
  email: string;
  phone: string;
  website?: string;
  tenantId?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  businessHours?: Array<{
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
    _id: string;
  }>;
  settings?: {
    timezone: string;
    currency: string;
    taxRate: number;
    allowOnlineBooking: boolean;
  };
  billing?: {
    taxRate: number;
    taxRegistrationNumber: string;
    taxRegistrationName: string;
    taxRegistrationAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  services?: Array<{
    serviceId: string;
    isActive: boolean;
    customPrice?: number;
    customDuration?: number;
  }>;
  bays?: Array<{
    _id: string;
    name: string;
    supportedServices: string[];
  }>;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface Booking {
  _id: string;
  bookingId?: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  vehicle: {
    make: string;
    model: string;
    year: number;
    license: string;
    vin: string;
  };
  services: BookingService[];
  bookingDate: string;
  totalDuration: number;
  totalPrice: number;
  status: string;
  garage_id: BookingGarage;
  notes?: string;
  history: BookingHistoryEntry[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
  assignedStaff?: unknown;
  jobSheet?: unknown;
}

export class BookingUtil {
  static getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  static getPrimaryService(booking: Booking): BookingService | undefined {
    return booking.services[0];
  }

  static getFormattedDate(booking: Booking): string {
    return new Date(booking.bookingDate).toLocaleDateString();
  }

  static getFormattedTime(booking: Booking): string {
    const primaryService = BookingUtil.getPrimaryService(booking);
    if (!primaryService) return '';
    const startTime = new Date(primaryService.startTime);
    const endTime = new Date(primaryService.endTime);
    return `${startTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })} - ${endTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  static getLatestHistoryEntry(
    booking: Booking,
  ): BookingHistoryEntry | undefined {
    return booking.history.length > 0
      ? booking.history[booking.history.length - 1]
      : undefined;
  }

  static overlapsWith(a: Booking, b: Booking): boolean {
    if (!a.services.length || !b.services.length) return false;
    // Compare by bay and time range of the first service
    const aService = a.services[0];
    const bService = b.services[0];
    if (aService.bayId !== bService.bayId) return false;
    const aStart = new Date(aService.startTime).getTime();
    const aEnd = new Date(aService.endTime).getTime();
    const bStart = new Date(bService.startTime).getTime();
    const bEnd = new Date(bService.endTime).getTime();
    return (
      (aStart >= bStart && aStart < bEnd) ||
      (aEnd > bStart && aEnd <= bEnd) ||
      (aStart <= bStart && aEnd >= bEnd)
    );
  }

  static isValid(booking: Booking): boolean {
    const now = new Date();
    return (
      new Date(booking.bookingDate) >= now &&
      booking.totalDuration > 0 &&
      booking.totalPrice >= 0
    );
  }
}
