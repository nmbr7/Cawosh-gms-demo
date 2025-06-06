export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // UK phone number validation (with or without country code)
  const phoneRegex = /^(\+44|0)7\d{9}$/;
  return phoneRegex.test(phone);
};

interface ValidationErrors {
  [key: string]: string;
}

export const getValidationErrors = (errors: ValidationErrors): string[] => {
  return Object.values(errors).filter((error) => error);
};
