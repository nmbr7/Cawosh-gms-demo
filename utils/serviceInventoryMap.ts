export interface ServiceInventoryItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
}

export interface ServiceInventoryMap {
  serviceId: string;
  serviceName: string;
  items: ServiceInventoryItem[];
}

// Configuration mapping services to required inventory items
export const serviceInventoryMappings: ServiceInventoryMap[] = [
  // Oil Change Services
  {
    serviceId: 'service-1',
    serviceName: 'Oil Change',
    items: [
      {
        // matches inventory id for Oil Filter - Universal
        itemId: '4',
        itemName: 'Oil Filter - Universal',
        quantity: 1,
        unit: 'pc',
      },
      {
        // matches inventory id for Engine Oil 5W-30 (1L)
        itemId: '2',
        itemName: 'Engine Oil 5W-30 (1L)',
        quantity: 5,
        unit: 'bottle',
      },
    ],
  },
  {
    serviceId: 'service-11',
    serviceName: 'Oil Change (Full Synthetic 5W-30)',
    items: [
      {
        itemId: '4',
        itemName: 'Oil Filter - Universal',
        quantity: 1,
        unit: 'pc',
      },
      {
        // still using same 5W-30 bottle for demo data
        itemId: '2',
        itemName: 'Engine Oil 5W-30 (1L)',
        quantity: 5,
        unit: 'bottle',
      },
    ],
  },
  {
    serviceId: 'service-12',
    serviceName: 'Oil Change (Conventional 10W-30)',
    items: [
      {
        itemId: '4',
        itemName: 'Oil Filter - Universal',
        quantity: 1,
        unit: 'pc',
      },
      {
        // demo inventory has only 5W-30; use same stock item
        itemId: '2',
        itemName: 'Engine Oil 5W-30 (1L)',
        quantity: 5,
        unit: 'bottle',
      },
    ],
  },
  {
    serviceId: 'service-13',
    serviceName: 'Oil Filter Replacement',
    items: [
      {
        itemId: '4',
        itemName: 'Oil Filter - Universal',
        quantity: 1,
        unit: 'pc',
      },
    ],
  },

  // Air Filter Services
  {
    serviceId: 'service-14',
    serviceName: 'Cabin Air Filter Replacement',
    items: [
      {
        itemId: 'cabin-air-filter-001',
        itemName: 'Cabin Air Filter',
        quantity: 1,
        unit: 'pc',
      },
    ],
  },
  {
    serviceId: 'service-25',
    serviceName: 'Air Filter Replacement',
    items: [
      {
        // matches inventory id for Air Filter - Standard
        itemId: '3',
        itemName: 'Air Filter - Standard',
        quantity: 1,
        unit: 'pc',
      },
    ],
  },

  // Brake Services
  {
    serviceId: 'service-18',
    serviceName: 'Front Brake Pads Replacement',
    items: [
      {
        itemId: '1',
        itemName: 'Brake Pads - Front',
        quantity: 1,
        unit: 'pair',
      },
    ],
  },
  {
    serviceId: 'service-19',
    serviceName: 'Rear Brake Pads Replacement',
    items: [
      {
        itemId: 'brake-pads-rear-001',
        itemName: 'Rear Brake Pads',
        quantity: 1,
        unit: 'set',
      },
      {
        itemId: 'brake-fluid-001',
        itemName: 'Brake Fluid',
        quantity: 0.5,
        unit: 'litre',
      },
    ],
  },
  {
    serviceId: 'service-20',
    serviceName: 'Front Brake Rotors Replacement',
    items: [
      {
        itemId: 'brake-rotors-front-001',
        itemName: 'Front Brake Rotors',
        quantity: 2,
        unit: 'pc',
      },
      {
        itemId: 'brake-pads-front-001',
        itemName: 'Front Brake Pads',
        quantity: 1,
        unit: 'set',
      },
    ],
  },
  {
    serviceId: 'service-17',
    serviceName: 'Brake Fluid Flush',
    items: [
      {
        itemId: 'brake-fluid-001',
        itemName: 'Brake Fluid',
        quantity: 1,
        unit: 'litre',
      },
    ],
  },

  // Battery Services
  {
    serviceId: 'service-21',
    serviceName: 'Battery Replacement',
    items: [
      {
        itemId: '5',
        itemName: 'Battery 12V 60Ah',
        quantity: 1,
        unit: 'pc',
      },
    ],
  },

  // Spark Plugs
  {
    serviceId: 'service-22',
    serviceName: 'Spark Plugs Replacement (4-cylinder)',
    items: [
      {
        // matches inventory id for Spark Plug Set (4 pcs)
        itemId: '8',
        itemName: 'Spark Plug Set (4 pcs)',
        quantity: 1,
        unit: 'box',
      },
    ],
  },
  {
    serviceId: 'service-23',
    serviceName: 'Spark Plugs Replacement (6-cylinder)',
    items: [
      {
        itemId: 'spark-plugs-6cyl-001',
        itemName: 'Spark Plugs (6-cylinder)',
        quantity: 6,
        unit: 'pc',
      },
    ],
  },

  // Wiper Blades
  {
    serviceId: 'service-24',
    serviceName: 'Wiper Blades Replacement',
    items: [
      {
        itemId: '6',
        itemName: 'Wiper Blades (22 inch)',
        quantity: 1,
        unit: 'pair',
      },
    ],
  },

  // Headlight Bulb
  {
    serviceId: 'service-25',
    serviceName: 'Headlight Bulb Replacement',
    items: [
      {
        itemId: '10',
        itemName: 'Headlight Bulb H7',
        quantity: 1,
        unit: 'pc',
      },
    ],
  },

  // Serpentine Belt
  {
    serviceId: 'service-26',
    serviceName: 'Serpentine Belt Replacement',
    items: [
      {
        itemId: 'serpentine-belt-001',
        itemName: 'Serpentine Belt',
        quantity: 1,
        unit: 'pc',
      },
    ],
  },

  // Coolant Services
  {
    serviceId: 'service-15',
    serviceName: 'Coolant Flush',
    items: [
      {
        itemId: 'coolant-001',
        itemName: 'Engine Coolant',
        quantity: 5,
        unit: 'litre',
      },
    ],
  },

  // Transmission Fluid
  {
    serviceId: 'service-16',
    serviceName: 'Transmission Fluid Change',
    items: [
      {
        itemId: 'transmission-fluid-001',
        itemName: 'Transmission Fluid',
        quantity: 4,
        unit: 'litre',
      },
    ],
  },

  // Cleaning Services (minimal inventory)
  {
    serviceId: 'service-27',
    serviceName: 'Engine Bay Cleaning',
    items: [
      {
        itemId: 'degreaser-001',
        itemName: 'Engine Degreaser',
        quantity: 0.5,
        unit: 'litre',
      },
    ],
  },
  {
    serviceId: 'service-28',
    serviceName: 'Throttle Body Cleaning',
    items: [
      {
        itemId: 'throttle-cleaner-001',
        itemName: 'Throttle Body Cleaner',
        quantity: 0.25,
        unit: 'litre',
      },
    ],
  },
  {
    serviceId: 'service-29',
    serviceName: 'Fuel Injection System Cleaning',
    items: [
      {
        itemId: 'fuel-injector-cleaner-001',
        itemName: 'Fuel Injector Cleaner',
        quantity: 0.5,
        unit: 'litre',
      },
    ],
  },
  {
    serviceId: 'service-30',
    serviceName: 'AC System Cleaning',
    items: [
      {
        itemId: 'ac-cleaner-001',
        itemName: 'AC System Cleaner',
        quantity: 0.5,
        unit: 'litre',
      },
    ],
  },
];

// Helper function to get inventory requirements for a service
export function getInventoryRequirements(
  serviceId: string,
): ServiceInventoryItem[] {
  const mapping = serviceInventoryMappings.find(
    (m) => m.serviceId === serviceId,
  );
  return mapping ? mapping.items : [];
}

// Helper function to get inventory requirements for multiple services
export function getInventoryRequirementsForServices(
  serviceIds: string[],
): ServiceInventoryItem[] {
  const allItems: ServiceInventoryItem[] = [];

  serviceIds.forEach((serviceId) => {
    const items = getInventoryRequirements(serviceId);
    allItems.push(...items);
  });

  // Consolidate duplicate items
  const consolidatedItems = new Map<string, ServiceInventoryItem>();

  allItems.forEach((item) => {
    const key = item.itemId;
    if (consolidatedItems.has(key)) {
      const existing = consolidatedItems.get(key)!;
      existing.quantity += item.quantity;
    } else {
      consolidatedItems.set(key, { ...item });
    }
  });

  return Array.from(consolidatedItems.values());
}

// Helper function to check if inventory is available
export function checkInventoryAvailability(
  requiredItems: ServiceInventoryItem[],
  availableInventory: Array<{ id: string; quantity: number; name: string }>,
): { available: boolean; missingItems: ServiceInventoryItem[] } {
  const missingItems: ServiceInventoryItem[] = [];

  requiredItems.forEach((required) => {
    const available = availableInventory.find(
      (item) => item.id === required.itemId,
    );
    if (!available || available.quantity < required.quantity) {
      missingItems.push(required);
    }
  });

  return {
    available: missingItems.length === 0,
    missingItems,
  };
}
