import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { EmploymentType } from "@/app/models/user";

interface EmploymentDetailsProps {
  position: string;
  department: string;
  employmentType: EmploymentType;
  joiningDate: string;
  onPositionChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onEmploymentTypeChange: (value: EmploymentType) => void;
  onJoiningDateChange: (value: string) => void;
  disabled?: boolean;
}

const POSITIONS = [
  "Service Technician",
  "Manager",
  "Admin",
  "Operations Manager",
  "Service Manager",
];

const DEPARTMENTS = [
  "Service",
  "Operations",
  "IT",
  "Maintenance",
  "Management",
];

export function EmploymentDetails({
  position,
  department,
  employmentType,
  joiningDate,
  onPositionChange,
  onDepartmentChange,
  onEmploymentTypeChange,
  onJoiningDateChange,
  disabled = false,
}: EmploymentDetailsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Position
        </label>
        <Select
          value={position}
          onValueChange={onPositionChange}
          disabled={disabled}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {POSITIONS.map((pos) => (
              <SelectItem key={pos} value={pos}>
                {pos}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Department
        </label>
        <Select
          value={department}
          onValueChange={onDepartmentChange}
          disabled={disabled}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {DEPARTMENTS.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Employment Type
        </label>
        <Select
          value={employmentType}
          onValueChange={(value) =>
            onEmploymentTypeChange(value as EmploymentType)
          }
          disabled={disabled}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Select employment type" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="full-time">Full Time</SelectItem>
            <SelectItem value="part-time">Part Time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Joining Date
        </label>
        <Input
          type="date"
          value={joiningDate}
          onChange={(e) => onJoiningDateChange(e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
