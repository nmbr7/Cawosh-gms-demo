import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Stethoscope,
  Plus,
  Trash2,
  AlertCircle,
  User,
  Car,
} from 'lucide-react';
import { format } from 'date-fns';
import { useJobSheetStore } from '@/store/jobSheet';
import { useBookingStore } from '@/store/booking';
import { ServiceDropdown } from '@/app/components/booking/ServiceDropdown';
import { toast } from 'sonner';
import type { JobSheet } from '@/store/jobSheet';
import type { StoreService } from '@/store/booking';

interface DiagnosisSubmissionModalProps {
  jobSheet: JobSheet;
  isOpen: boolean;
  onClose: () => void;
  onDiagnosisSubmitted: () => void;
}

interface DiagnosedService {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  addedBy: string;
  addedAt: string;
}

interface CustomService {
  name: string;
  description: string;
  duration: number;
  price: number;
}

export function DiagnosisSubmissionModal({
  jobSheet,
  isOpen,
  onClose,
  onDiagnosisSubmitted,
}: DiagnosisSubmissionModalProps) {
  const [selectedServices, setSelectedServices] = useState<StoreService[]>([]);
  const [customServices, setCustomServices] = useState<CustomService[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [newCustomService, setNewCustomService] = useState<CustomService>({
    name: '',
    description: '',
    duration: 30,
    price: 0,
  });
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const jobSheetStore = useJobSheetStore();
  const bookingStore = useBookingStore();
  const { services } = bookingStore;

  const booking = jobSheet.booking;

  // Quick add services (most common)
  const quickAddServices = services.filter((service) =>
    [
      'service-1', // Oil Change
      'service-3', // Brake Inspection
      'service-7', // Battery Check
      'service-4', // Engine Diagnostic
      'service-10', // Air Filter Replacement
      'service-18', // Front Brake Pads Replacement
      'service-22', // Spark Plugs Replacement (4-cylinder)
      'service-15', // Coolant Flush
      'service-2', // Tire Rotation
      'service-6', // AC Service
    ].includes(service.id),
  );

  const handleQuickAdd = (service: StoreService) => {
    if (!selectedServices.some((s) => s.id === service.id)) {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(selectedServices.filter((s) => s.id !== serviceId));
  };

  const handleRemoveCustomService = (index: number) => {
    setCustomServices(customServices.filter((_, i) => i !== index));
  };

  const handleAddCustomService = () => {
    if (newCustomService.name.trim() && newCustomService.price > 0) {
      setCustomServices([...customServices, { ...newCustomService }]);
      setNewCustomService({
        name: '',
        description: '',
        duration: 30,
        price: 0,
      });
      setShowCustomForm(false);
    }
  };

  const handleSubmitDiagnosis = async () => {
    if (selectedServices.length === 0 && customServices.length === 0) {
      toast.error('Please add at least one service');
      return;
    }

    if (!diagnosisNotes.trim()) {
      toast.error('Please provide diagnosis notes');
      return;
    }

    try {
      setIsSubmitting(true);

      // Combine predefined and custom services
      const diagnosedServices: DiagnosedService[] = [
        ...selectedServices.map((service) => ({
          id: service.id,
          name: service.name,
          description: service.name, // Use name as description for predefined services
          duration: service.duration,
          price: service.price,
          addedBy: 'current-technician', // This would come from auth context
          addedAt: new Date().toISOString(),
        })),
        ...customServices.map((service, index) => ({
          id: `custom-${Date.now()}-${index}`,
          name: service.name,
          description: service.description,
          duration: service.duration,
          price: service.price,
          addedBy: 'current-technician',
          addedAt: new Date().toISOString(),
        })),
      ];

      // Add diagnosed services to job sheet
      jobSheetStore.addDiagnosedServices(jobSheet.id, diagnosedServices);

      toast.success('Diagnosis submitted for approval');
      onDiagnosisSubmitted();
      onClose();
    } catch (error) {
      toast.error('Failed to submit diagnosis');
      console.error('Error submitting diagnosis:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allServices = [...selectedServices, ...customServices];
  const totalPrice = allServices.reduce((acc, s) => acc + s.price, 0);
  const serviceCharge = 15.0;
  const subtotal = totalPrice + serviceCharge;
  const vat = subtotal * 0.2;
  const totalWithVat = subtotal + vat;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            Submit Diagnosis - {jobSheet.id}
          </DialogTitle>
          <DialogDescription>
            Add diagnosed services and provide detailed findings for customer
            approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Customer</span>
                </div>
                <p className="text-sm text-gray-900">
                  {booking?.customer?.name || 'N/A'}
                </p>
                <p className="text-xs text-gray-500">
                  {booking?.customer?.email || 'No email'}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Vehicle</span>
                </div>
                <p className="text-sm text-gray-900">
                  {booking?.vehicle?.make} {booking?.vehicle?.model} (
                  {booking?.vehicle?.year})
                </p>
                <p className="text-xs text-gray-500">
                  License: {booking?.vehicle?.license}
                </p>
              </div>
            </div>

            {/* Assigned Technician Info */}
            {booking?.assignedTechnicians &&
              booking.assignedTechnicians.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-800">
                      Assigned Technician
                    </span>
                  </div>
                  <div className="text-sm text-blue-700">
                    {booking.assignedTechnicians[0].technicianName}
                  </div>
                  <div className="text-xs text-blue-600">
                    Assigned on:{' '}
                    {format(
                      new Date(booking.assignedTechnicians[0].assignedAt),
                      "MMM dd, yyyy 'at' HH:mm",
                    )}
                  </div>
                </div>
              )}

            {booking?.diagnosisNotes && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-800">
                    Original Issue Description
                  </span>
                </div>
                <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-md">
                  {booking.diagnosisNotes}
                </p>
              </div>
            )}
          </div>

          {/* Quick Add Services */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Add Services</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {quickAddServices.map((service) => (
                <Button
                  key={service.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(service)}
                  disabled={selectedServices.some((s) => s.id === service.id)}
                  className="h-auto p-3 flex flex-col items-center gap-1 text-xs"
                >
                  <span className="font-medium truncate w-full text-center">
                    {service.name}
                  </span>
                  <span className="text-green-600 font-semibold">
                    £{service.price}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Search & Add Services */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Search & Add Services
            </h3>
            <ServiceDropdown
              selectedServices={selectedServices}
              onServicesChange={setSelectedServices}
              services={services}
              placeholder="Search and select services..."
            />
          </div>

          {/* Custom Service Form */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Custom Services</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomForm(!showCustomForm)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Custom Service
              </Button>
            </div>

            {showCustomForm && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-base">
                    Add Custom Service
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="custom-name">Service Name</Label>
                      <Input
                        id="custom-name"
                        value={newCustomService.name}
                        onChange={(e) =>
                          setNewCustomService({
                            ...newCustomService,
                            name: e.target.value,
                          })
                        }
                        placeholder="e.g., Custom Repair"
                      />
                    </div>
                    <div>
                      <Label htmlFor="custom-duration">
                        Duration (minutes)
                      </Label>
                      <Input
                        id="custom-duration"
                        type="number"
                        value={newCustomService.duration}
                        onChange={(e) =>
                          setNewCustomService({
                            ...newCustomService,
                            duration: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="custom-description">Description</Label>
                    <textarea
                      id="custom-description"
                      value={newCustomService.description}
                      onChange={(e) =>
                        setNewCustomService({
                          ...newCustomService,
                          description: e.target.value,
                        })
                      }
                      placeholder="Detailed description of the service..."
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom-price">Price (£)</Label>
                    <Input
                      id="custom-price"
                      type="number"
                      step="0.01"
                      value={newCustomService.price}
                      onChange={(e) =>
                        setNewCustomService({
                          ...newCustomService,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddCustomService} size="sm">
                      Add to Diagnosis
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCustomForm(false)}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Custom Services List */}
            {customServices.length > 0 && (
              <div className="space-y-2">
                {customServices.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-blue-900">
                        {service.name}
                      </div>
                      <div className="text-sm text-blue-700">
                        {service.description}
                      </div>
                      <div className="text-xs text-blue-600">
                        {service.duration} min • £{service.price}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCustomService(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Services Summary */}
          {allServices.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Selected Services</h3>
              <div className="space-y-2">
                {allServices.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-gray-600">
                        {service.duration} min • £{service.price}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if ('id' in service) {
                          handleRemoveService(service.id);
                        } else {
                          handleRemoveCustomService(index);
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price Summary */}
          {allServices.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Price Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Services Subtotal:</span>
                    <span>£{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Charge:</span>
                    <span>£{serviceCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Subtotal:</span>
                    <span>£{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (20%):</span>
                    <span>£{vat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-green-600 border-t pt-2">
                    <span>Total (inc. VAT):</span>
                    <span>£{totalWithVat.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Diagnosis Notes */}
          <div>
            <Label
              htmlFor="diagnosis-notes"
              className="text-base font-semibold"
            >
              Diagnosis Notes *
            </Label>
            <textarea
              id="diagnosis-notes"
              value={diagnosisNotes}
              onChange={(e) => setDiagnosisNotes(e.target.value)}
              placeholder="Describe your diagnosis findings, condition of parts, and recommendations..."
              className="mt-2 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              rows={4}
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitDiagnosis}
              disabled={
                isSubmitting ||
                allServices.length === 0 ||
                !diagnosisNotes.trim()
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Diagnosis for Approval'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
