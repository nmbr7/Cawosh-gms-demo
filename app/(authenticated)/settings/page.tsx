"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings, Building2, Wrench, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { ServiceList } from "./components/services";
import { useGarageStore } from "@/store/garage";
import { BusinessHours } from "./components/business/BusinessHours";
import BasicInformation from "./components/business/BasicInformation";
import TaxSettings from "./components/business/TaxConfiguration";

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
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  const garage = useGarageStore((state) => state.garage);

  useEffect(() => {
    if (activeTab === "services" && activeSubmenu === "list") {
      fetchServices();
    }
  }, [activeTab, activeSubmenu]);

  useEffect(() => {
    fetch("/api/garages")
      .then((res) => res.json())
      .then((data) => {
        useGarageStore.getState().setGarage(data);
      });
  }, []);

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

  // Service handlers for ServiceList

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
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
                <div className="max-w-[75%]">
                  <BasicInformation garage={garage} />
                </div>
              )}
              {activeSubmenu === "hours" && (
                <div className="max-w-[75%]">
                  <BusinessHours
                    onTimeChange={() => {}}
                    onSave={() => {}}
                    businessHours={
                      garage?.businessHours || {
                        monday: { open: "", close: "" },
                        tuesday: { open: "", close: "" },
                        wednesday: { open: "", close: "" },
                        thursday: { open: "", close: "" },
                        friday: { open: "", close: "" },
                        saturday: { open: "", close: "" },
                        sunday: { open: "", close: "" },
                      }
                    }
                  />
                </div>
              )}
              {activeSubmenu === "tax" && (
                <div className="max-w-[75%]">
                  <TaxSettings billing={garage?.billing} />
                </div>
              )}
            </>
          )}

          {activeTab === "services" && (
            <>
              {activeSubmenu === "list" && (
                <ServiceList
                  services={services}
                  onServiceAdd={() => {}}
                  onServiceUpdate={() => {}}
                  onServiceDelete={() => {}}
                  loading={servicesLoading}
                />
              )}
              {activeSubmenu === "status" && (
                <div className="max-w-[75%]">
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
                <div className="max-w-[75%]">
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
                <div className="max-w-[75%]">
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
                <div className="max-w-[75%]">
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
                <div className="max-w-[75%]">
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
                <div className="max-w-[75%]">
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
                <div className="max-w-[75%]">
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
