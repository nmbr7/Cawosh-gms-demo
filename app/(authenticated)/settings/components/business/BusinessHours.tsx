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
import { toast } from 'sonner';
import { useGarageStore } from '@/store/garage';
import type { BusinessHours as BusinessHoursType } from '@/app/models/garage';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface BusinessHoursProps {
  businessHours: BusinessHoursType;
  onTimeChange: (
    day: string,
    type: 'open' | 'close' | 'isClosed',
    value: string,
  ) => void;
  onSave: () => void;
  saving?: boolean;
}

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export function BusinessHours({
  businessHours,
  onTimeChange,
  onSave,
  saving = false,
}: BusinessHoursProps) {
  const handleSave = async () => {
    try {
      // Ensure all days are present and properly formatted
      const formattedBusinessHours = DAYS.map((day) => {
        const existingDay = businessHours.find((h) => h.day === day);
        if (existingDay) {
          return {
            day,
            open: existingDay.open || '09:00',
            close: existingDay.close || '17:00',
            isClosed: existingDay.isClosed ?? false,
          };
        }
        // Default values for missing days
        return {
          day,
          open: '09:00',
          close: '17:00',
          isClosed: false,
        };
      });

      const response = await fetchWithAuth('/api/garage-settings/hours', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessHours: formattedBusinessHours,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save business hours');
      }

      const data = await response.json();
      useGarageStore.getState().setGarage(data.data);
      toast.success('Business hours updated successfully');
      onSave();
    } catch (error) {
      toast.error(
        `Failed to save business hours: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Business Hours</CardTitle>
        <CardDescription>Set your operating hours</CardDescription>
      </CardHeader>
      <hr />
      <CardContent>
        <div className="space-y-4">
          {DAYS.map((day) => {
            const dayData = businessHours.find((h) => h.day === day);
            if (!dayData) return null;

            return (
              <div key={day} className="grid grid-cols-4 gap-4 items-center">
                <Label className="text-right capitalize">{day}</Label>
                <div>
                  <Input
                    type="time"
                    className="[&::-webkit-calendar-picker-indicator]:hidden pr-16"
                    value={dayData.open}
                    onChange={(e) => onTimeChange(day, 'open', e.target.value)}
                    disabled={dayData.isClosed}
                  />
                </div>
                <div>
                  <Input
                    type="time"
                    className="[&::-webkit-calendar-picker-indicator]:hidden pr-16"
                    value={dayData.close}
                    onChange={(e) => onTimeChange(day, 'close', e.target.value)}
                    disabled={dayData.isClosed}
                  />
                </div>
                <div className="flex items-center space-x-2 h-[72px]">
                  <Switch
                    checked={!dayData.isClosed}
                    onCheckedChange={(checked) => {
                      onTimeChange(day, 'isClosed', (!checked).toString());
                    }}
                  />
                  <Label>{dayData.isClosed ? 'Closed' : 'Open'}</Label>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
