import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ISkillRef {
  _id?: string;
  code: string;
  displayName: string;
}

interface SpecializationSelectProps {
  selectedSpecializations: ISkillRef[];
  onSpecializationsChange: (value: ISkillRef[]) => void;
  disabled?: boolean;
}

export function SpecializationSelect({
  selectedSpecializations,
  onSpecializationsChange,
  disabled = false,
}: SpecializationSelectProps) {
  const [specializationInput, setSpecializationInput] = useState("");
  const [isOpenSpecialization, setIsOpenSpecialization] = useState(false);

  const SPECIALIZATIONS: ISkillRef[] = [
    { code: "engine_diagnostics", displayName: "Engine Diagnostics" },
    { code: "transmission_repair", displayName: "Transmission Repair" },
    { code: "brake_systems", displayName: "Brake Systems" },
    { code: "suspension_steering", displayName: "Suspension & Steering" },
    { code: "electrical_systems", displayName: "Electrical Systems" },
    { code: "air_conditioning", displayName: "Air Conditioning" },
    { code: "exhaust_systems", displayName: "Exhaust Systems" },
    { code: "body_paint", displayName: "Body & Paint" },
    { code: "wheel_alignment", displayName: "Wheel Alignment" },
    { code: "oil_fluid_services", displayName: "Oil & Fluid Services" },
    { code: "battery_services", displayName: "Battery Services" },
    { code: "tire_services", displayName: "Tire Services" },
    { code: "general_maintenance", displayName: "General Maintenance" },
    { code: "performance_tuning", displayName: "Performance Tuning" },
    {
      code: "hybrid_electric_vehicles",
      displayName: "Hybrid/Electric Vehicles",
    },
  ];

  const handleSpecializationSelect = (value: ISkillRef) => {
    if (!selectedSpecializations.some((s) => s.code === value.code)) {
      onSpecializationsChange([...selectedSpecializations, value]);
    }
    setSpecializationInput("");
    setIsOpenSpecialization(false);
  };

  const handleSpecializationRemove = (code: string) => {
    onSpecializationsChange(
      selectedSpecializations.filter((s) => s.code !== code)
    );
  };

  const filteredSpecializations = SPECIALIZATIONS.filter(
    (spec) =>
      spec.displayName
        .toLowerCase()
        .includes(specializationInput.toLowerCase()) &&
      !selectedSpecializations.some((s) => s.code === spec.code)
  );

  return (
    <div className="space-y-2">
      <Label>Specializations</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedSpecializations.map((spec) => (
          <Badge
            key={spec.code}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {spec.displayName}
            <button
              type="button"
              onClick={() => handleSpecializationRemove(spec.code)}
              className="ml-1 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Popover
        open={isOpenSpecialization}
        onOpenChange={setIsOpenSpecialization}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start"
            disabled={disabled}
          >
            Add specialization
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput
              placeholder="Search specializations..."
              value={specializationInput}
              onValueChange={setSpecializationInput}
            />
            <CommandEmpty>No specializations found.</CommandEmpty>
            <CommandGroup>
              {filteredSpecializations.map((spec) => (
                <CommandItem
                  key={spec.code}
                  onSelect={() => handleSpecializationSelect(spec)}
                >
                  {spec.displayName}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
