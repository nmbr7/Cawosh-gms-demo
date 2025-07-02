import React from "react";

// New Slot types
export type SlotService = {
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

export interface Slot {
  bay: {
    id: string;
    name: string;
  };
  services: SlotService[];
  date: string;
  isAvailable: boolean;
}

interface SlotListProps {
  slots: Slot[];
  selectedSlot: string;
  setSelectedSlot: (slotValue: string) => void;
}

export const SlotList: React.FC<SlotListProps> = ({
  slots,
  selectedSlot,
  setSelectedSlot,
}) => {
  if (slots.length === 0) {
    return (
      <div className="text-xs text-gray-500">
        No slots available. Please select a service and date.
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {slots.map((slot) => (
        <div key={slot.bay.id + slot.date} className="flex flex-col gap-1">
          <div className="font-semibold text-xs mb-1">{slot.bay.name}</div>
          {slot.services.map((svc) => {
            const slotValue = `${slot.bay.id}|${svc.service.id}|${svc.startTime}-${svc.endTime}`;
            return (
              <label
                key={slotValue}
                className={`cursor-pointer px-3 py-2 border rounded-md text-xs min-w-[200px] ${
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
                  disabled={!slot.isAvailable}
                />
                <div className="font-semibold">
                  {svc.startTime} - {svc.endTime}
                </div>
                <div className="text-xs">Service: {svc.service.name}</div>
                <div className="text-xs">
                  Tech: {svc.technician.firstName} {svc.technician.lastName}
                </div>
              </label>
            );
          })}
        </div>
      ))}
    </div>
  );
};
