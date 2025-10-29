import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface StockMovement {
  id: string;
  itemId: string;
  type: 'purchase' | 'sale' | 'adjustment' | 'return';
  quantity: number;
  reference: string;
  notes: string;
  date: string;
  createdBy: string;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  costPrice: number;
  sellingPrice: number;
  supplier: string;
  location: string;
  lastRestocked: string;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const itemId = searchParams.get('itemId');
    const type = searchParams.get('type');

    let movements = [...db.stockMovements];

    // Apply filters
    if (itemId) {
      movements = movements.filter((movement) => movement.itemId === itemId);
    }
    if (type) {
      movements = movements.filter((movement) => movement.type === type);
    }

    // Sort by date (newest first)
    movements.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMovements = movements.slice(startIndex, endIndex);

    return NextResponse.json({
      movements: paginatedMovements,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(movements.length / limit),
        totalItems: movements.length,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock movements' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newMovement: StockMovement = {
      id: (db.stockMovements.length + 1).toString(),
      ...data,
      date: new Date().toISOString(),
    };

    // Update inventory quantity
    const itemIndex = db.inventory.findIndex(
      (item: InventoryItem) => item.id === data.itemId,
    );
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 },
      );
    }

    const item = db.inventory[itemIndex];
    let quantityChange = data.quantity;

    // Adjust quantity based on movement type
    switch (data.type) {
      case 'sale':
      case 'adjustment':
        quantityChange = -Math.abs(quantityChange);
        break;
      case 'purchase':
      case 'return':
        quantityChange = Math.abs(quantityChange);
        break;
    }

    // Update item quantity
    item.quantity += quantityChange;
    item.updatedAt = new Date().toISOString();

    // Add movement record
    db.stockMovements.push(newMovement);

    return NextResponse.json(newMovement, { status: 201 });
  } catch (error) {
    console.error('Error creating stock movement:', error);
    return NextResponse.json(
      { error: 'Failed to create stock movement' },
      { status: 500 },
    );
  }
}
