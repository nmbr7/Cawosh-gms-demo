export type Powertrain = 'ice' | 'ev' | 'hybrid';

export type VHCOptionValue = number | string | boolean;

export type VHCItemType =
  | 'radio'
  | 'checkbox'
  | 'range'
  | 'tread-depth'
  | 'note';

export interface VHCScoreMap {
  [optionValue: string]: number;
}

export interface VHCThresholds {
  red?: string; // e.g. "<2.0"
  amber?: string; // e.g. "2.0-3.0"
  green?: string; // e.g. ">=3.0"
}

export interface VHCItemTemplate {
  id: string;
  label: string;
  description?: string;
  type: VHCItemType;
  options?: VHCOptionValue[];
  weight: number;
  scoreMap?: VHCScoreMap;
  thresholds?: VHCThresholds;
  photoRequired?: boolean;
  applicable_to?: Powertrain[];
  order?: number;
}

export interface VHCSectionTemplate {
  id: string;
  title: string;
  weight: number;
  applicable_to?: Powertrain[];
  items: VHCItemTemplate[];
  order?: number;
}

export interface VHCTemplate {
  id: string;
  version: number;
  title: string;
  isActive: boolean;
  sections: VHCSectionTemplate[];
}

export type VHCStatus =
  | 'draft'
  | 'in_progress'
  | 'submitted'
  | 'approved'
  | 'void';

export interface VHCAnswer {
  itemId: string;
  value?: VHCOptionValue;
  notes?: string;
  photos?: string[];
}

export interface VHCResponse {
  id: string;
  templateId: string;
  templateVersion: number;
  powertrain: Powertrain;
  status: VHCStatus;
  vehicleId: string;
  bookingId?: string;
  serviceIds?: string[];
  assignedTo?: string;
  assignedBy?: string;
  dueAt?: string;
  answers: VHCAnswer[];
  scores?: {
    section: Record<string, number>;
    total: number;
  };
  progress?: { answered: number; total: number };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
}
