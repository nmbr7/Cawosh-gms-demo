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
      {slots.map((slot) => {
        // Combine all services in this slot into a single block
        if (!slot.services.length) return null;
        // Find earliest start time and latest end time
        const sortedSvcs = [...slot.services].sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        );
        const startTime = sortedSvcs[0].startTime;
        const endTime = sortedSvcs[sortedSvcs.length - 1].endTime;
        // Combine all service names
        const serviceNames = slot.services
          .map((s) => s.service.name)
          .join(", ");
        // Combine all unique technicians
        const techs = Array.from(
          new Map(
            slot.services.map((s) => [
              s.technician.id,
              `${s.technician.firstName} ${s.technician.lastName}`,
            ])
          ).values()
        ).join(", ");
        // Compose a slotValue that encodes all service ids for this block
        const slotValue = `${slot.bay.id}|${slot.services
          .map((s) => s.service.id)
          .join(",")}|${startTime}-${endTime}`;
        return (
          <div key={slot.bay.id + slot.date} className="flex flex-col gap-1">
            <div className="font-semibold text-xs mb-1">{slot.bay.name}</div>
            <label
              key={slotValue}
              className={`cursor-pointer px-3 py-2 border rounded-md text-xs min-w-[220px] ${
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
                {startTime} - {endTime}
              </div>
              <div className="text-xs">Services: {serviceNames}</div>
              <div className="text-xs">Techs: {techs}</div>
            </label>
          </div>
        );
      })}
    </div>
  );
};
