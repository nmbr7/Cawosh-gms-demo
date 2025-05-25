import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BusinessHoursProps {
  businessHours: {
    [key: string]: { open: string; close: string };
  };
  onTimeChange: (day: string, type: "open" | "close", value: string) => void;
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
}: BusinessHoursProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Hours</CardTitle>
        <CardDescription>Set your operating hours</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {DAYS.map((day) => (
            <div key={day} className="grid grid-cols-3 gap-4 items-center">
              <Label className="text-right">{day}</Label>
              <div className="space-y-2">
                <Label>Open</Label>
                <Input
                  type="time"
                  value={businessHours[day.toLowerCase()]?.open || ""}
                  onChange={(e) =>
                    onTimeChange(day.toLowerCase(), "open", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Close</Label>
                <Input
                  type="time"
                  value={businessHours[day.toLowerCase()]?.close || ""}
                  onChange={(e) =>
                    onTimeChange(day.toLowerCase(), "close", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
