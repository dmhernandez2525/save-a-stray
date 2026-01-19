import Validator from 'validator';
import validText from './valid-text';
import { ValidationResult, RegisterInput } from '../../shared/types';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  userRole: string;
}

export default function validateRegisterInput(data: Partial<RegisterData>): ValidationResult {
  const validatedData = {
    name: validText(data.name) ? data.name! : "",
    email: validText(data.email) ? data.email! : "",
    password: validText(data.password) ? data.password! : "",
    userRole: validText(data.userRole) ? data.userRole! : ""
  };

  if (!Validator.isEmail(validatedData.email)) {
    return { message: "Email is invalid", isValid: false };
  }

  if (Validator.isEmpty(validatedData.email)) {
    return { message: "Email field is required", isValid: false };
  }

  if (Validator.isEmpty(validatedData.userRole)) {
    return { message: "User Role field is required", isValid: false };
  }

  if (Validator.isEmpty(validatedData.password)) {
    return { message: "Password field is required", isValid: false };
  }

  if (!Validator.isLength(validatedData.password, { min: 8, max: 32 })) {
    return {
      message: "Password length needs to be between 8 and 32 characters",
      isValid: false
    };
  }

  if (!Validator.isLength(validatedData.name, { min: 2, max: 32 })) {
    return {
      message: "Name length needs to be between 2 and 32 characters",
      isValid: false
    };
  }

  if (Validator.isEmpty(validatedData.name)) {
    return {
      message: "Name cannot be empty",
      isValid: false
    };
  }

  return {
    message: "",
    isValid: true
  };
}
