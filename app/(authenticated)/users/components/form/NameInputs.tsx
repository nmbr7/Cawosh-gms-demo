import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NameInputsProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  disabled?: boolean;
}

export function NameInputs({ firstName, lastName, onFirstNameChange, onLastNameChange, disabled = false }: NameInputsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          First Name
        </label>
        <Input
          type="text"
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
          disabled={disabled}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Last Name
        </label>
        <Input
          type="text"
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
} 