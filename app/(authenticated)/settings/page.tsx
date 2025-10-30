'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Settings, Building2, Wrench, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { ServiceList } from './components/services';
import { useGarageStore } from '@/store/garage';
import { BusinessHours } from './components/business/BusinessHours';
import BasicInformation from './components/business/BasicInformation';
import TaxSettings from './components/business/TaxConfiguration';
import type { BusinessHours as BusinessHoursType } from '@/app/models/garage';
import type { Service } from '@/app/models/service';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

const tabs = [
  {
    id: 'business',
    label: 'Business',
    icon: Building2,
    submenus: [
      { id: 'info', label: 'Basic Information' },
      { id: 'hours', label: 'Business Hours' },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    icon: Wrench,
    submenus: [],
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: CreditCard,
    submenus: [
      { id: 'tax', label: 'Tax Configuration' },
      { id: 'payment', label: 'Payment Settings' },
    ],
  },
  {
    id: 'system',
    label: 'System',
    icon: Settings,
    submenus: [
      { id: 'security', label: 'Security' },
      { id: 'notifications', label: 'Notifications' },
      { id: 'backup', label: 'Backup' },
      { id: 'integrations', label: 'Integrations' },
    ],
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('business');
  const [activeSubmenu, setActiveSubmenu] = useState('info');
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [businessHours, setBusinessHours] = useState<BusinessHoursType>([]);

  const garage = useGarageStore((state) => state.garage);

  useEffect(() => {
    fetchGarageSettings();
  }, []);

  const fetchGarageSettings = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth('/api/garage-settings');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch garage settings');
      }

      useGarageStore.getState().setGarage(data.data);
      setBusinessHours(data.data.businessHours);
    } catch (error) {
      toast.error(
        `Failed to fetch garage settings: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (
    day: string,
    type: 'open' | 'close' | 'isClosed',
    value: string,
  ) => {
    setBusinessHours((prev) =>
      prev.map((hour) =>
        hour.day === day
          ? {
              ...hour,
              [type]: type === 'isClosed' ? value === 'true' : value,
            }
          : hour,
      ),
    );
  };

  const handleSaveBusinessHours = async () => {
    setSaving(true);
    try {
      const response = await fetchWithAuth('/api/garage-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessHours,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save business hours');
      }

      const data = await response.json();
      useGarageStore.getState().setGarage(data.data);
      toast.success('Business hours updated successfully');
    } catch (error) {
      toast.error(
        `Failed to save business hours: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'services') {
      fetchServices();
    }
  }, [activeTab]);

  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      const garage = useGarageStore.getState().garage;
      if (!garage) {
        throw new Error('No garage selected');
      }

      const response = await fetchWithAuth(
        `/api/garages/${garage.id}/services`,
      );
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      toast.error(
        `Failed to load services: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    } finally {
      setServicesLoading(false);
    }
  };

  const handleServiceUpdate = async (
    updatedFields: Omit<Service, 'serviceId'> & { serviceId: string },
  ) => {
    const garage = useGarageStore.getState().garage;
    if (!garage) return;
    const { serviceId, customPrice, duration, isActive } = updatedFields;
    try {
      const response = await fetchWithAuth(
        `/api/garages/${garage.id}/services/${serviceId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customPrice,
            customDuration: duration,
            isActive,
          }),
        },
      );
      if (!response.ok) {
        throw new Error('Failed to update service');
      }
      // Optimistically update the local state
      setServices((prev) =>
        prev.map((service) =>
          service.serviceId === serviceId
            ? { ...service, customPrice, duration, isActive }
            : service,
        ),
      );
      toast.success('Service updated successfully!');
    } catch (error) {
      toast.error(
        `Failed to update service: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="p-3">
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
                    if (tab.submenus.length > 0) {
                      setActiveSubmenu(tab.submenus[0].id);
                    }
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
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
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-gray-600 hover:bg-gray-50'
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
          {activeTab === 'business' && (
            <>
              {activeSubmenu === 'info' && (
                <div className="max-w-[75%]">
                  <BasicInformation garage={garage} />
                </div>
              )}
              {activeSubmenu === 'hours' && (
                <div className="max-w-[75%]">
                  <BusinessHours
                    onTimeChange={handleTimeChange}
                    onSave={handleSaveBusinessHours}
                    businessHours={businessHours}
                    saving={saving}
                  />
                </div>
              )}
              {activeSubmenu === 'tax' && (
                <div className="max-w-[75%]">
                  <TaxSettings garage={garage || undefined} />
                </div>
              )}
            </>
          )}

          {activeTab === 'services' && (
            <ServiceList
              services={services}
              garageId={garage?.id || ''}
              onServiceAdd={() => {}}
              onServiceUpdate={handleServiceUpdate}
              onServiceDelete={() => {}}
              loading={servicesLoading}
            />
          )}

          {activeTab === 'billing' && (
            <>
              {activeSubmenu === 'tax' && (
                <div className="max-w-[75%]">
                  <TaxSettings garage={garage || undefined} />
                </div>
              )}
              {activeSubmenu === 'payment' && (
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

          {activeTab === 'system' && (
            <>
              {activeSubmenu === 'security' && (
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
              {activeSubmenu === 'notifications' && (
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
              {activeSubmenu === 'backup' && (
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
              {activeSubmenu === 'integrations' && (
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
