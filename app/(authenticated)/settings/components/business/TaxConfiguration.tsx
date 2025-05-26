import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Billing } from "@/app/models/garage";

interface TaxSettingsProps {
  taxSettings: {
    taxRate: number;
    taxRegistrationNumber: string;
  };
  onInputChange: (field: string, value: string | number) => void;
}

export function EditableTaxSettings({
  taxSettings,
  onInputChange,
}: TaxSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Settings</CardTitle>
        <CardDescription>Configure tax rates and registration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tax Rate (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="Enter tax rate"
              value={taxSettings.taxRate || ""}
              onChange={(e) =>
                onInputChange("taxRate", parseFloat(e.target.value) || 0)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Tax Registration Number</Label>
            <Input
              placeholder="Enter tax registration number"
              value={taxSettings.taxRegistrationNumber || ""}
              onChange={(e) =>
                onInputChange("taxRegistrationNumber", e.target.value)
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TaxSettings({
  billing,
}: {
  billing: Billing | undefined;
}) {
  if (!billing) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Configuration</CardTitle>
        <CardDescription>Configure tax rates and registration</CardDescription>
      </CardHeader>
      <hr />
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tax Rate (%)</Label>
            <Input type="number" value={billing.taxRate * 100} disabled />
          </div>
          <div className="space-y-2">
            <Label>Tax Registration Number</Label>
            <Input value={billing.taxRegistrationNumber} disabled />
          </div>
          <div className="space-y-2">
            <Label>Tax Registration Name</Label>
            <Input value={billing.taxRegistrationName} disabled />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Tax Registration Address</Label>
            <Input
              value={`${billing.taxRegistrationAddress.street}, ${billing.taxRegistrationAddress.city}, ${billing.taxRegistrationAddress.state}, ${billing.taxRegistrationAddress.zip}, ${billing.taxRegistrationAddress.country}`}
              disabled
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
