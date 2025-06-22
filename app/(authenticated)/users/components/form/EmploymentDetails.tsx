import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { EmploymentType } from "@/app/models/user";
import { useFormOptions } from "@/app/contexts/FormOptionsContext";
import { memo, useMemo } from "react";

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

export const EmploymentDetails = memo(function EmploymentDetails({
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
  const { formOptions, isLoading: isLoadingOptions } = useFormOptions();

  // Memoize the computed arrays to prevent unnecessary re-renders
  const displayPositions = useMemo(() => {
    const positions = [...formOptions.positions];
    if (position && !formOptions.positions.includes(position)) {
      positions.push(position);
    }
    return positions;
  }, [formOptions.positions, position]);

  const displayDepartments = useMemo(() => {
    const departments = [...formOptions.departments];
    if (department && !formOptions.departments.includes(department)) {
      departments.push(department);
    }
    return departments;
  }, [formOptions.departments, department]);

  console.log("EmploymentDetails render - position:", position);
  console.log("EmploymentDetails render - department:", department);
  console.log("EmploymentDetails render - employmentType:", employmentType);
  console.log("EmploymentDetails render - joiningDate:", joiningDate);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Position
        </label>
        <Select
          value={position}
          onValueChange={onPositionChange}
          disabled={disabled || isLoadingOptions}
          required
        >
          <SelectTrigger className="bg-white">
            <SelectValue
              placeholder={isLoadingOptions ? "Loading..." : "Select position"}
            />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {displayPositions.map((pos) => (
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
          disabled={disabled || isLoadingOptions}
          required
        >
          <SelectTrigger className="bg-white">
            <SelectValue
              placeholder={
                isLoadingOptions ? "Loading..." : "Select department"
              }
            />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {displayDepartments.map((dept) => (
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
});

EmploymentDetails.displayName = "EmploymentDetails";
