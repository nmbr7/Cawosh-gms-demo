export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

interface ValidationErrors {
  [key: string]: string;
}

export const getValidationErrors = (errors: ValidationErrors): string[] => {
  return Object.values(errors).filter((error) => error);
};

export const validatePhone = (nationalNumber: string): boolean => {
  return /^[1-9][0-9]{9}$/.test(nationalNumber);
};
