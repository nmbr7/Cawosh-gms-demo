import React, { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Service } from "@/store/booking";

interface ServiceDropdownProps {
  selectedServices: Service[];
  onServicesChange: (services: Service[]) => void;
  services: Service[];
  placeholder?: string;
  disabled?: boolean;
}

export const ServiceDropdown: React.FC<ServiceDropdownProps> = ({
  selectedServices,
  onServicesChange,
  services,
  placeholder = "Select services",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (service: Service) => {
    const isSelected = selectedServices.some((s) => s.id === service.id);

    if (isSelected) {
      // Remove service
      onServicesChange(selectedServices.filter((s) => s.id !== service.id));
    } else {
      // Add service
      onServicesChange([...selectedServices, service]);
    }
  };

  const handleRemove = (serviceId: string) => {
    onServicesChange(selectedServices.filter((s) => s.id !== serviceId));
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Services <span className="text-red-500">*</span>
      </label>

      {/* Selected Services Display */}
      {selectedServices.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedServices.map((service) => (
            <div
              key={service.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
            >
              <span>{service.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(service.id)}
                className="hover:bg-blue-200 rounded-full p-0.5"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between min-h-[48px]"
            disabled={disabled}
          >
            {selectedServices.length === 0
              ? placeholder
              : `${selectedServices.length} service(s) selected`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search services..." />
            <CommandList>
              <CommandEmpty>No services found.</CommandEmpty>
              <CommandGroup>
                {services.map((service) => {
                  const isSelected = selectedServices.some(
                    (s) => s.id === service.id
                  );
                  return (
                    <CommandItem
                      key={service.id}
                      value={service.name}
                      onSelect={() => handleSelect(service)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-xs text-gray-500">
                            £{service.price} • {service.duration} min
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedServices.length === 0 && (
        <div className="text-xs text-red-500 mt-1">
          Please select at least one service.
        </div>
      )}
    </div>
  );
};
