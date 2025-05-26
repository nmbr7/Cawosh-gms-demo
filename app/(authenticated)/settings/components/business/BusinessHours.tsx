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
import type { BusinessHours as BusinessHoursType } from "@/app/models/garage";

interface BusinessHoursProps {
  businessHours: BusinessHoursType;
  onTimeChange: (day: string, type: "open" | "close", value: string) => void;
  onSave: () => void;
  saving?: boolean;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
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
        <CardTitle>Business Hours</CardTitle>
        <CardDescription>Set your operating hours</CardDescription>
      </CardHeader>
      <hr />
      <CardContent>
        <div className="space-y-4">
          {DAYS.map((day) => (
            <div key={day} className="grid grid-cols-3 gap-4 items-center">
              <Label className="text-right">{day}</Label>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Open</Label>
                <Input
                  type="time"
                  className="[&::-webkit-calendar-picker-indicator]:hidden pr-16"
                  value={
                    businessHours[day.toLowerCase() as keyof BusinessHoursType]
                      ?.open || ""
                  }
                  onChange={(e) =>
                    onTimeChange(
                      day.toLowerCase() as keyof BusinessHoursType,
                      "open",
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Close</Label>
                <Input
                  type="time"
                  className="[&::-webkit-calendar-picker-indicator]:hidden pr-16"
                  value={
                    businessHours[day.toLowerCase() as keyof BusinessHoursType]
                      ?.close || ""
                  }
                  onChange={(e) =>
                    onTimeChange(
                      day.toLowerCase() as keyof BusinessHoursType,
                      "close",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          ))}
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

export function BusinessHoursCard({
  businessHours,
}: {
  businessHours: BusinessHoursType | undefined;
}) {
  if (!businessHours) return null;
  return (
    <div>
      <div>
        Monday: {businessHours.monday.open} - {businessHours.monday.close}
      </div>
      {/* Repeat for other days */}
    </div>
  );
}
