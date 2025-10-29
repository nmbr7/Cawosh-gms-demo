import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ContactInputsProps {
  email: string;
  phone: string;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  disabled?: boolean;
}

export function ContactInputs({
  email,
  phone,
  onEmailChange,
  onPhoneChange,
  disabled = false,
}: ContactInputsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="Enter email"
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">
          Phone <span className="text-red-500">*</span>
        </Label>
        <div className="flex">
          <div className="flex items-center px-3 bg-gray-100 border border-r-0 rounded-l-md text-gray-500">
            +44
          </div>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="Enter phone number"
            className="rounded-l-none"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
