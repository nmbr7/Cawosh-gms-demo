export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Contact {
  phone: string;
  email: string;
  website: string;
}

export interface Billing {
  taxRate: number;
  taxRegistrationNumber: string;
  taxRegistrationName: string;
  taxRegistrationAddress: Address;
}

export interface BusinessHoursDay {
  open: string;
  close: string;
}

export interface BusinessHours {
  monday: BusinessHoursDay;
  tuesday: BusinessHoursDay;
  wednesday: BusinessHoursDay;
  thursday: BusinessHoursDay;
  friday: BusinessHoursDay;
  saturday: BusinessHoursDay;
  sunday: BusinessHoursDay;
}

export interface GarageService {
  serviceId: string;
  isActive: boolean;
  customPrice?: number;
  customDuration?: number;
}

export interface Garage {
  id: string;
  name: string;
  address: Address;
  contact: Contact;
  billing: Billing;
  businessHours: BusinessHours;
  services: GarageService[];
}
