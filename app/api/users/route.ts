import { NextResponse } from 'next/server';
import { User } from '@/app/models/user';
import mockUsers from '@/app/data/mock-users.json';

export async function GET(request: Request): Promise<NextResponse> {
  // Add 1 second delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const { searchParams }: URL = new URL(request.url);
  
  // Pagination parameters
  const page: number = parseInt(searchParams.get('page') || '1');
  const limit: number = parseInt(searchParams.get('limit') || '10');
  
  // Filter parameters
  const role: string | null = searchParams.get('role') || null;
  const status: string | null = searchParams.get('status') || null;
  const search: string | null = searchParams.get('search') || null;
  
  // Sort parameters
  const sortBy: string = searchParams.get('sortBy') || 'name';
  const sortOrder: 'asc' | 'desc' = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';

  // Log request parameters
  console.log('API Request:', {
    page,
    limit,
    filters: {
      role,
      status,
      search
    },
    sort: {
      by: sortBy,
      order: sortOrder
    }
  });

  // Apply filters
  let filteredUsers = mockUsers.users.filter(user => {
    // Role filter
    const matchesRole = role === null || user.role === role;
    
    // Status filter
    const matchesStatus = status === null || user.status === status;
    
    // Search filter (case-insensitive)
    const matchesSearch = search === null || 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.position.toLowerCase().includes(search.toLowerCase());
    
    return matchesRole && matchesStatus && matchesSearch;
  });

  // Apply search filter if provided
  if (search) {
    filteredUsers = filteredUsers.filter(user => {
      const searchLower = search.toLowerCase();
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email.toLowerCase();
      const employeeId = user.employeeId?.toLowerCase() ?? '';
      const position = user.position?.toLowerCase() ?? '';

      return (
        fullName.includes(searchLower) ||
        email.includes(searchLower) ||
        employeeId.includes(searchLower) ||
        position.includes(searchLower)
      );
    });
  }

  // Sort users
  let sortedUsers = [...filteredUsers];
  if (sortBy) {
    sortedUsers.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          // Compare by full name (firstName + lastName)
          const nameA = `${a.firstName} ${a.lastName}`;
          const nameB = `${b.firstName} ${b.lastName}`;
          comparison = nameA.localeCompare(nameB);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'department':
          comparison = (a.department || '').localeCompare(b.department || '');
          break;
        case 'position':
          comparison = a.position.localeCompare(b.position);
          break;
        case 'lastLogin':
          comparison = new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime();
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  // Calculate pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = sortedUsers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedUsers.length / limit);

  const response = {
    users: paginatedUsers,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: sortedUsers.length,
      itemsPerPage: limit
    }
  };

  // Log response
  console.log('API Response:', {
    totalItems: sortedUsers.length,
    returnedItems: paginatedUsers.length,
    pagination: response.pagination
  });

  return NextResponse.json(response);
} 