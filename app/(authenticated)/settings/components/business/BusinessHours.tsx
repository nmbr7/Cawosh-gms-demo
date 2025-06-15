import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { BusinessHours as BusinessHoursType } from "@/app/models/garage";

interface BusinessHoursProps {
  businessHours: BusinessHoursType;
  onTimeChange: (
    day: string,
    type: "open" | "close" | "isClosed",
    value: string
  ) => void;
  onSave: () => void;
  saving?: boolean;
}

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function BusinessHours({
  businessHours,
  onTimeChange,
  onSave,
  saving = false,
}: BusinessHoursProps) {
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
                    onChange={(e) => onTimeChange(day, "open", e.target.value)}
                    disabled={dayData.isClosed}
                  />
                </div>
                <div>
                  <Input
                    type="time"
                    className="[&::-webkit-calendar-picker-indicator]:hidden pr-16"
                    value={dayData.close}
                    onChange={(e) => onTimeChange(day, "close", e.target.value)}
                    disabled={dayData.isClosed}
                  />
                </div>
                <div className="flex items-center space-x-2 h-[72px]">
                  <Switch
                    checked={!dayData.isClosed}
                    onCheckedChange={(checked) => {
                      onTimeChange(day, "isClosed", (!checked).toString());
                    }}
                  />
                  <Label>{dayData.isClosed ? "Closed" : "Open"}</Label>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
