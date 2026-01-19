import Validator from 'validator';
import validText from './valid-text';
import { ValidationResult, LoginInput } from '../../shared/types';

interface LoginData {
  email: string;
  password: string;
}

export default function validateLoginInput(data: Partial<LoginData>): ValidationResult {
  const validatedData = {
    email: validText(data.email) ? data.email! : "",
    password: validText(data.password) ? data.password! : ""
  };

  if (!Validator.isEmail(validatedData.email)) {
    return { message: "Email is invalid", isValid: false };
  }

  if (Validator.isEmpty(validatedData.email)) {
    return { message: "Email field is required", isValid: false };
  }

  if (Validator.isEmpty(validatedData.password)) {
    return { message: "Password field is required", isValid: false };
  }

  return {
    message: "",
    isValid: true
  };
}
