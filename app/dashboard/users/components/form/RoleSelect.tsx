import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/app/models/user";

interface RoleSelectProps {
  role: UserRole;
  onRoleChange: (value: UserRole) => void;
  disabled?: boolean;
}

export function RoleSelect({ role, onRoleChange, disabled = false }: RoleSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
      <Select
        value={role}
        onValueChange={(value) => onRoleChange(value as UserRole)}
        disabled={disabled}
        required
      >
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="manager">Manager</SelectItem>
          <SelectItem value="staff">Staff</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 