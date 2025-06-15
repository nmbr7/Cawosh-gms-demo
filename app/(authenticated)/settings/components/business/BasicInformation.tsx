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

export default function BasicInformation({
  garage,
}: {
  garage: Garage | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Basic Information</CardTitle>
        <CardDescription>
          Manage your garage&apos;s basic information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <hr />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Garage Name</Label>
            <Input
              placeholder="Enter garage name"
              value={garage?.name || ""}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Business Address</Label>
            <Input
              placeholder="Enter business address"
              value={
                garage
                  ? `${garage.address.street}, ${garage.address.city}, ${garage.address.state}, ${garage.address.zipCode}, ${garage.address.country}`
                  : ""
              }
              disabled
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
