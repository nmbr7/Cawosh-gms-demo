import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { Garage } from '@/app/models/garage';
import type { TaxForm } from '@/app/models/taxform';
import { toast } from 'sonner';
import { useGarageStore } from '@/store/garage';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export default function TaxSettings({
  garage,
}: {
  garage: Garage | undefined;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<TaxForm | null>(() => {
    if (
      !garage ||
      !garage.settings ||
      !garage.billing ||
      !garage.billing.taxRegistrationAddress
    ) {
      setError('Failed to parse tax configuration: missing data.');
      return null;
    }
    return {
      taxRate: garage.billing.taxRate * 100,
      currency: garage.settings.currency,
      timezone: garage.settings.timezone,
      allowOnlineBooking: garage.settings.allowOnlineBooking,
      taxRegistrationNumber: garage.billing.taxRegistrationNumber,
      taxRegistrationName: garage.billing.taxRegistrationName,
      street: garage.billing.taxRegistrationAddress.street,
      city: garage.billing.taxRegistrationAddress.city,
      state: garage.billing.taxRegistrationAddress.state,
      zipCode: garage.billing.taxRegistrationAddress.zipCode,
      country: garage.billing.taxRegistrationAddress.country,
    };
  });
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }
  if (!garage || !form) return null;

  const handleChange = (
    field: keyof TaxForm,
    value: string | number | boolean,
  ) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleCancel = () => {
    setForm({
      taxRate: garage.billing.taxRate * 100,
      currency: garage.settings.currency,
      timezone: garage.settings.timezone,
      allowOnlineBooking: garage.settings.allowOnlineBooking,
      taxRegistrationNumber: garage.billing.taxRegistrationNumber,
      taxRegistrationName: garage.billing.taxRegistrationName,
      street: garage.billing.taxRegistrationAddress.street,
      city: garage.billing.taxRegistrationAddress.city,
      state: garage.billing.taxRegistrationAddress.state,
      zipCode: garage.billing.taxRegistrationAddress.zipCode,
      country: garage.billing.taxRegistrationAddress.country,
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!garage || !form) return;
    try {
      const payload = {
        taxRate: Number(form.taxRate) / 100,
        taxRegistrationNumber: form.taxRegistrationNumber,
        taxRegistrationName: form.taxRegistrationName,
        taxRegistrationAddress: {
          street: form.street,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          country: form.country,
        },
      };
      const response = await fetchWithAuth(`/api/garages/${garage.id}/tax`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Failed to update tax configuration');
      }
      const garageResponse = await fetchWithAuth(`/api/garage-settings`);
      const garageData = await garageResponse.json();
      console.log(
        'Fetched taxRate from backend:',
        garageData.data.settings.taxRate,
      );
      useGarageStore.getState().setGarage(garageData.data);
      setForm({
        taxRate: garageData.data.billing.taxRate * 100,
        currency: garageData.data.settings.currency,
        timezone: garageData.data.settings.timezone,
        allowOnlineBooking: garageData.data.settings.allowOnlineBooking,
        taxRegistrationNumber: garageData.data.billing.taxRegistrationNumber,
        taxRegistrationName: garageData.data.billing.taxRegistrationName,
        street: garageData.data.billing.taxRegistrationAddress.street,
        city: garageData.data.billing.taxRegistrationAddress.city,
        state: garageData.data.billing.taxRegistrationAddress.state,
        zipCode: garageData.data.billing.taxRegistrationAddress.zipCode,
        country: garageData.data.billing.taxRegistrationAddress.country,
      });
      toast.success('Tax configuration updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(
        `Failed to update tax configuration: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">Tax Configuration</CardTitle>
          <CardDescription>
            Configure tax rates and registration
          </CardDescription>
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        )}
      </CardHeader>
      <hr />
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Tax Rate (%)</Label>
            <Input
              type="number"
              value={form.taxRate}
              disabled={!isEditing}
              onChange={(e) =>
                handleChange('taxRate', parseFloat(e.target.value) || 0)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Input value={form.currency} disabled />
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Input value={form.timezone} disabled />
          </div>
          <div className="space-y-2">
            <Label>Online Booking</Label>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.allowOnlineBooking}
                disabled={!isEditing}
                onCheckedChange={(checked) =>
                  handleChange('allowOnlineBooking', checked)
                }
                id="online-booking-switch"
              />
              <span className="text-sm text-gray-600">
                {form.allowOnlineBooking ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tax Registration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Registration Number</Label>
              <Input
                value={form.taxRegistrationNumber}
                disabled={!isEditing}
                onChange={(e) =>
                  handleChange('taxRegistrationNumber', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Registration Name</Label>
              <Input
                value={form.taxRegistrationName}
                disabled={!isEditing}
                onChange={(e) =>
                  handleChange('taxRegistrationName', e.target.value)
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-md font-medium">Registration Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Street</Label>
                <Input
                  value={form.street}
                  disabled={!isEditing}
                  onChange={(e) => handleChange('street', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={form.city}
                  disabled={!isEditing}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={form.state}
                  disabled={!isEditing}
                  onChange={(e) => handleChange('state', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>ZIP Code</Label>
                <Input
                  value={form.zipCode}
                  disabled={!isEditing}
                  onChange={(e) => handleChange('zipCode', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value={form.country} disabled />
              </div>
            </div>
          </div>
        </div>
        {isEditing && (
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
