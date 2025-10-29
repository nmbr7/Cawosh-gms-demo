import React, { useState, useEffect } from 'react';

export interface Service {
  id: string;
  isActive: boolean;
  customPrice?: number;
  customDuration?: number;
  name: string;
  description?: string;
  category?: string;
  duration?: number;
  price?: number;
  currency?: string;
  currencySymbol?: string;
  isActiveMaster?: boolean;
}

// Types for API normalization
interface RawService {
  _doc?: {
    serviceId?: string;
    isActive?: boolean;
    customPrice?: number;
    customDuration?: number;
    name?: string;
    description?: string;
  };
  serviceId?: string;
  isActive?: boolean;
  customPrice?: number;
  customDuration?: number;
  name: string;
  description?: string;
  // add other fields as needed
}

interface ServiceApiResponse {
  data: RawService[];
}

// Helper to normalize API response to flat Service[]
export function normalizeServiceApiResponse(
  apiData: ServiceApiResponse,
): Service[] {
  if (!apiData || !Array.isArray(apiData.data)) return [];
  return apiData.data.map((item) => {
    return {
      id: item._doc?.serviceId || item.serviceId || '',
      isActive: item._doc?.isActive ?? item.isActive ?? false,
      customPrice: item._doc?.customPrice ?? item.customPrice,
      customDuration: item._doc?.customDuration ?? item.customDuration,
      name: item.name || item._doc?.name || '',
      description: item.description || item._doc?.description || '',
      // Optionally add more fields as needed
    };
  });
}

interface ServiceMultiSelectProps {
  garageId: string;
  selectedServices: Service[];
  onChange: (services: Service[]) => void;
  placeholder?: string;
}

export const ServiceMultiSelect: React.FC<ServiceMultiSelectProps> = ({
  garageId,
  selectedServices,
  onChange,
  placeholder = 'Select services...',
}) => {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!input) {
      setOptions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(
        `/api/garages/${garageId}/services/search?query=${encodeURIComponent(
          input,
        )}`,
      );
      const data = await res.json();
      setOptions(normalizeServiceApiResponse(data));
      setLoading(false);
    }, 300); // debounce

    return () => clearTimeout(timeout);
  }, [input, garageId]);

  const filtered = options.filter(
    (s) => !selectedServices.some((sel) => sel.id === s.id),
  );

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="border rounded px-2 py-1 w-full"
      />
      {input && (
        <div className="border rounded bg-white shadow mt-1 max-h-40 overflow-y-auto z-10 relative">
          {loading && (
            <div className="px-2 py-1 text-xs text-gray-400">Loading...</div>
          )}
          {filtered.map((s) => (
            <div
              key={s.id}
              className="px-2 py-1 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                onChange([...selectedServices, s]);
                setInput('');
              }}
            >
              {s.name}
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedServices.map((s) => (
          <span
            key={s.id}
            className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center"
          >
            {s.name}
            <button
              className="ml-1 text-red-500"
              onClick={() =>
                onChange(selectedServices.filter((sel) => sel.id !== s.id))
              }
              type="button"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};
