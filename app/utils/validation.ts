export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // UK phone number validation (with or without country code)
  const phoneRegex = /^(\+44|0)7\d{9}$/;
  return phoneRegex.test(phone);
};

export const getValidationErrors = (formData: any): string[] => {
  const errors: string[] = [];

  // Required fields validation
  const requiredFields = [
    { field: 'firstName', label: 'First Name' },
    { field: 'lastName', label: 'Last Name' },
    { field: 'email', label: 'Email' },
    { field: 'phone', label: 'Phone' },
    { field: 'role', label: 'Role' },
    { field: 'status', label: 'Status' },
    { field: 'position', label: 'Position' },
    { field: 'department', label: 'Department' },
    { field: 'employmentType', label: 'Employment Type' },
    { field: 'joiningDate', label: 'Joining Date' },
  ];

  requiredFields.forEach(({ field, label }) => {
    if (!formData[field]) {
      errors.push(`${label} is required`);
    }
  });

  // Email validation
  if (formData.email && !validateEmail(formData.email)) {
    errors.push('Please enter a valid email address');
  }

  // Phone validation
  if (formData.phone && !validatePhone(formData.phone)) {
    errors.push('Please enter a valid UK phone number (e.g., 07123456789)');
  }

  return errors;
}; 