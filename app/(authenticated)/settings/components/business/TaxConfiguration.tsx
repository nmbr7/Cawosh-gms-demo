import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Garage } from "@/app/models/garage";

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
  garage,
}: {
  garage: Garage | undefined;
}) {
  if (!garage) return null;

  const { settings, billing } = garage;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Tax Configuration</CardTitle>
        <CardDescription>Configure tax rates and registration</CardDescription>
      </CardHeader>
      <hr />
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Tax Rate (%)</Label>
            <Input type="number" value={settings.taxRate * 100} disabled />
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Input value={settings.currency} disabled />
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Input value={settings.timezone} disabled />
          </div>
          <div className="space-y-2">
            <Label>Online Booking</Label>
            <Input
              value={settings.allowOnlineBooking ? "Enabled" : "Disabled"}
              disabled
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tax Registration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Registration Number</Label>
              <Input value={billing.taxRegistrationNumber} disabled />
            </div>
            <div className="space-y-2">
              <Label>Registration Name</Label>
              <Input value={billing.taxRegistrationName} disabled />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-md font-medium">Registration Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Street</Label>
                <Input value={billing.taxRegistrationAddress.street} disabled />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={billing.taxRegistrationAddress.city} disabled />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={billing.taxRegistrationAddress.state} disabled />
              </div>
              <div className="space-y-2">
                <Label>ZIP Code</Label>
                <Input
                  value={billing.taxRegistrationAddress.zipCode}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  value={billing.taxRegistrationAddress.country}
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
