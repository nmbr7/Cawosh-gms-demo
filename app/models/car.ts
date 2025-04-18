export type VehicleType = 'sedan' | 'suv' | 'truck' | 'van' | 'hatchback' | 'coupe' | 'convertible' | 'electric' | 'hybrid';

export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'cng' | 'lpg';

export type TaxStatus = 'taxed' | 'untaxed' | 'sorn';

export type MOTStatus = 'valid' | 'expired' | 'no-details-available';

export interface CarData {
  id: string;
  make: string;
  model: string;
  year: number;
  registrationNumber?: string;
  vehicleType?: VehicleType;
  fuelType?: FuelType;
  color?: string;
  
  taxStatus: TaxStatus;
  taxDueDate?: string;
  motStatus: MOTStatus;
  motExpiryDate?: string;
  firstRegistrationDate: string;
  yearOfManufacture: number;
  co2Emissions?: number;
  engineCapacity: number;
  euroStatus?: string;
  realDrivingEmissions?: string;
  revenueWeight?: number;
  wheelplan?: string;
  dateOfLastV5CIssued?: string;
  
  engineSize?: string;
  transmission?: 'automatic' | 'manual';
  mileage?: number;
  lastServiceDate?: string;
  nextServiceDate?: string;
  serviceHistory?: {
    date: string;
    serviceType: string;
    description: string;
    cost: number;
  }[];
  
  ownerId?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  registeredKeeper?: {
    name: string;
    address: string;
    postcode: string;
  };
  
  insuranceStatus?: 'insured' | 'uninsured';
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiryDate?: string;
  
  createdAt: string;
  updatedAt: string;
}

export class Car {
  constructor(private data: CarData) {}

  get id() { return this.data.id; }
  get make() { return this.data.make; }
  get model() { return this.data.model; }
  get year() { return this.data.year; }
  get registrationNumber() { return this.data.registrationNumber; }
  get vehicleType() { return this.data.vehicleType; }
  get fuelType() { return this.data.fuelType; }
  get color() { return this.data.color; }
  get engineSize() { return this.data.engineSize; }
  get transmission() { return this.data.transmission; }
  get mileage() { return this.data.mileage; }
  get lastServiceDate() { return this.data.lastServiceDate; }
  get nextServiceDate() { return this.data.nextServiceDate; }
  get serviceHistory() { return this.data.serviceHistory; }
  get ownerId() { return this.data.ownerId; }
  get ownerName() { return this.data.ownerName; }
  get ownerPhone() { return this.data.ownerPhone; }
  get ownerEmail() { return this.data.ownerEmail; }
  get createdAt() { return this.data.createdAt; }
  get updatedAt() { return this.data.updatedAt; }

  getFullName(): string {
    return `${this.data.year} ${this.data.make} ${this.data.model}`;
  }

  getVehicleTypeColor(): string {
    if (!this.data.vehicleType) return 'bg-gray-100 text-gray-800';
    
    switch (this.data.vehicleType) {
      case 'sedan':
        return 'bg-blue-100 text-blue-800';
      case 'suv':
        return 'bg-green-100 text-green-800';
      case 'truck':
        return 'bg-amber-100 text-amber-800';
      case 'van':
        return 'bg-purple-100 text-purple-800';
      case 'hatchback':
        return 'bg-red-100 text-red-800';
      case 'coupe':
        return 'bg-pink-100 text-pink-800';
      case 'convertible':
        return 'bg-yellow-100 text-yellow-800';
      case 'electric':
        return 'bg-teal-100 text-teal-800';
      case 'hybrid':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getFuelTypeColor(): string {
    if (!this.data.fuelType) return 'bg-gray-100 text-gray-800';
    
    switch (this.data.fuelType) {
      case 'petrol':
        return 'bg-red-100 text-red-800';
      case 'diesel':
        return 'bg-gray-100 text-gray-800';
      case 'electric':
        return 'bg-blue-100 text-blue-800';
      case 'hybrid':
        return 'bg-green-100 text-green-800';
      case 'cng':
        return 'bg-purple-100 text-purple-800';
      case 'lpg':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  needsService(): boolean {
    if (!this.data.nextServiceDate) return false;
    const nextService = new Date(this.data.nextServiceDate);
    const today = new Date();
    return nextService <= today;
  }

  getServiceDueInDays(): number | null {
    if (!this.data.nextServiceDate) return null;
    const nextService = new Date(this.data.nextServiceDate);
    const today = new Date();
    const diffTime = nextService.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get taxStatus() { return this.data.taxStatus; }
  get taxDueDate() { return this.data.taxDueDate; }
  get motStatus() { return this.data.motStatus; }
  get motExpiryDate() { return this.data.motExpiryDate; }
  get firstRegistrationDate() { return this.data.firstRegistrationDate; }
  get yearOfManufacture() { return this.data.yearOfManufacture; }
  get co2Emissions() { return this.data.co2Emissions; }
  get engineCapacity() { return this.data.engineCapacity; }
  get euroStatus() { return this.data.euroStatus; }
  get realDrivingEmissions() { return this.data.realDrivingEmissions; }
  get revenueWeight() { return this.data.revenueWeight; }
  get wheelplan() { return this.data.wheelplan; }
  get dateOfLastV5CIssued() { return this.data.dateOfLastV5CIssued; }

  get insuranceStatus() { return this.data.insuranceStatus; }
  get insuranceProvider() { return this.data.insuranceProvider; }
  get insurancePolicyNumber() { return this.data.insurancePolicyNumber; }
  get insuranceExpiryDate() { return this.data.insuranceExpiryDate; }

  getTaxStatusColor(): string {
    switch (this.data.taxStatus) {
      case 'taxed':
        return 'bg-green-100 text-green-800';
      case 'untaxed':
        return 'bg-red-100 text-red-800';
      case 'sorn':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getMOTStatusColor(): string {
    switch (this.data.motStatus) {
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'no-details-available':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getInsuranceStatusColor(): string {
    switch (this.data.insuranceStatus) {
      case 'insured':
        return 'bg-green-100 text-green-800';
      case 'uninsured':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  isTaxed(): boolean {
    return this.data.taxStatus === 'taxed';
  }

  hasValidMOT(): boolean {
    return this.data.motStatus === 'valid';
  }

  isInsured(): boolean {
    return this.data.insuranceStatus === 'insured';
  }

  getDaysUntilMOTExpiry(): number | null {
    if (!this.data.motExpiryDate) return null;
    const expiryDate = new Date(this.data.motExpiryDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDaysUntilTaxExpiry(): number | null {
    if (!this.data.taxDueDate) return null;
    const dueDate = new Date(this.data.taxDueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDaysUntilInsuranceExpiry(): number | null {
    if (!this.data.insuranceExpiryDate) return null;
    const expiryDate = new Date(this.data.insuranceExpiryDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
} 