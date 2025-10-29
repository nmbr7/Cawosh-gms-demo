import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Bay } from '@/store/booking';

interface BayDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  bays: Bay[];
  disabled?: boolean;
}

export const BayDropdown: React.FC<BayDropdownProps> = ({
  value,
  onValueChange,
  bays,
  disabled = false,
}) => {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Bay <span className="text-red-500">*</span>
      </label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Bay" />
        </SelectTrigger>
        <SelectContent>
          {bays.map((bay) => (
            <SelectItem key={bay.id} value={bay.id}>
              {bay.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
