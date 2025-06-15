import { useState } from "react";
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
import { toast } from "sonner";
import { useGarageStore } from "@/store/garage";
import type { Garage } from "@/app/models/garage";

export default function BasicInformation({
  garage,
}: {
  garage: Garage | null;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: garage?.name || "",
    street: garage?.address.street || "",
    city: garage?.address.city || "",
    state: garage?.address.state || "",
    zipCode: garage?.address.zipCode || "",
    country: garage?.address.country || "",
  });

  const hasChanges = () => {
    if (!garage) return false;
    return (
      formData.name !== garage.name ||
      formData.street !== garage.address.street ||
      formData.city !== garage.address.city ||
      formData.state !== garage.address.state ||
      formData.zipCode !== garage.address.zipCode ||
      formData.country !== garage.address.country
    );
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/garage-settings/basic", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update garage information");
      }

      const data = await response.json();
      useGarageStore.getState().setGarage(data.data);
      toast.success("Garage information updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error(
        `Failed to update garage information: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleCancel = () => {
    setFormData({
      name: garage?.name || "",
      street: garage?.address.street || "",
      city: garage?.address.city || "",
      state: garage?.address.state || "",
      zipCode: garage?.address.zipCode || "",
      country: garage?.address.country || "",
    });
    setIsEditing(false);
  };

  const formatAddress = () => {
    if (!garage) return "";
    const { street, city, state, zipCode, country } = garage.address;
    return `${street}, ${city}, ${state} ${zipCode}, ${country}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Basic Information</CardTitle>
            <CardDescription>
              Manage your garage&apos;s basic information
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <hr />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Garage Name</Label>
            <Input
              placeholder="Enter garage name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={!isEditing}
            />
          </div>
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label className="text-sm">Street Address</Label>
                <Input
                  placeholder="Enter street address"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">City</Label>
                <Input
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">State</Label>
                <Input
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">ZIP Code</Label>
                <Input
                  placeholder="Enter ZIP code"
                  value={formData.zipCode}
                  onChange={(e) =>
                    setFormData({ ...formData, zipCode: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Country</Label>
                <Input
                  placeholder="Enter country"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label className="text-sm">Business Address</Label>
              <Input
                placeholder="Enter business address"
                value={formatAddress()}
                disabled
              />
            </div>
          )}
        </div>
        {isEditing && (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges()}>
              Save Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
