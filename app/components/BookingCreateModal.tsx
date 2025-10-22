import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"; // Commented out - using HTML select for time picker
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { addDays, startOfDay, format, isBefore } from "date-fns";
// import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { toast } from "sonner";
import { useGarageStore } from "@/store/garage";
import { useBookingDemo } from "@/hooks/useBookingDemo";
// import { SlotList } from "./SlotList"; // Commented out - no slot selection for now
import { ServiceDropdown } from "./booking/ServiceDropdown";
import { BayDropdown } from "./booking/BayDropdown";
import { TechnicianDropdown } from "./booking/TechnicianDropdown";
import { BookingTimeline } from "./booking/BookingTimeline";
import type { Service } from "@/store/booking";

interface BookingCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated?: () => void;
}

// Update Slot type to match new API schema - COMMENTED OUT FOR NOW
// type SlotService = {
//   service: {
//     id: string;
//     name: string;
//     duration: number;
//   };
//   technician: {
//     id: string;
//     firstName: string;
//     lastName: string;
//     email: string;
//   };
//   startTime: string;
//   endTime: string;
// };

// interface Slot { // Commented out - no slot selection for now
//   bay: {
//     id: string;
//     name: string;
//   };
//   services: SlotService[];
//   date: string;
//   isAvailable: boolean;
// }

// Remove these interfaces as they're now imported from the store

export const BookingCreateModal = ({
  isOpen,
  onClose,
  onBookingCreated,
}: BookingCreateModalProps) => {
  // Get garage from store
  const garage = useGarageStore((state) => state.garage);

  // Get booking store data and actions
  const { bays, technicians, services, getBookingsForBayAndDate } =
    useBookingDemo();

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carYear, setCarYear] = useState("");
  const [carRegistration, setCarRegistration] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  // const [slots, setSlots] = useState<Slot[]>([]); // Commented out - no slot selection for now
  // const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(
  //   null
  // );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Services state
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);

  // New state for bay and technician
  const [selectedBay, setSelectedBay] = useState<string>("");
  const [selectedTechnician, setSelectedTechnician] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Set default date to tomorrow when modal opens
  useEffect(() => {
    if (isOpen) {
      setDate(addDays(startOfDay(new Date()), 1));
      setSelectedBay("");
      setSelectedTechnician("");
    }
  }, [isOpen]);

  // Get existing bookings for the selected bay/date
  const existingBookings =
    selectedBay && date
      ? getBookingsForBayAndDate(selectedBay, format(date, "yyyy-MM-dd"))
      : [];

  // Generate static available slots when all required fields are selected
  useEffect(() => {
    if (
      !selectedServices.length ||
      !date ||
      !selectedBay ||
      !selectedTechnician
    ) {
      // setSlots([]); // Commented out - no slot selection for now
      // setSelectedSlotIndex(null);
      return;
    }

    // Generate static slots for demonstration - COMMENTED OUT FOR NOW
    /*
    const generateStaticSlots = () => {
      const dateStr = format(date, "yyyy-MM-dd");
      const staticSlots: Slot[] = [
        {
          bay: { id: selectedBay, name: `Bay ${selectedBay.split("-")[1]}` },
          services: selectedServices.map((service) => ({
            service: {
              id: service.id,
              name: service.name,
              duration: 30, // Fixed 30 minutes
            },
            technician: {
              id: selectedTechnician,
              firstName:
                technicians.find((t) => t.id === selectedTechnician)
                  ?.firstName || "Unknown",
              lastName:
                technicians.find((t) => t.id === selectedTechnician)
                  ?.lastName || "Technician",
              email: "tech@example.com",
            },
            startTime: `${dateStr}T09:00:00`,
            endTime: `${dateStr}T09:30:00`,
          })),
          date: dateStr,
          isAvailable: true,
        },
        {
          bay: { id: selectedBay, name: `Bay ${selectedBay.split("-")[1]}` },
          services: selectedServices.map((service) => ({
            service: {
              id: service.id,
              name: service.name,
              duration: 30,
            },
            technician: {
              id: selectedTechnician,
              firstName:
                technicians.find((t) => t.id === selectedTechnician)
                  ?.firstName || "Unknown",
              lastName:
                technicians.find((t) => t.id === selectedTechnician)
                  ?.lastName || "Technician",
              email: "tech@example.com",
            },
            startTime: `${dateStr}T10:00:00`,
            endTime: `${dateStr}T10:30:00`,
          })),
          date: dateStr,
          isAvailable: true,
        },
        {
          bay: { id: selectedBay, name: `Bay ${selectedBay.split("-")[1]}` },
          services: selectedServices.map((service) => ({
            service: {
              id: service.id,
              name: service.name,
              duration: 30,
            },
            technician: {
              id: selectedTechnician,
              firstName:
                technicians.find((t) => t.id === selectedTechnician)
                  ?.firstName || "Unknown",
              lastName:
                technicians.find((t) => t.id === selectedTechnician)
                  ?.lastName || "Technician",
              email: "tech@example.com",
            },
            startTime: `${dateStr}T11:00:00`,
            endTime: `${dateStr}T11:30:00`,
          })),
          date: dateStr,
          isAvailable: true,
        },
      ];
      return staticSlots;
    };
    */

    // const staticSlots = generateStaticSlots(); // Commented out - no slot selection for now
    // setSlots(staticSlots);
    // setSelectedSlotIndex(null);
  }, [selectedServices, date, selectedBay, selectedTechnician, technicians]);

  // API functions removed - now using Zustand store

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
      selectedBay !== "" &&
      selectedTechnician !== "" &&
      date !== undefined &&
      selectedTime !== ""
      // selectedSlotIndex !== null // Commented out - no slot selection for now
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
    setSelectedTime("");
    setNotes("");
    // setSlots([]); // Commented out - no slot selection for now
    // setSelectedSlotIndex(null);
    setSelectedServices([]);
    setSelectedBay("");
    setSelectedTechnician("");
    setIsDatePopoverOpen(false);
  };

  // For now, just close on submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Commented out slot validation for now
    // if (selectedSlotIndex === null || !slots[selectedSlotIndex]) {
    //   toast.error("Could not find selected slot details.");
    //   return;
    // }
    // const slotObj = slots[selectedSlotIndex];

    try {
      // Create booking data in the backend API format
      const bookingData = {
        date: date ? format(date, "yyyy-MM-dd") : "",
        customer: {
          firstName: customerName.split(" ")[0] || customerName,
          lastName: customerName.split(" ").slice(1).join(" ") || "",
          email: customerEmail,
          phone: customerPhone,
        },
        vehicle: {
          make: carMake,
          model: carModel,
          year: parseInt(carYear),
          licensePlate: carRegistration,
          vin: "", // Optional field
        },
        services: selectedServices.map((service) => ({
          serviceId: service.id,
          technicianId: selectedTechnician,
          bayId: selectedBay,
          startTime: selectedTime
            ? `${date ? format(date, "yyyy-MM-dd") : ""}T${selectedTime}:00`
            : "",
          endTime: selectedTime
            ? `${date ? format(date, "yyyy-MM-dd") : ""}T${selectedTime}:00`
            : "", // Will be calculated as +30 minutes
          status: "pending",
          notes: notes || "",
        })),
        notes: notes,
      };

      console.log("Creating booking with data:", bookingData);

      setIsSubmitting(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, just show success
      toast.success("Booking created successfully! (Demo mode - no API call)");
      resetForm();
      onBookingCreated?.();
      onClose();

      setIsSubmitting(false);
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("An error occurred. Please try again later.");
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
    selectedTime ||
    selectedBay ||
    selectedTechnician ||
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
        <DialogContent className="max-w-7xl w-full max-h-[90vh] flex flex-col px-10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Create Booking
            </DialogTitle>
            <DialogDescription>
              Create a new booking for a customer. Fill in all required details
              and select an available time slot.
            </DialogDescription>
          </DialogHeader>
          <hr />
          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="grid grid-cols-[1fr_1fr_1.2fr] gap-4 flex-1 overflow-y-auto min-h-0">
              {/* Column 1: Customer & Car Details */}
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

              {/* Column 2: Service, Bay, Technician, Date */}
              <div className="space-y-6">
                {/* Service Selection */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Services</h3>
                  <ServiceDropdown
                    selectedServices={selectedServices}
                    onServicesChange={setSelectedServices}
                    services={services}
                    placeholder="Select services"
                  />
                </div>

                {/* Bay Selection */}
                <BayDropdown
                  value={selectedBay}
                  onValueChange={setSelectedBay}
                  bays={bays}
                />

                {/* Technician Selection */}
                <TechnicianDropdown
                  value={selectedTechnician}
                  onValueChange={setSelectedTechnician}
                  technicians={technicians}
                />

                {/* Date and Time Selection */}
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
                        Preferred Time <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full bg-white border rounded-md px-3 py-2 shadow-xs transition outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] min-h-[48px] text-sm"
                      >
                        <option value="">Select time</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="10:30">10:30 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="11:30">11:30 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="12:30">12:30 PM</option>
                        <option value="13:00">01:00 PM</option>
                        <option value="13:30">01:30 PM</option>
                        <option value="14:00">02:00 PM</option>
                        <option value="14:30">02:30 PM</option>
                        <option value="15:00">03:00 PM</option>
                        <option value="15:30">03:30 PM</option>
                        <option value="16:00">04:00 PM</option>
                        <option value="16:30">04:30 PM</option>
                        <option value="17:00">05:00 PM</option>
                      </select>
                    </div>
                  </div>
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
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] min-h-[48px]"
                    placeholder="Additional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Column 3: Timeline View */}
              <div className="border-l pl-4 flex flex-col min-h-0">
                <div className="flex flex-col h-full">
                  <h3 className="text-sm font-semibold mb-2">Schedule View</h3>
                  {garage && (
                    <BookingTimeline
                      bayId={selectedBay}
                      technicianId={selectedTechnician}
                      date={date || new Date()}
                      existingBookings={existingBookings}
                      businessHours={garage.businessHours || []}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Available Slots Section - COMMENTED OUT FOR NOW */}
            {/* {slots.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="text-sm font-semibold mb-2">Available Slots</h3>
                <SlotList
                  slots={slots}
                  selectedSlotIndex={selectedSlotIndex}
                  setSelectedSlotIndex={setSelectedSlotIndex}
                />
                {selectedSlotIndex === null && slots.length > 0 && (
                  <div className="text-xs text-red-500 mt-1">
                    Please select a slot to continue.
                  </div>
                )}
              </div>
            )} */}

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
