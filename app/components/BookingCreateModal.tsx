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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { addDays, startOfDay, format, isBefore } from "date-fns";
import { Slot } from "../models/slot";

interface BookingCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data for services and bays
const mockServices = [
  { id: "1", name: "Oil Change" },
  { id: "2", name: "Tire Rotation" },
  { id: "3", name: "Brake Inspection" },
];
const mockBays = [1, 2, 3];

export const BookingCreateModal: React.FC<BookingCreateModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carYear, setCarYear] = useState("");
  const [carRegistration, setCarRegistration] = useState("");
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [bay, setBay] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  // Reset all form fields
  const resetForm = () => {
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCarMake("");
    setCarModel("");
    setCarYear("");
    setCarRegistration("");
    setServiceId(null);
    setDate(undefined);
    setBay("");
    setNotes("");
    setSlots([]);
    setSelectedSlot("");
  };

  // Set default date to tomorrow and bay to 1 when modal opens
  useEffect(() => {
    if (isOpen) {
      setDate(addDays(startOfDay(new Date()), 1));
      setBay("");
    }
  }, [isOpen]);

  // Fetch slots when serviceId, date, or bay changes
  useEffect(() => {
    if (!bay) {
      setSlots([]);
      setSelectedSlot("");
      return;
    }
    const fetchSlots = async () => {
      if (!serviceId || !date || !bay) {
        setSlots([]);
        setSelectedSlot("");
        return;
      }
      const dateStr = format(date, "yyyy-MM-dd");
      const res = await fetch(
        `/api/bookings/slots?serviceId=${serviceId}&date=${dateStr}&bay=${bay}`
      );
      console.log(res);
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots || []);
        setSelectedSlot("");
      } else {
        setSlots([]);
        setSelectedSlot("");
      }
    };
    fetchSlots();
  }, [serviceId, date, bay]);

  // For now, just close on submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    onClose();
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
    serviceId ||
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
                        Name
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
                        Email
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
                        Phone
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
                        Make
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
                        Model
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
                        Year
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
                        Registration
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
                  <h3 className="text-sm font-semibold mb-2">Service</h3>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Service
                  </label>
                  <Select
                    value={serviceId ?? ""}
                    onValueChange={setServiceId}
                    required
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {mockServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date & Status */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">
                    Booking Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Preferred Date
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
                            mode="single"
                            selected={date}
                            onSelect={(d) => {
                              setDate(d);
                              setIsDatePopoverOpen(false);
                            }}
                            className="rounded-md"
                            disabled={(d) =>
                              isBefore(d, startOfDay(new Date()))
                            }
                            modifiers={{
                              today: (d) =>
                                d.getTime() ===
                                startOfDay(new Date()).getTime(),
                            }}
                            modifiersStyles={{
                              today: {
                                fontWeight: "bold",
                                border: "2px solid #3b82f6",
                                borderRadius: "50%",
                              },
                            }}
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
                        This is an offline booking that will be scheduled by the
                        garage staff based on technician availability
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bay Selection */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Bay</h3>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Bay
                  </label>
                  <Select value={bay} onValueChange={(v) => setBay(v)} required>
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

                {/* Slot Selection */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">
                    Available Slots
                  </h3>
                  {!bay ? (
                    <div className="text-xs text-gray-500">
                      Please select a bay to see available slots.
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="text-xs text-gray-500">
                      No slots available. Please select a service, date, and
                      bay.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {slots.map((slot) => {
                        const slotValue = `${slot.start}-${slot.end}`;
                        return (
                          <label
                            key={slotValue}
                            className={`cursor-pointer px-3 py-2 border rounded-md text-xs ${
                              selectedSlot === slotValue
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-white text-gray-700 border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="slot"
                              value={slotValue}
                              checked={selectedSlot === slotValue}
                              onChange={() => setSelectedSlot(slotValue)}
                              className="hidden"
                              disabled={!bay}
                            />
                            {slot.start} - {slot.end}
                          </label>
                        );
                      })}
                    </div>
                  )}
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
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-500 text-white hover:bg-blue-600"
                disabled={!selectedSlot}
              >
                Create Booking
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
