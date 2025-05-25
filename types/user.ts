export type ObjectId = {
  $oid: string;
};

export type DateField = {
  $date: string;
};

export type WorkingHours = {
  start: string;
  end: string;
  days: string[];
};

export type SystemAccess = {
  canManageUsers: boolean;
  canManageSettings: boolean;
  canViewReports: boolean;
  canManageBilling: boolean;
};

export type User = {
  _id: ObjectId;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  position: string;
  status: "active" | "inactive" | "suspended";
  permissions: string[];
  accessLevel: number;
  department: string;
  joiningDate: DateField;
  employmentType: "full-time" | "part-time" | "contract";
  workingHours: WorkingHours;
  skills: string[];
  certifications: string[];
  systemAccess: SystemAccess;
  lastLogin: DateField | null;
  createdAt: DateField;
  updatedAt: DateField;
  __v: number;
  userId: ObjectId;
  imageUrl?: string;
};
