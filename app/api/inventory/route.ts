import { NextResponse } from 'next/server';
import { db } from '../../lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    let items = [...db.inventory];

    // Apply search filter
    if (search) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.sku.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Apply category filter
    if (category) {
      items = items.filter((item) => item.category === category);
    }

    // Apply sorting
    items.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a];
      const bValue = b[sortBy as keyof typeof b];
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = items.slice(startIndex, endIndex);

    return NextResponse.json({
      items: paginatedItems,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(items.length / limit),
        totalItems: items.length,
        itemsPerPage: limit,
      },
      filters: {
        categories: [...new Set(items.map((item) => item.category))],
      },
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newItem = {
      id: (db.inventory.length + 1).toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.inventory.push(newItem);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 },
    );
  }
}
