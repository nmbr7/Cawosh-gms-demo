import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
}

interface ServiceStatusProps {
  services: Service[];
  onStatusChange: (serviceId: string, isActive: boolean) => void;
}

export function ServiceStatus({
  services,
  onStatusChange,
}: ServiceStatusProps) {
  const handleStatusChange = (serviceId: string, isActive: boolean) => {
    onStatusChange(serviceId, isActive);
    toast.success(
      `Service ${isActive ? "activated" : "deactivated"} successfully`
    );
  };

  const activeServices = services.filter((service) => service.isActive);
  const inactiveServices = services.filter((service) => !service.isActive);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Status</CardTitle>
        <CardDescription>Enable or disable services</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Active Services</h3>
            <div className="space-y-4">
              {activeServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-base">{service.name}</Label>
                      <Badge variant="secondary">{service.category}</Badge>
                    </div>
                  </div>
                  <Switch
                    checked={service.isActive}
                    onCheckedChange={(checked) =>
                      handleStatusChange(service.id, checked)
                    }
                  />
                </div>
              ))}
              {activeServices.length === 0 && (
                <p className="text-muted-foreground">No active services</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Inactive Services</h3>
            <div className="space-y-4">
              {inactiveServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-muted/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-base text-muted-foreground">
                        {service.name}
                      </Label>
                      <Badge variant="outline">{service.category}</Badge>
                    </div>
                  </div>
                  <Switch
                    checked={service.isActive}
                    onCheckedChange={(checked) =>
                      handleStatusChange(service.id, checked)
                    }
                  />
                </div>
              ))}
              {inactiveServices.length === 0 && (
                <p className="text-muted-foreground">No inactive services</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
