import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { addDays, startOfDay, format, isBefore } from "date-fns";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { toast } from "sonner";
import { useGarageStore } from "@/store/garage";
import { SlotList } from "./SlotList";
import { ServiceMultiSelect, Service } from "./ServiceMultiSelect";

interface BookingCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated?: () => void;
}

// Update Slot type to match new API schema
type SlotService = {
  service: {
    id: string;
    name: string;
    duration: number;
  };
  technician: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  startTime: string;
  endTime: string;
};

interface Slot {
  bay: {
    id: string;
    name: string;
  };
  services: SlotService[];
  date: string;
  isAvailable: boolean;
}

export const BookingCreateModal: React.FC<BookingCreateModalProps> = ({
  isOpen,
  onClose,
  onBookingCreated,
}) => {
  // Get garage from store
  const garage = useGarageStore((state) => state.garage);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carYear, setCarYear] = useState("");
  const [carRegistration, setCarRegistration] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [bay, setBay] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Services state
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);

  // Set default date to tomorrow and bay to 1 when modal opens
  useEffect(() => {
    if (isOpen) {
      setDate(addDays(startOfDay(new Date()), 1));
      setBay("");
    }
  }, [isOpen]);

  // Only fetch slots when both a service and a date are selected
  useEffect(() => {
    if (!selectedServices.length || !date || !garage) {
      setSlots([]);
      setSelectedSlot("");
      return;
    }

    const fetchSlots = async () => {
      try {
        const dateStr = format(date, "yyyy-MM-dd");
        const res = await fetchWithAuth(
          `/api/garages/${
            garage.id
          }/slots?date=${dateStr}&serviceIds=${selectedServices
            .map((s) => s.id)
            .join(",")}`
        );
        if (res.ok) {
          const data = await res.json();
          setSlots(data.data || []);
          setSelectedSlot("");
        } else {
          setSlots([]);
          setSelectedSlot("");
        }
      } catch {
        setSlots([]);
        setSelectedSlot("");
      }
    };

    fetchSlots();
  }, [selectedServices, date, garage]);

  // Add validation function
  const isFormValid = () => {
    return (
      customerName.trim() !== "" &&
      customerEmail.trim() !== "" &&
      customerPhone.trim() !== "" &&
      carMake.trim() !== "" &&
      carModel.trim() !== "" &&
      carYear.trim() !== "" &&
      carRegistration.trim() !== "" &&
      selectedServices.length > 0 &&
      date !== undefined &&
      selectedSlot !== ""
    );
  };

  // Reset all form fields
  const resetForm = () => {
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCarMake("");
    setCarModel("");
    setCarYear("");
    setCarRegistration("");
    setDate(undefined);
    setBay("");
    setNotes("");
    setSlots([]);
    setSelectedSlot("");
    setSelectedServices([]);
  };

  // For now, just close on submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    // Parse selectedSlot: bayId|serviceId|startTime-endTime
    const [bayId, , timeRange] = selectedSlot.split("|");
    const [startTime, endTime] = timeRange.split("-");

    try {
      // Create booking data in the new MongoDB format
      const bookingData = {
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        vehicle: {
          make: carMake,
          model: carModel,
          year: parseInt(carYear),
          license: carRegistration,
          vin: "", // Optional field
        },
        services: selectedServices.map((service) => ({
          serviceId: service.id,
          name: service.name,
          description: service.description,
          duration: service.duration,
          price: service.price,
          currency: service.currency,
          currencySymbol: service.currencySymbol,
          status: "pending",
          startTime: date
            ? new Date(
                `${format(date, "yyyy-MM-dd")}T${startTime}`
              ).toISOString()
            : "",
          endTime: date
            ? new Date(`${format(date, "yyyy-MM-dd")}T${endTime}`).toISOString()
            : "",
        })),
        bookingDate: date
          ? new Date(`${format(date, "yyyy-MM-dd")}T${startTime}`).toISOString()
          : "",
        totalDuration: selectedServices.reduce(
          (total, service) => total + (service.duration ?? 0),
          0
        ),
        totalPrice: selectedServices.reduce(
          (total, service) => total + (service.price ?? 0),
          0
        ),
        status: "pending",
        assignedStaff: "", // Will be assigned by backend
        assignedBay: bayId,
        garage_id: garage!.id,
        notes: notes,
      };

      setIsSubmitting(true);
      const res = await fetchWithAuth("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (res.ok) {
        toast.success("Booking created successfully!");
        resetForm();
        onBookingCreated?.();
        onClose();
      } else {
        const errorData = await res.json();
        toast.error(
          errorData.error || "Failed to create booking. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Track if form is dirty
  const isDirty =
    customerName ||
    customerEmail ||
    customerPhone ||
    carMake ||
    carModel ||
    carYear ||
    carRegistration ||
    selectedServices.length ||
    date ||
    bay ||
    notes;

  const handleCancel = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Create Booking
            </DialogTitle>
          </DialogHeader>
          <hr />
          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="grid grid-cols-2 gap-6 flex-1 overflow-y-auto pr-4">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Customer Details */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">
                    Customer Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        required
                        placeholder="Full Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        required
                        type="email"
                        placeholder="Email Address"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <Input
                        required
                        placeholder="Phone Number"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Car Details */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Car Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Make <span className="text-red-500">*</span>
                      </label>
                      <Input
                        required
                        placeholder="Car Make"
                        value={carMake}
                        onChange={(e) => setCarMake(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Model <span className="text-red-500">*</span>
                      </label>
                      <Input
                        required
                        placeholder="Car Model"
                        value={carModel}
                        onChange={(e) => setCarModel(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Year <span className="text-red-500">*</span>
                      </label>
                      <Input
                        required
                        placeholder="Year"
                        value={carYear}
                        onChange={(e) => setCarYear(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Registration <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Registration Number"
                        value={carRegistration}
                        onChange={(e) => setCarRegistration(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Service Selection */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Services</h3>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Services <span className="text-red-500">*</span>
                  </label>
                  <ServiceMultiSelect
                    garageId={garage?.id || ""}
                    selectedServices={selectedServices}
                    onChange={setSelectedServices}
                    placeholder="Select services"
                  />
                  {selectedServices.length === 0 && (
                    <div className="text-xs text-red-500 mt-1">
                      Please select at least one service.
                    </div>
                  )}
                </div>

                {/* Date & Status */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">
                    Booking Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Preferred Date <span className="text-red-500">*</span>
                      </label>
                      <Popover
                        open={isDatePopoverOpen}
                        onOpenChange={setIsDatePopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={
                              "w-full text-left bg-white border rounded-md px-3 py-2 shadow-xs transition outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] min-h-[48px] text-sm" +
                              (!date ? " text-gray-400" : "")
                            }
                            onClick={() => setIsDatePopoverOpen(true)}
                          >
                            {date ? format(date, "d MMM yyyy") : "Select date"}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            selected={date}
                            onSelect={(d) => {
                              setDate(d);
                              setIsDatePopoverOpen(false);
                            }}
                            className="rounded-md"
                            disabled={(d) =>
                              isBefore(d, startOfDay(new Date()))
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Booking Type
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md border">
                        <span className="text-sm font-medium">
                          Offline Booking
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        For walk-ins. Slot is auto-assigned based on preferred
                        day and technician availability
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bay Selection */}
                {/*
                <div>
                  <h3 className="text-sm font-semibold mb-2">Bay</h3>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Bay
                  </label>
                  <Select value={bay} onValueChange={(v) => setBay(v)}>
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select bay" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {mockBays.map((b) => (
                        <SelectItem key={b} value={b.toString()}>
                          Bay {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                */}

                {/* Slot Selection */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">
                    Available Slots
                  </h3>
                  <SlotList
                    slots={slots}
                    selectedSlot={selectedSlot}
                    setSelectedSlot={setSelectedSlot}
                  />
                  {!selectedSlot && slots.length > 0 && (
                    <div className="text-xs text-red-500 mt-1">
                      Please select a slot to continue.
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">
                    Notes (optional)
                  </h3>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] min-h-[48px] text-sm"
                    placeholder="Additional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2 mt-6 pt-4 border-t bg-white">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-500 text-white hover:bg-blue-600"
                disabled={!isFormValid() || isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Booking"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Discard confirmation modal */}
      <Dialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Discard Booking?</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-gray-700">
            Are you sure you want to discard this booking? All entered
            information will be lost.
          </div>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDiscardConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                setShowDiscardConfirm(false);
                resetForm();
                onClose();
              }}
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
