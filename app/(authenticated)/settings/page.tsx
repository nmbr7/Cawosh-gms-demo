"use client";

import { useState, useEffect } from "react";
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
import { Settings, Building2, Wrench, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { ServiceList } from "./components/services";
import type { Service } from "./components/services/ServiceList";

interface SettingsData {
  [key: string]: Record<string, unknown>;
  business: {
    garageName: string;
    businessAddress: string;
    contactPhone: string;
    contactEmail: string;
    businessHours: {
      [key: string]: { open: string; close: string };
    };
    taxSettings: {
      taxRate: number;
      taxRegistrationNumber: string;
    };
  };
  // Add other settings interfaces as needed
}

const tabs = [
  {
    id: "business",
    label: "Business",
    icon: Building2,
    submenus: [
      { id: "info", label: "Basic Information" },
      { id: "hours", label: "Business Hours" },
      { id: "tax", label: "Tax Settings" },
    ],
  },
  {
    id: "services",
    label: "Services",
    icon: Wrench,
    submenus: [
      { id: "list", label: "Service List" },
      { id: "status", label: "Service Status" },
    ],
  },
  {
    id: "billing",
    label: "Billing",
    icon: CreditCard,
    submenus: [
      { id: "tax", label: "Tax Configuration" },
      { id: "payment", label: "Payment Settings" },
    ],
  },
  {
    id: "system",
    label: "System",
    icon: Settings,
    submenus: [
      { id: "security", label: "Security" },
      { id: "notifications", label: "Notifications" },
      { id: "backup", label: "Backup" },
      { id: "integrations", label: "Integrations" },
    ],
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("business");
  const [activeSubmenu, setActiveSubmenu] = useState("info");
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === "services" && activeSubmenu === "list") {
      fetchServices();
    }
  }, [activeTab, activeSubmenu]);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      toast.error(
        `Failed to load settings: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      toast.error(
        `Failed to load services: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setServicesLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Failed to save settings");

      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error(
        `Failed to save settings: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (
    section: string,
    field: string,
    value: string | number | boolean
  ) => {
    if (!settings) return;

    setSettings((prev) => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value,
      },
    }));
  };

  const handleServiceAdd = async (service: Omit<Service, "id">) => {
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(service),
      });
      if (!response.ok) throw new Error("Failed to add service");
      fetchServices();
    } catch (error) {
      toast.error(
        `Failed to add service: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleServiceUpdate = async (service: Service) => {
    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(service),
      });
      if (!response.ok) throw new Error("Failed to update service");
      fetchServices();
    } catch (error) {
      toast.error(
        `Failed to update service: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleServiceDelete = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete service");
      fetchServices();
    } catch (error) {
      toast.error(
        `Failed to delete service: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <Button onClick={handleSave} disabled={isSaving}>
          <Settings className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Main Navigation */}
        <div className="w-64 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <div key={tab.id} className="space-y-1">
                <button
                  onClick={() => {
                    setActiveTab(tab.id);
                    setActiveSubmenu(tab.submenus[0].id);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
                {activeTab === tab.id && (
                  <div className="ml-6 space-y-1">
                    {tab.submenus.map((submenu) => (
                      <button
                        key={submenu.id}
                        onClick={() => setActiveSubmenu(submenu.id)}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSubmenu === submenu.id
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {submenu.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === "business" && (
            <>
              {activeSubmenu === "info" && (
                <div className="max-w-[66.666%]">
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
                            value={settings?.business.garageName || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "business",
                                "garageName",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Business Address</Label>
                          <Input
                            placeholder="Enter business address"
                            value={settings?.business.businessAddress || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "business",
                                "businessAddress",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              {activeSubmenu === "hours" && (
                <div className="max-w-[66.666%]">
                  <Card>
                    <CardHeader>
                      <CardTitle>Business Hours</CardTitle>
                      <CardDescription>
                        Set your operating hours
                      </CardDescription>
                    </CardHeader>
                    <CardContent>{/* Business hours content */}</CardContent>
                  </Card>
                </div>
              )}
              {activeSubmenu === "tax" && (
                <div className="max-w-[66.666%]">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tax Settings</CardTitle>
                      <CardDescription>
                        Configure tax rates and registration
                      </CardDescription>
                    </CardHeader>
                    <CardContent>{/* Tax settings content */}</CardContent>
                  </Card>
                </div>
              )}
            </>
          )}

          {activeTab === "services" && (
            <>
              {activeSubmenu === "list" &&
                (servicesLoading ? (
                  <div className="p-6">Loading services...</div>
                ) : (
                  <ServiceList
                    services={services}
                    onServiceAdd={handleServiceAdd}
                    onServiceUpdate={handleServiceUpdate}
                    onServiceDelete={handleServiceDelete}
                  />
                ))}
              {activeSubmenu === "status" && (
                <div className="max-w-[66.666%]">
                  <Card>
                    <CardHeader>
                      <CardTitle>Service Status</CardTitle>
                      <CardDescription>
                        Enable or disable services
                      </CardDescription>
                    </CardHeader>
                    <CardContent>{/* Service status content */}</CardContent>
                  </Card>
                </div>
              )}
            </>
          )}

          {activeTab === "billing" && (
            <>
              {activeSubmenu === "tax" && (
                <div className="max-w-[66.666%]">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tax Configuration</CardTitle>
                      <CardDescription>
                        Manage tax settings and rates
                      </CardDescription>
                    </CardHeader>
                    <CardContent>{/* Tax configuration content */}</CardContent>
                  </Card>
                </div>
              )}
              {activeSubmenu === "payment" && (
                <div className="max-w-[66.666%]">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Settings</CardTitle>
                      <CardDescription>
                        Configure payment methods and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>{/* Payment settings content */}</CardContent>
                  </Card>
                </div>
              )}
            </>
          )}

          {activeTab === "system" && (
            <>
              {activeSubmenu === "security" && (
                <div className="max-w-[66.666%]">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>
                        Manage security preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>{/* Security settings content */}</CardContent>
                  </Card>
                </div>
              )}
              {activeSubmenu === "notifications" && (
                <div className="max-w-[66.666%]">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>
                        Configure notification preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Notification settings content */}
                    </CardContent>
                  </Card>
                </div>
              )}
              {activeSubmenu === "backup" && (
                <div className="max-w-[66.666%]">
                  <Card>
                    <CardHeader>
                      <CardTitle>Backup Settings</CardTitle>
                      <CardDescription>
                        Manage backup preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>{/* Backup settings content */}</CardContent>
                  </Card>
                </div>
              )}
              {activeSubmenu === "integrations" && (
                <div className="max-w-[66.666%]">
                  <Card>
                    <CardHeader>
                      <CardTitle>Integration Settings</CardTitle>
                      <CardDescription>
                        Manage third-party integrations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Integration settings content */}
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
