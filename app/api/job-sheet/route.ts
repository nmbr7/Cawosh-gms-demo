import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Define interfaces
interface Technician {
  id: string;
  name: string;
  specializations?: string[];
}

interface JobSheet {
  id: string;
  bookingId: string;
  technicianId: string;
  booking?: {
    date: string;
    startTime: string;
    endTime: string;
    bay: number;
  };
  checklist: Array<{
    task: string;
    status: string;
  }>;
  partsUsed: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
  }>;
  status: string;
}

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  bay: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const bookingId = searchParams.get('bookingId');
    const technicianId = searchParams.get('technicianId');
    const sortBy = searchParams.get('sortBy') || 'id';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Read the mock database file
    const dbPath = path.join(process.cwd(), 'app/mock-db/db.json');
    const dbContent = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(dbContent);

    // Get job sheets, technicians, and bookings from the database
    let jobSheets: JobSheet[] = db.jobSheets || [];
    const technicians: Technician[] = db.technicians || [];
    const bookings: Booking[] = db.bookings || [];

    // Create maps for quick lookup
    const technicianMap = new Map(technicians.map((tech) => [tech.id, tech]));
    const bookingMap = new Map(
      bookings.map((booking) => [booking.id, booking]),
    );

    // Apply filters
    if (status && status !== 'all') {
      jobSheets = jobSheets.filter((js) => js.status === status);
    }
    if (bookingId) {
      jobSheets = jobSheets.filter((js) => js.bookingId === bookingId);
    }
    if (technicianId) {
      jobSheets = jobSheets.filter((js) => js.technicianId === technicianId);
    }

    // Apply sorting
    jobSheets.sort((a, b) => {
      const aValue = a[sortBy as keyof JobSheet];
      const bValue = b[sortBy as keyof JobSheet];

      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortOrder === 'asc' ? 1 : -1;
      if (bValue === undefined) return sortOrder === 'asc' ? -1 : 1;

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    // Calculate pagination
    const totalItems = jobSheets.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedJobSheets = jobSheets.slice(startIndex, endIndex);

    // Add technician and booking details to each job sheet
    const jobSheetsWithDetails = paginatedJobSheets.map((js) => ({
      ...js,
      technician: technicianMap.get(js.technicianId),
      booking: bookingMap.get(js.bookingId),
    }));

    // Prepare pagination info
    const paginationInfo: PaginationInfo = {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
    };

    console.log({
      technicians: technicians, // Return all technicians from the database
      statuses: [
        { value: 'completed', label: 'Completed' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'not_started', label: 'Not Started' },
      ],
    });

    // Return the response with all technicians regardless of filters
    return NextResponse.json({
      jobSheets: jobSheetsWithDetails,
      pagination: paginationInfo,
      filters: {
        technicians: technicians, // Return all technicians from the database
        statuses: [
          { value: 'completed', label: 'Completed' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'not_started', label: 'Not Started' },
        ],
      },
    });
  } catch (error) {
    console.error('Error in job sheet API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job sheets' },
      { status: 500 },
    );
  }
}
