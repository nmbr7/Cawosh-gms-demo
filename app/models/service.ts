export interface Service {
  serviceId: string;
  isActive: boolean;
  customPrice?: number;
  name: string;
  description: string;
  defaultPrice?: number;
  duration?: number;
  currency?: string;
  currencySymbol?: string;
  category?: string;
}
