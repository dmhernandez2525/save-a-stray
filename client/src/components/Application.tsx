import { useState, useCallback, useMemo } from "react";
import { useMutation } from "@apollo/client";
import Mutations from "../graphql/mutations";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Label } from "./ui/label";
import { CreateApplicationResponse } from "../types";
import { CheckCircle2, User, Home, FileText, ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";

const { CREATE_APPLICATION } = Mutations;

// =============================================================================
// Types
// =============================================================================

interface ApplicationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  housing: string;
  housingType: string;
  activityLevel: string;
}

interface StepConfig {
  title: string;
  icon: typeof User;
  description: string;
}

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

interface SelectFieldProps extends Omit<FormFieldProps, "type"> {
  options: { value: string; label: string }[];
}

// =============================================================================
// Constants
// =============================================================================

const STEPS: StepConfig[] = [
  { title: "Personal Info", icon: User, description: "Tell us about yourself" },
  { title: "Housing", icon: Home, description: "About your living situation" },
  { title: "Review", icon: FileText, description: "Confirm your application" },
];

const HOUSING_OPTIONS = [
  { value: "", label: "Select housing type..." },
  { value: "House", label: "House" },
  { value: "Apartment", label: "Apartment" },
  { value: "Condo", label: "Condo" },
  { value: "Townhouse", label: "Townhouse" },
  { value: "Other", label: "Other" },
];

const OWNERSHIP_OPTIONS = [
  { value: "", label: "Select..." },
  { value: "Own", label: "Own" },
  { value: "Rent", label: "Rent" },
];

const ACTIVITY_OPTIONS = [
  { value: "", label: "Select activity level..." },
  { value: "Low", label: "Low - Quiet household" },
  { value: "Moderate", label: "Moderate - Some activity" },
  { value: "High", label: "High - Very active household" },
];

const INITIAL_FORM_STATE: ApplicationFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  streetAddress: "",
  city: "",
  state: "",
  housing: "",
  housingType: "",
  activityLevel: "",
};

// =============================================================================
// Validation
// =============================================================================

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const PHONE_REGEX = /^[\d\s()+-]{10,20}$/;

function validatePersonalInfo(form: ApplicationFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.firstName.trim()) {
    errors.firstName = "First name is required";
  } else if (form.firstName.trim().length < 2) {
    errors.firstName = "First name must be at least 2 characters";
  }

  if (!form.lastName.trim()) {
    errors.lastName = "Last name is required";
  } else if (form.lastName.trim().length < 2) {
    errors.lastName = "Last name must be at least 2 characters";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  if (!form.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required";
  } else if (!PHONE_REGEX.test(form.phoneNumber.replace(/\s/g, ""))) {
    errors.phoneNumber = "Please enter a valid phone number (10-20 digits)";
  }

  return errors;
}

function validateHousingInfo(form: ApplicationFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.streetAddress.trim()) {
    errors.streetAddress = "Street address is required";
  }

  if (!form.city.trim()) {
    errors.city = "City is required";
  }

  if (!form.state.trim()) {
    errors.state = "State is required";
  }

  if (!form.housing) {
    errors.housing = "Housing type is required";
  }

  if (!form.housingType) {
    errors.housingType = "Please specify if you own or rent";
  }

  return errors;
}

// =============================================================================
// Subcomponents
// =============================================================================

/** Reusable form input field with error handling */
function FormField({ id, label, value, onChange, error, type = "text", placeholder, required }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`bg-sky-blue-50 dark:bg-warm-gray-800 border-warm-gray-200 dark:border-warm-gray-700
          focus:border-sky-blue-500 focus:ring-sky-blue-500 ${error ? "border-destructive" : ""}`}
      />
      {error && (
        <p id={`${id}-error`} className="text-destructive text-xs mt-1 flex items-center gap-1" role="alert">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Reusable select field with error handling */
function SelectField({ id, label, value, onChange, error, options, required }: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`flex h-10 w-full rounded-xl border px-3 py-2 text-sm bg-sky-blue-50 dark:bg-warm-gray-800
          border-warm-gray-200 dark:border-warm-gray-700 focus:border-sky-blue-500 focus:ring-sky-blue-500
          focus:outline-none ${error ? "border-destructive" : ""}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} className="text-destructive text-xs mt-1 flex items-center gap-1" role="alert">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Step indicator showing progress through form */
function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <nav aria-label="Application progress" className="mb-8">
      <ol className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <li key={step.title} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                      ? "bg-sky-blue-500 text-white"
                      : "bg-warm-gray-200 dark:bg-warm-gray-700 text-muted-foreground"
                  }`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  )}
                </div>
                <span className="text-xs mt-2 text-muted-foreground text-center hidden sm:block font-medium">
                  {step.title}
                  <span className="sr-only">
                    {isCompleted ? " (completed)" : isCurrent ? " (current)" : ""}
                  </span>
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-colors ${
                    isCompleted ? "bg-green-500" : "bg-warm-gray-200 dark:bg-warm-gray-700"
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Personal information step */
function PersonalInfoStep({ form, errors, onChange }: {
  form: ApplicationFormData;
  errors: Record<string, string>;
  onChange: (field: keyof ApplicationFormData, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{STEPS[0].description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          id="firstName"
          label="First Name"
          value={form.firstName}
          onChange={(v) => onChange("firstName", v)}
          error={errors.firstName}
          placeholder="First name"
          required
        />
        <FormField
          id="lastName"
          label="Last Name"
          value={form.lastName}
          onChange={(v) => onChange("lastName", v)}
          error={errors.lastName}
          placeholder="Last name"
          required
        />
      </div>

      <FormField
        id="email"
        label="Email"
        type="email"
        value={form.email}
        onChange={(v) => onChange("email", v)}
        error={errors.email}
        placeholder="your.email@example.com"
        required
      />

      <FormField
        id="phoneNumber"
        label="Phone Number"
        type="tel"
        value={form.phoneNumber}
        onChange={(v) => onChange("phoneNumber", v)}
        error={errors.phoneNumber}
        placeholder="(555) 123-4567"
        required
      />
    </div>
  );
}

/** Housing information step */
function HousingInfoStep({ form, errors, onChange }: {
  form: ApplicationFormData;
  errors: Record<string, string>;
  onChange: (field: keyof ApplicationFormData, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{STEPS[1].description}</p>

      <FormField
        id="streetAddress"
        label="Street Address"
        value={form.streetAddress}
        onChange={(v) => onChange("streetAddress", v)}
        error={errors.streetAddress}
        placeholder="123 Main St"
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          id="city"
          label="City"
          value={form.city}
          onChange={(v) => onChange("city", v)}
          error={errors.city}
          placeholder="City"
          required
        />
        <FormField
          id="state"
          label="State"
          value={form.state}
          onChange={(v) => onChange("state", v)}
          error={errors.state}
          placeholder="State"
          required
        />
      </div>

      <SelectField
        id="housing"
        label="Housing Type"
        value={form.housing}
        onChange={(v) => onChange("housing", v)}
        error={errors.housing}
        options={HOUSING_OPTIONS}
        required
      />

      <SelectField
        id="housingType"
        label="Do you own or rent?"
        value={form.housingType}
        onChange={(v) => onChange("housingType", v)}
        error={errors.housingType}
        options={OWNERSHIP_OPTIONS}
        required
      />

      <SelectField
        id="activityLevel"
        label="Activity Level"
        value={form.activityLevel}
        onChange={(v) => onChange("activityLevel", v)}
        options={ACTIVITY_OPTIONS}
      />
    </div>
  );
}

/** Review step showing summary of entered data */
function ReviewStep({ form }: { form: ApplicationFormData }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{STEPS[2].description}</p>

      <div className="bg-sky-blue-50 dark:bg-warm-gray-800 rounded-xl p-4 sm:p-5 space-y-3">
        <h3 className="font-semibold text-foreground border-b border-warm-gray-200 dark:border-warm-gray-700 pb-2 flex items-center gap-2">
          <User className="h-4 w-4 text-sky-blue-500" aria-hidden="true" />
          Personal Information
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Name</dt>
            <dd className="text-foreground font-medium">{form.firstName} {form.lastName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="text-foreground font-medium">{form.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Phone</dt>
            <dd className="text-foreground font-medium">{form.phoneNumber}</dd>
          </div>
        </dl>
      </div>

      <div className="bg-salmon-50 dark:bg-warm-gray-800 rounded-xl p-4 sm:p-5 space-y-3">
        <h3 className="font-semibold text-foreground border-b border-warm-gray-200 dark:border-warm-gray-700 pb-2 flex items-center gap-2">
          <Home className="h-4 w-4 text-salmon-500" aria-hidden="true" />
          Housing Details
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Address</dt>
            <dd className="text-foreground font-medium">
              {form.streetAddress}, {form.city}, {form.state}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Housing</dt>
            <dd className="text-foreground font-medium">{form.housing} ({form.housingType})</dd>
          </div>
          {form.activityLevel && (
            <div>
              <dt className="text-muted-foreground">Activity Level</dt>
              <dd className="text-foreground font-medium">{form.activityLevel}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

interface ApplicationProps {
  animalId?: string;
  userId?: string;
}

/**
 * Multi-step adoption application form.
 * Collects personal and housing information from potential adopters.
 */
export default function Application({ animalId = "", userId = "" }: ApplicationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<ApplicationFormData>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [createApplication, { loading, error: mutationError }] = useMutation<CreateApplicationResponse>(
    CREATE_APPLICATION,
    {
      onCompleted: () => setIsSubmitted(true),
    }
  );

  const handleFieldChange = useCallback((field: keyof ApplicationFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const validateCurrentStep = useCallback((): boolean => {
    const stepErrors = currentStep === 0
      ? validatePersonalInfo(form)
      : currentStep === 1
      ? validateHousingInfo(form)
      : {};

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return false;
    }
    return true;
  }, [currentStep, form]);

  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [validateCurrentStep]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
    setErrors({});
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep !== 2) return;

    // Sanitize input before sending
    const sanitizedData = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      phoneNumber: form.phoneNumber.trim(),
      streetAddress: form.streetAddress.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      housing: form.housing,
      housingType: form.housingType,
      activityLevel: form.activityLevel,
    };

    createApplication({
      variables: {
        animalId,
        userId,
        applicationData: JSON.stringify(sanitizedData),
      },
    });
  }, [currentStep, form, animalId, userId, createApplication]);

  const errorMessage = useMemo(() => {
    return mutationError?.graphQLErrors?.[0]?.message || mutationError?.message || "";
  }, [mutationError]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12" role="status" aria-label="Submitting application">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground font-capriola">Submitting your application...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-sky-blue-600 dark:text-sky-blue-400 font-capriola text-2xl">
          Application for Adoption
        </CardTitle>
        <CardDescription>
          Complete the form below to submit your adoption application
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Success Message */}
        {isSubmitted && (
          <div
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center"
            role="alert"
          >
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" aria-hidden="true" />
            <p className="text-green-700 dark:text-green-400 text-lg font-capriola">
              Application Successfully Submitted
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              We'll be in touch with you soon!
            </p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div
            className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 text-center mb-4"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 mx-auto mb-2" aria-hidden="true" />
            {errorMessage}
          </div>
        )}

        {/* Form */}
        {!isSubmitted && (
          <>
            <StepIndicator currentStep={currentStep} />

            <form onSubmit={handleSubmit} noValidate>
              <div aria-live="polite" aria-atomic="true">
                {currentStep === 0 && (
                  <PersonalInfoStep form={form} errors={errors} onChange={handleFieldChange} />
                )}
                {currentStep === 1 && (
                  <HousingInfoStep form={form} errors={errors} onChange={handleFieldChange} />
                )}
                {currentStep === 2 && (
                  <ReviewStep form={form} />
                )}
              </div>

              <div className="flex justify-between mt-8 pt-6 border-t border-warm-gray-200 dark:border-warm-gray-700">
                {currentStep > 0 ? (
                  <Button type="button" variant="outline" onClick={handleBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Back</span>
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 2 ? (
                  <Button type="button" variant="skyBlue" onClick={handleNext} className="gap-2">
                    <span className="hidden sm:inline">Next</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                ) : (
                  <Button variant="salmon" type="submit" className="gap-2">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Submit Application
                  </Button>
                )}
              </div>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
}
