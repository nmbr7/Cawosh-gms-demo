"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UserRole, UserStatus, EmploymentType } from "@/app/models/user";
import { NameInputs } from "./form/NameInputs";
import { ContactInputs } from "./form/ContactInputs";
import { RoleSelect } from "./form/RoleSelect";
import { StatusSelect } from "./form/StatusSelect";
import { SpecializationSelect } from "./form/SpecializationSelect";
import { ImagePicker } from "./form/ImagePicker";
import { EmploymentDetails } from "./form/EmploymentDetails";
import {
  validateEmail,
  validatePhone,
  getValidationErrors,
} from "@/app/utils/validation";
import { toast } from "sonner";

interface ValidationErrors {
  [key: string]: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  role: UserRole;
  status: UserStatus;
  position: string;
  department: string;
  employmentType: EmploymentType;
  joiningDate: string;
  skills: string[];
  certifications: string[];
  workingHours: {
    start: string;
    end: string;
    days: string[];
  };
  systemAccess: {
    canManageUsers: boolean;
    canManageSettings: boolean;
    canViewReports: boolean;
    canManageBilling: boolean;
  };
  image?: File | null;
  imageUrl?: string | null;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: FormData) => void;
  initialData?: Partial<FormData>;
  mode?: "view" | "edit" | "add";
}

export function AddUserModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode = "add",
}: AddUserModalProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    password: initialData?.password || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    role: initialData?.role || "staff",
    status: initialData?.status || "active",
    position: initialData?.position || "",
    department: initialData?.department || "",
    employmentType: initialData?.employmentType || "full-time",
    joiningDate:
      initialData?.joiningDate || new Date().toISOString().split("T")[0],
    skills: initialData?.skills || [],
    certifications: initialData?.certifications || [],
    workingHours: initialData?.workingHours
      ? {
          start: initialData.workingHours.start || "10:00",
          end: initialData.workingHours.end || "18:00",
          days: initialData.workingHours.days || [],
        }
      : {
          start: "10:00",
          end: "18:00",
          days: [],
        },
    systemAccess: initialData?.systemAccess || {
      canManageUsers: false,
      canManageSettings: false,
      canViewReports: false,
      canManageBilling: false,
    },
    image: null,
    imageUrl: initialData?.imageUrl || null,
  });

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  // Reset form data when initialData changes or mode changes
  useEffect(() => {
    if (initialData) {
      // Edit or view mode - populate with user data
      setFormData({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        email: initialData.email || "",
        password: initialData.password || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        role: initialData.role || "staff",
        status: initialData.status || "active",
        position: initialData.position || "",
        department: initialData.department || "",
        employmentType: initialData.employmentType || "full-time",
        joiningDate:
          initialData.joiningDate || new Date().toISOString().split("T")[0],
        skills: initialData.skills || [],
        certifications: initialData.certifications || [],
        workingHours: initialData.workingHours
          ? {
              start: initialData.workingHours.start || "10:00",
              end: initialData.workingHours.end || "18:00",
              days: initialData.workingHours.days || [],
            }
          : {
              start: "10:00",
              end: "18:00",
              days: [],
            },
        systemAccess: initialData.systemAccess || {
          canManageUsers: false,
          canManageSettings: false,
          canViewReports: false,
          canManageBilling: false,
        },
        image: null,
        imageUrl: initialData.imageUrl || null,
      });
    } else if (mode === "add") {
      // Add mode - reset to empty form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        role: "staff",
        status: "active",
        position: "",
        department: "",
        employmentType: "full-time",
        joiningDate: new Date().toISOString().split("T")[0],
        skills: [],
        certifications: [],
        workingHours: {
          start: "10:00",
          end: "18:00",
          days: [],
        },
        systemAccess: {
          canManageUsers: false,
          canManageSettings: false,
          canViewReports: false,
          canManageBilling: false,
        },
        image: null,
        imageUrl: null,
      });
    }
  }, [initialData, mode]);

  // Memoized callback functions to prevent unnecessary re-renders
  const handlePositionChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, position: value }));
  }, []);

  const handleDepartmentChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, department: value }));
  }, []);

  const handleEmploymentTypeChange = useCallback((value: EmploymentType) => {
    setFormData((prev) => ({ ...prev, employmentType: value }));
  }, []);

  const handleJoiningDateChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, joiningDate: value }));
  }, []);

  // Memoized callbacks for other form components
  const handleFirstNameChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, firstName: value }));
  }, []);

  const handleLastNameChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, lastName: value }));
  }, []);

  const handleEmailChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, email: value }));
  }, []);

  const handlePhoneChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, phone: value }));
  }, []);

  const handleRoleChange = useCallback((value: UserRole) => {
    setFormData((prev) => ({ ...prev, role: value }));
  }, []);

  const handleStatusChange = useCallback((value: UserStatus) => {
    setFormData((prev) => ({ ...prev, status: value }));
  }, []);

  const handleSkillsChange = useCallback((value: string[]) => {
    setFormData((prev) => ({ ...prev, skills: value }));
  }, []);

  const handleImageChange = useCallback((file: File | null) => {
    setFormData((prev) => ({ ...prev, image: file }));
  }, []);

  const validateForm = () => {
    const validationErrors: ValidationErrors = {
      firstName: !formData.firstName ? "First name is required" : "",
      lastName: !formData.lastName ? "Last name is required" : "",
      email: !formData.email ? "Email is required" : "",
      password: !formData.password ? "Password is required" : "",
      phone: !formData.phone ? "Phone is required" : "",
      role: !formData.role ? "Role is required" : "",
      position: !formData.position ? "Position is required" : "",
      department: !formData.department ? "Department is required" : "",
    };

    const errors = getValidationErrors(validationErrors);
    const formatErrors: string[] = [];

    if (formData.email && !validateEmail(formData.email)) {
      formatErrors.push("Please enter a valid email address");
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      formatErrors.push(
        "Please enter a valid UK phone number (e.g., 07123456789)"
      );
    }

    if (formData.password && formData.password.length < 8) {
      formatErrors.push("Password must be at least 8 characters long");
    }

    // Combine all validation errors for Sonner display
    const allErrors = [...errors, ...formatErrors];

    if (allErrors.length > 0) {
      toast.error("Please fix below errors", {
        description: (
          <ul className="list-disc list-inside">
            {allErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        ),
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Format data for backend API
    const apiData = {
      ...formData,
      joiningDate: new Date(formData.joiningDate).toISOString(),
      workingHours: {
        ...formData.workingHours,
        days: ["monday", "tuesday", "wednesday", "thursday", "friday"], // Default working days
      },
    };

    onSave(apiData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-semibold">
            {isViewMode
              ? "User Details"
              : isEditMode
              ? "Edit User"
              : "Add New User"}
          </DialogTitle>
        </DialogHeader>
        <form
          id="user-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 space-y-6"
        >
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <ImagePicker
                imageUrl={initialData?.imageUrl}
                onImageChange={handleImageChange}
                disabled={isViewMode}
              />

              <NameInputs
                firstName={formData.firstName}
                lastName={formData.lastName}
                onFirstNameChange={handleFirstNameChange}
                onLastNameChange={handleLastNameChange}
                disabled={isViewMode}
              />

              <ContactInputs
                email={formData.email}
                phone={formData.phone}
                onEmailChange={handleEmailChange}
                onPhoneChange={handlePhoneChange}
                disabled={isViewMode}
              />

              {/* Password Field */}
              {!isViewMode && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Enter password"
                    disabled={isViewMode}
                  />
                </div>
              )}

              {/* Address Field */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Enter address"
                  disabled={isViewMode}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <RoleSelect
                  role={formData.role}
                  onRoleChange={handleRoleChange}
                  disabled={isViewMode}
                />

                <StatusSelect
                  status={formData.status}
                  onStatusChange={handleStatusChange}
                  disabled={isViewMode}
                />
              </div>

              <EmploymentDetails
                position={formData.position}
                department={formData.department}
                employmentType={formData.employmentType}
                joiningDate={formData.joiningDate}
                onPositionChange={handlePositionChange}
                onDepartmentChange={handleDepartmentChange}
                onEmploymentTypeChange={handleEmploymentTypeChange}
                onJoiningDateChange={handleJoiningDateChange}
                disabled={isViewMode}
              />

              {/* Working Hours */}
              <div className="space-y-4">
                <Label>Working Hours</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.workingHours.start}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          workingHours: {
                            ...prev.workingHours,
                            start: e.target.value,
                          },
                        }))
                      }
                      disabled={isViewMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.workingHours.end}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          workingHours: {
                            ...prev.workingHours,
                            end: e.target.value,
                          },
                        }))
                      }
                      disabled={isViewMode}
                    />
                  </div>
                </div>
              </div>

              {/* System Access */}
              <div className="space-y-4">
                <Label>System Access Permissions</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="canManageUsers"
                      checked={formData.systemAccess.canManageUsers}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          systemAccess: {
                            ...prev.systemAccess,
                            canManageUsers: checked,
                          },
                        }))
                      }
                      disabled={isViewMode}
                    />
                    <Label htmlFor="canManageUsers">Can Manage Users</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="canManageSettings"
                      checked={formData.systemAccess.canManageSettings}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          systemAccess: {
                            ...prev.systemAccess,
                            canManageSettings: checked,
                          },
                        }))
                      }
                      disabled={isViewMode}
                    />
                    <Label htmlFor="canManageSettings">
                      Can Manage Settings
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="canViewReports"
                      checked={formData.systemAccess.canViewReports}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          systemAccess: {
                            ...prev.systemAccess,
                            canViewReports: checked,
                          },
                        }))
                      }
                      disabled={isViewMode}
                    />
                    <Label htmlFor="canViewReports">Can View Reports</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="canManageBilling"
                      checked={formData.systemAccess.canManageBilling}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          systemAccess: {
                            ...prev.systemAccess,
                            canManageBilling: checked,
                          },
                        }))
                      }
                      disabled={isViewMode}
                    />
                    <Label htmlFor="canManageBilling">Can Manage Billing</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Width Section */}
          <div className="col-span-2">
            <SpecializationSelect
              selectedSpecializations={formData.skills}
              onSpecializationsChange={handleSkillsChange}
              disabled={isViewMode}
            />
          </div>

          {/* Certifications */}
          <div className="col-span-2">
            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications</Label>
              <Input
                id="certifications"
                value={formData.certifications.join(", ")}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    certifications: e.target.value
                      .split(",")
                      .map((cert) => cert.trim())
                      .filter((cert) => cert),
                  }))
                }
                placeholder="Enter certifications separated by commas"
                disabled={isViewMode}
              />
            </div>
          </div>
        </form>
        <DialogFooter className="p-6 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            {isViewMode ? "Close" : "Cancel"}
          </Button>
          {!isViewMode && (
            <Button type="submit" form="user-form">
              {isEditMode ? "Update User" : "Add User"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
