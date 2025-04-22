"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserRole, UserStatus, EmploymentType } from "@/app/models/user";
import { NameInputs } from "./form/NameInputs";
import { ContactInputs } from "./form/ContactInputs";
import { RoleSelect } from "./form/RoleSelect";
import { StatusSelect } from "./form/StatusSelect";
import { SpecializationSelect } from "./form/SpecializationSelect";
import { ImagePicker } from "./form/ImagePicker";
import { EmploymentDetails } from "./form/EmploymentDetails";
import { validateEmail, validatePhone, getValidationErrors } from "@/app/utils/validation";
import { toast } from "sonner";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
  initialData?: any;
  mode?: 'view' | 'edit' | 'add';
}

export function AddUserModal({ isOpen, onClose, onSave, initialData, mode = 'add' }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    role: initialData?.role || "staff" as UserRole,
    status: initialData?.status || "active" as UserStatus,
    position: initialData?.position || "",
    department: initialData?.department || "",
    employmentType: initialData?.employmentType || "full-time" as EmploymentType,
    joiningDate: initialData?.joiningDate || new Date().toISOString().split('T')[0],
    specialization: initialData?.specialization || [],
    image: null as File | null,
    imageUrl: initialData?.imageUrl || null,
  });

  const [errors, setErrors] = useState<{
    email?: string;
    phone?: string;
  }>({});

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

  // Reset form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        role: initialData.role || "staff",
        status: initialData.status || "active",
        position: initialData.position || "",
        department: initialData.department || "",
        employmentType: initialData.employmentType || "full-time",
        joiningDate: initialData.joiningDate || new Date().toISOString().split('T')[0],
        specialization: initialData.specialization || [],
        image: null,
        imageUrl: initialData.imageUrl || null,
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const validationErrors = getValidationErrors(formData);
    const fieldErrors: { email?: string; phone?: string } = {};

    if (formData.email && !validateEmail(formData.email)) {
      fieldErrors.email = "Please enter a valid email address";
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      fieldErrors.phone = "Please enter a valid UK phone number (e.g., 07123456789)";
    }

    setErrors(fieldErrors);

    if (validationErrors.length > 0 || Object.keys(fieldErrors).length > 0) {
      toast.error("Validation Error", {
        description: (
          <ul className="list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
            {fieldErrors.email && <li>{fieldErrors.email}</li>}
            {fieldErrors.phone && <li>{fieldErrors.phone}</li>}
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

    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {isViewMode ? "User Details" : isEditMode ? "Edit User" : "Add New User"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <ImagePicker
                imageUrl={initialData?.imageUrl}
                onImageChange={(file) => setFormData(prev => ({ ...prev, image: file }))}
                disabled={isViewMode}
              />

              <NameInputs
                firstName={formData.firstName}
                lastName={formData.lastName}
                onFirstNameChange={(value) => setFormData(prev => ({ ...prev, firstName: value }))}
                onLastNameChange={(value) => setFormData(prev => ({ ...prev, lastName: value }))}
                disabled={isViewMode}
              />

              <ContactInputs
                email={formData.email}
                phone={formData.phone}
                onEmailChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                onPhoneChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                emailError={errors.email}
                phoneError={errors.phone}
                disabled={isViewMode}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <RoleSelect
                  role={formData.role}
                  onRoleChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                  disabled={isViewMode}
                />

                <StatusSelect
                  status={formData.status}
                  onStatusChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  disabled={isViewMode}
                />
              </div>

              <EmploymentDetails
                position={formData.position}
                department={formData.department}
                employmentType={formData.employmentType}
                joiningDate={formData.joiningDate}
                onPositionChange={(value) => setFormData(prev => ({ ...prev, position: value }))}
                onDepartmentChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                onEmploymentTypeChange={(value) => setFormData(prev => ({ ...prev, employmentType: value }))}
                onJoiningDateChange={(value) => setFormData(prev => ({ ...prev, joiningDate: value }))}
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Full Width Section */}
          <div className="col-span-2">
            <SpecializationSelect
              selectedSpecializations={formData.specialization}
              onSpecializationsChange={(value) => setFormData(prev => ({ ...prev, specialization: value }))}
              disabled={isViewMode}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {isViewMode ? "Close" : "Cancel"}
            </Button>
            {!isViewMode && (
              <Button type="submit">
                {isEditMode ? "Update User" : "Add User"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 