import { NextResponse } from 'next/server';
import db from '@/app/mock-db/db.json';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant_id') || 'garage_001';
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');

    const garage = db.garages.find((g) => g.id === tenantId);
    if (!garage) {
      return NextResponse.json({ services: [], filters: { categories: [] } });
    }

    const serviceIds = garage.services.map((s) => s.serviceId);
    let services = db.services.filter((s) => serviceIds.includes(s.id));

    // Apply category filter if provided
    if (category) {
      services = services.filter((service) => service.category === category);
    }

    // Apply active status filter if provided
    if (isActive !== null) {
      const activeStatus = isActive === 'true';
      services = services.filter(
        (service) => service.isActive === activeStatus,
      );
    }

    // Get unique categories for filter options
    const categories = [
      ...new Set(db.services.map((service) => service.category)),
    ];

    return NextResponse.json({
      services,
      filters: {
        categories,
      },
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 },
    );
  }
}
