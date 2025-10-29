export type UserRole = 'admin' | 'manager' | 'staff' | 'technician';
export type UserStatus = 'active' | 'inactive' | 'on-leave';
export type EmploymentType = 'full-time' | 'part-time' | 'contract';

export interface UserData {
  id: string;
  employeeId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  position?: string;
  status: UserStatus;
  permissions: string[];
  accessLevel: number;
  department?: string;
  joiningDate?: string;
  employmentType: EmploymentType;
  workingHours?: {
    start: string;
    end: string;
    days: string[];
  };
  managedDepartments?: string[];
  teamSize?: number;
  reportingTo?: string;
  skills?: string[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
    expiry: string;
  }[];
  attendance?: {
    date: string;
    checkIn: string;
    checkOut: string;
    status: string;
  }[];
  performanceMetrics?: {
    efficiency?: number;
    customerSatisfaction?: number;
    tasksCompleted?: number;
    teamEfficiency?: number;
    revenueTargets?: number;
  };
  assignedBay?: number;
  specialization?: string[];
  toolsAssigned?: string[];
  currentTasks?: string[];
  systemAccess?: {
    canManageUsers: boolean;
    canManageSettings: boolean;
    canViewReports: boolean;
    canManageBilling: boolean;
  };
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export class User {
  constructor(private data: UserData) {}

  get id() {
    return this.data.id;
  }
  get employeeId() {
    return this.data.employeeId;
  }
  get firstName() {
    return this.data.firstName;
  }
  get lastName() {
    return this.data.lastName;
  }
  get email() {
    return this.data.email;
  }
  get phone() {
    return this.data.phone;
  }
  get role() {
    return this.data.role;
  }
  get position() {
    return this.data.position;
  }
  get status() {
    return this.data.status;
  }
  get permissions() {
    return this.data.permissions;
  }
  get accessLevel() {
    return this.data.accessLevel;
  }
  get department() {
    return this.data.department;
  }
  get joiningDate() {
    return this.data.joiningDate;
  }
  get employmentType() {
    return this.data.employmentType;
  }
  get workingHours() {
    return this.data.workingHours;
  }
  get managedDepartments() {
    return this.data.managedDepartments;
  }
  get teamSize() {
    return this.data.teamSize;
  }
  get reportingTo() {
    return this.data.reportingTo;
  }
  get skills() {
    return this.data.skills;
  }
  get certifications() {
    return this.data.certifications;
  }
  get attendance() {
    return this.data.attendance;
  }
  get performanceMetrics() {
    return this.data.performanceMetrics;
  }
  get assignedBay() {
    return this.data.assignedBay;
  }
  get specialization() {
    return this.data.specialization;
  }
  get toolsAssigned() {
    return this.data.toolsAssigned;
  }
  get currentTasks() {
    return this.data.currentTasks;
  }
  get systemAccess() {
    return this.data.systemAccess;
  }
  get lastLogin() {
    return this.data.lastLogin;
  }
  get createdAt() {
    return this.data.createdAt;
  }
  get updatedAt() {
    return this.data.updatedAt;
  }

  getStatusColor() {
    switch (this.data.status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getRoleColor() {
    switch (this.data.role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'staff':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
