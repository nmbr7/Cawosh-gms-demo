import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactInputsProps {
  email: string;
  phone: string;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  emailError?: string;
  phoneError?: string;
  disabled?: boolean;
}

export function ContactInputs({
  email,
  phone,
  onEmailChange,
  onPhoneChange,
  emailError,
  phoneError,
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
          required
          className={emailError ? "border-red-500" : ""}
          disabled={disabled}
        />
        {emailError && <p className="text-sm text-red-500">{emailError}</p>}
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
            className={`rounded-l-none ${phoneError ? "border-red-500" : ""}`}
            required
            disabled={disabled}
          />
        </div>
        {phoneError && <p className="text-sm text-red-500">{phoneError}</p>}
      </div>
    </div>
  );
}
