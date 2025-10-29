import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Technician } from '@/store/booking';

interface TechnicianDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  technicians: Technician[];
  disabled?: boolean;
}

export const TechnicianDropdown: React.FC<TechnicianDropdownProps> = ({
  value,
  onValueChange,
  technicians,
  disabled = false,
}) => {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Technician <span className="text-red-500">*</span>
      </label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Technician" />
        </SelectTrigger>
        <SelectContent>
          {technicians.map((tech) => (
            <SelectItem key={tech.id} value={tech.id}>
              {tech.firstName} {tech.lastName}
              {tech.role && ` (${tech.role})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
