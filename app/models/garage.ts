export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Contact {
  phone: string;
  email: string;
  website: string;
}

export interface Billing {
  taxRegistrationAddress: Address;
  taxRate: number;
  taxRegistrationNumber: string;
  taxRegistrationName: string;
}

export interface BusinessHoursDay {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
  _id: string;
}

export type BusinessHours = BusinessHoursDay[];

export interface GarageService {
  serviceId: string;
  isActive: boolean;
  customPrice?: number;
  customDuration?: number;
  _id: string;
}

export interface GarageSettings {
  currency: string;
  timezone: string;
  taxRate: number;
  allowOnlineBooking: boolean;
}

export interface Garage {
  id: string;
  name: string;
  address: Address;
  phone: string;
  email: string;
  website: string;
  settings: GarageSettings;
  businessHours: BusinessHours;
  billing: Billing;
  services: GarageService[];
}
