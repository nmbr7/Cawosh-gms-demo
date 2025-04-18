import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserStatus } from "@/app/models/user";

interface StatusSelectProps {
  status: UserStatus;
  onStatusChange: (value: UserStatus) => void;
  disabled?: boolean;
}

export function StatusSelect({ status, onStatusChange, disabled = false }: StatusSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
      <Select
        value={status}
        onValueChange={(value) => onStatusChange(value as UserStatus)}
        disabled={disabled}
        required
      >
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="on-leave">On Leave</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 