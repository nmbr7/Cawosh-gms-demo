"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Building2, Wrench, Car, Users, Calendar, CreditCard, Bell, Plug, Shield, Database, BarChart } from "lucide-react";
import { toast } from "sonner";

interface SettingsData {
  [key: string]: any; // Add index signature
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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("business");
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save settings');
      
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: "business", label: "Business", icon: Building2 },
    { id: "services", label: "Services", icon: Wrench },
    { id: "vehicles", label: "Vehicles", icon: Car },
    { id: "staff", label: "Staff", icon: Users },
    { id: "customers", label: "Customers", icon: Users },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "integrations", label: "Integrations", icon: Plug },
    { id: "system", label: "System", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
    { id: "backup", label: "Backup", icon: Database },
    { id: "reports", label: "Reports", icon: BarChart },
  ];

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

      <Tabs defaultValue="business" className="space-y-8" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Business Settings */}
        <TabsContent value="business" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Manage your garage's basic information and operating hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Garage Name</Label>
                  <Input 
                    placeholder="Enter garage name" 
                    value={settings?.business.garageName || ''}
                    onChange={(e) => handleInputChange('business', 'garageName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Business Address</Label>
                  <Input 
                    placeholder="Enter business address" 
                    value={settings?.business.businessAddress || ''}
                    onChange={(e) => handleInputChange('business', 'businessAddress', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input 
                    placeholder="Enter contact phone" 
                    value={settings?.business.contactPhone || ''}
                    onChange={(e) => handleInputChange('business', 'contactPhone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input 
                    placeholder="Enter contact email" 
                    value={settings?.business.contactEmail || ''}
                    onChange={(e) => handleInputChange('business', 'contactEmail', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Business Hours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(settings?.business.businessHours || {}).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-4">
                      <div className="w-24 capitalize">{day}</div>
                      <div className="flex-1 flex items-center gap-2">
                        <Input 
                          type="time" 
                          value={hours.open}
                          onChange={(e) => handleInputChange('business', 'businessHours', {
                            ...settings?.business.businessHours,
                            [day]: { ...hours, open: e.target.value }
                          })}
                        />
                        <span>to</span>
                        <Input 
                          type="time" 
                          value={hours.close}
                          onChange={(e) => handleInputChange('business', 'businessHours', {
                            ...settings?.business.businessHours,
                            [day]: { ...hours, close: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Tax Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tax Rate (%)</Label>
                    <Input 
                      type="number" 
                      placeholder="Enter tax rate" 
                      value={settings?.business.taxSettings.taxRate || ''}
                      onChange={(e) => handleInputChange('business', 'taxSettings', {
                        ...settings?.business.taxSettings,
                        taxRate: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tax Registration Number</Label>
                    <Input 
                      placeholder="Enter tax registration number" 
                      value={settings?.business.taxSettings.taxRegistrationNumber || ''}
                      onChange={(e) => handleInputChange('business', 'taxSettings', {
                        ...settings?.business.taxSettings,
                        taxRegistrationNumber: e.target.value
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Settings */}
        <TabsContent value="services" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Service Settings</CardTitle>
              <CardDescription>Manage your service offerings and pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">Service Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Service Name</Label>
                    <Input placeholder="Enter service name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input type="number" placeholder="Enter duration" />
                  </div>
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input type="number" placeholder="Enter price" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="repair">Repair</SelectItem>
                        <SelectItem value="inspection">Inspection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicle Settings */}
        <TabsContent value="vehicles" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Settings</CardTitle>
              <CardDescription>Manage vehicle types and documentation requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">Vehicle Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Make</Label>
                    <Input placeholder="Enter vehicle make" />
                  </div>
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Input placeholder="Enter vehicle model" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Documentation Requirements</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Vehicle Registration</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Insurance Documents</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Service History</Label>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Settings */}
        <TabsContent value="staff" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Staff Settings</CardTitle>
              <CardDescription>Manage staff roles and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">Roles and Permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role Name</Label>
                    <Input placeholder="Enter role name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select permissions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="technician">Technician</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Work Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Working Hours</Label>
                    <Input type="time" />
                  </div>
                  <div className="space-y-2">
                    <Label>Break Duration (minutes)</Label>
                    <Input type="number" placeholder="Enter break duration" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Settings */}
        <TabsContent value="customers" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Customer Settings</CardTitle>
              <CardDescription>Manage customer information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Customer Name</Label>
                    <Input placeholder="Enter customer name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Customer Email</Label>
                    <Input placeholder="Enter customer email" />
                  </div>
                  <div className="space-y-2">
                    <Label>Customer Phone</Label>
                    <Input placeholder="Enter customer phone" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Customer Preferences</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Preferred Service</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="repair">Repair</SelectItem>
                        <SelectItem value="inspection">Inspection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Preferred Mechanic</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred mechanic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="John Doe">John Doe</SelectItem>
                        <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking Settings */}
        <TabsContent value="bookings" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Booking Settings</CardTitle>
              <CardDescription>Manage booking preferences and processes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">Booking Preferences</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Preferred Booking Time</Label>
                    <Input type="time" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Booking Duration (minutes)</Label>
                    <Input type="number" placeholder="Enter booking duration" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Booking Process</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Booking Confirmation</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Booking Cancellation</Label>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Billing Settings</CardTitle>
              <CardDescription>Manage billing preferences and processes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">Billing Preferences</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Preferred Payment Method</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit card">Credit Card</SelectItem>
                        <SelectItem value="bank transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Billing Frequency</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select billing frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Billing Process</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Invoice Generation</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Invoice Payment</Label>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage notification preferences and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">Notification Preferences</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Preferred Notification Channel</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred notification channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Notification Frequency</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select notification frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Notification Settings</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Email Notifications</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>SMS Notifications</Label>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Settings */}
        <TabsContent value="integrations" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>Manage third-party integrations and external services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">Third-Party Integrations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Integration Name</Label>
                    <Input placeholder="Enter integration name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Integration URL</Label>
                    <Input placeholder="Enter integration URL" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">External Services</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Service Name</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select external service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Google Maps">Google Maps</SelectItem>
                        <SelectItem value="Yelp">Yelp</SelectItem>
                        <SelectItem value="TripAdvisor">TripAdvisor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Service URL</Label>
                    <Input placeholder="Enter service URL" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Manage system-wide settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">System Preferences</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>System Language</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select system language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>System Timezone</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select system timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">Eastern Standard Time</SelectItem>
                        <SelectItem value="CST">Central Standard Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">System Features</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Feature Name</Label>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage security-related settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">Security Preferences</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Security Level</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select security level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Two-Factor Authentication</Label>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Security Features</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Feature Name</Label>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Backup Settings</CardTitle>
              <CardDescription>Manage backup-related settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">Backup Preferences</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Backup Frequency</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select backup frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Backup Location</Label>
                    <Input placeholder="Enter backup location" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Backup Features</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Feature Name</Label>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Settings */}
        <TabsContent value="reports" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Reports Settings</CardTitle>
              <CardDescription>Manage reporting-related settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">Reporting Preferences</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Reporting Frequency</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reporting frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Reporting Location</Label>
                    <Input placeholder="Enter reporting location" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Reporting Features</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Feature Name</Label>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 