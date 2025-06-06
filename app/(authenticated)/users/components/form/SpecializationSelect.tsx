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

const SPECIALIZATIONS = [
  "Engine Diagnostics",
  "Transmission Repair",
  "Brake Systems",
  "Suspension & Steering",
  "Electrical Systems",
  "Air Conditioning",
  "Exhaust Systems",
  "Body & Paint",
  "Wheel Alignment",
  "Oil & Fluid Services",
  "Battery Services",
  "Tire Services",
  "General Maintenance",
  "Performance Tuning",
  "Hybrid/Electric Vehicles",
];

interface SpecializationSelectProps {
  selectedSpecializations: string[];
  onSpecializationsChange: (value: string[]) => void;
  disabled?: boolean;
}

export function SpecializationSelect({
  selectedSpecializations,
  onSpecializationsChange,
  disabled = false,
}: SpecializationSelectProps) {
  const [specializationInput, setSpecializationInput] = useState("");
  const [isOpenSpecialization, setIsOpenSpecialization] = useState(false);

  const handleSpecializationSelect = (value: string) => {
    if (!selectedSpecializations.includes(value)) {
      onSpecializationsChange([...selectedSpecializations, value]);
    }
    setSpecializationInput("");
    setIsOpenSpecialization(false);
  };

  const handleSpecializationRemove = (value: string) => {
    onSpecializationsChange(selectedSpecializations.filter((s) => s !== value));
  };

  const filteredSpecializations = SPECIALIZATIONS.filter(
    (spec) =>
      spec.toLowerCase().includes(specializationInput.toLowerCase()) &&
      !selectedSpecializations.includes(spec)
  );

  return (
    <div className="space-y-2">
      <Label>Specializations</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedSpecializations.map((spec) => (
          <Badge
            key={spec}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {spec}
            <button
              type="button"
              onClick={() => handleSpecializationRemove(spec)}
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
                  key={spec}
                  onSelect={() => handleSpecializationSelect(spec)}
                >
                  {spec}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
