import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BasicInformationProps {
  settings: {
    garageName: string;
    businessAddress: string;
    contactPhone: string;
    contactEmail: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export function BasicInformation({
  settings,
  onInputChange,
}: BasicInformationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Manage your garage&apos;s basic information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Garage Name</Label>
            <Input
              placeholder="Enter garage name"
              value={settings.garageName || ""}
              onChange={(e) => onInputChange("garageName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Business Address</Label>
            <Input
              placeholder="Enter business address"
              value={settings.businessAddress || ""}
              onChange={(e) => onInputChange("businessAddress", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Contact Phone</Label>
            <Input
              placeholder="Enter contact phone"
              value={settings.contactPhone || ""}
              onChange={(e) => onInputChange("contactPhone", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Contact Email</Label>
            <Input
              placeholder="Enter contact email"
              value={settings.contactEmail || ""}
              onChange={(e) => onInputChange("contactEmail", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
