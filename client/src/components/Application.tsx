import React, { useState, FormEvent } from "react";
import { Mutation } from "@apollo/client/react/components";
import Mutations from "../graphql/mutations";
import { withRouter, WithRouterProps } from "../util/withRouter";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Label } from "./ui/label";
import { CreateApplicationResponse } from "../types";
import { CheckCircle2, User, Home, FileText, ArrowLeft, ArrowRight } from "lucide-react";

const { CREATE_APPLICATION } = Mutations;

const STEPS = [
  { title: "Personal Info", icon: User, description: "Tell us about yourself" },
  { title: "Housing", icon: Home, description: "About your living situation" },
  { title: "Review", icon: FileText, description: "Confirm your application" },
];

interface ApplicationProps extends WithRouterProps {
  animalId?: string;
}

interface FormState {
  animalId: string;
  userId: string;
  firstName: string;
  lastName: string;
  streetAddress: string;
  city: string;
  state: string;
  email: string;
  phoneNumber: string;
  housing: string;
  housingType: string;
  activityLevel: string;
}

const NewApplication: React.FC<ApplicationProps> = ({ animalId = "" }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [message, setMessage] = useState("");
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormState>({
    animalId,
    userId: "",
    firstName: "",
    lastName: "",
    streetAddress: "",
    city: "",
    state: "",
    email: "",
    phoneNumber: "",
    housing: "",
    housingType: "",
    activityLevel: "",
  });

  const update = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [field]: e.target.value });
    setStepErrors({});
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 0) {
      if (!form.firstName.trim()) errors.firstName = "First name is required";
      if (!form.lastName.trim()) errors.lastName = "Last name is required";
      if (!form.email.trim()) errors.email = "Email is required";
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = "Please enter a valid email";
      }
      if (!form.phoneNumber.trim()) errors.phoneNumber = "Phone number is required";
      else if (!/^[\d\s()+-]{7,20}$/.test(form.phoneNumber.trim())) {
        errors.phoneNumber = "Please enter a valid phone number";
      }
    }

    if (step === 1) {
      if (!form.streetAddress.trim()) errors.streetAddress = "Street address is required";
      if (!form.city.trim()) errors.city = "City is required";
      if (!form.state.trim()) errors.state = "State is required";
      if (!form.housing.trim()) errors.housing = "Housing type is required";
      if (!form.housingType.trim()) errors.housingType = "Own/Rent is required";
    }

    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
    setStepErrors({});
  };

  const renderFieldError = (field: string) => {
    const error = stepErrors[field];
    if (!error) return null;
    return <p className="text-destructive text-xs mt-1">{error}</p>;
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isCurrent
                    ? "bg-sky-blue-500 text-white"
                    : "bg-warm-gray-200 dark:bg-warm-gray-700 text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <p className="text-xs mt-2 text-muted-foreground text-center hidden sm:block font-medium">
                {step.title}
              </p>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 transition-colors ${
                  isCompleted ? "bg-green-500" : "bg-warm-gray-200 dark:bg-warm-gray-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  const inputClassName = (fieldName: string) =>
    `bg-sky-blue-50 dark:bg-warm-gray-800 border-warm-gray-200 dark:border-warm-gray-700 focus:border-sky-blue-500 focus:ring-sky-blue-500 ${
      stepErrors[fieldName] ? "border-destructive" : ""
    }`;

  const selectClassName = (fieldName: string) =>
    `flex h-10 w-full rounded-xl border px-3 py-2 text-sm bg-sky-blue-50 dark:bg-warm-gray-800 border-warm-gray-200 dark:border-warm-gray-700 focus:border-sky-blue-500 focus:ring-sky-blue-500 focus:outline-none ${
      stepErrors[fieldName] ? "border-destructive" : ""
    }`;

  const renderStep0 = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">{STEPS[0].description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={form.firstName}
            onChange={update("firstName")}
            placeholder="First name"
            className={inputClassName("firstName")}
          />
          {renderFieldError("firstName")}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={form.lastName}
            onChange={update("lastName")}
            placeholder="Last name"
            className={inputClassName("lastName")}
          />
          {renderFieldError("lastName")}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={update("email")}
          placeholder="your.email@example.com"
          className={inputClassName("email")}
        />
        {renderFieldError("email")}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number *</Label>
        <Input
          id="phoneNumber"
          value={form.phoneNumber}
          onChange={update("phoneNumber")}
          placeholder="(555) 123-4567"
          className={inputClassName("phoneNumber")}
        />
        {renderFieldError("phoneNumber")}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">{STEPS[1].description}</p>
      <div className="space-y-2">
        <Label htmlFor="streetAddress">Street Address *</Label>
        <Input
          id="streetAddress"
          value={form.streetAddress}
          onChange={update("streetAddress")}
          placeholder="123 Main St"
          className={inputClassName("streetAddress")}
        />
        {renderFieldError("streetAddress")}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={form.city}
            onChange={update("city")}
            placeholder="City"
            className={inputClassName("city")}
          />
          {renderFieldError("city")}
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={form.state}
            onChange={update("state")}
            placeholder="State"
            className={inputClassName("state")}
          />
          {renderFieldError("state")}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="housing">Housing Type *</Label>
        <select
          id="housing"
          value={form.housing}
          onChange={update("housing")}
          className={selectClassName("housing")}
        >
          <option value="">Select housing type...</option>
          <option value="House">House</option>
          <option value="Apartment">Apartment</option>
          <option value="Condo">Condo</option>
          <option value="Townhouse">Townhouse</option>
          <option value="Other">Other</option>
        </select>
        {renderFieldError("housing")}
      </div>
      <div className="space-y-2">
        <Label htmlFor="housingType">Do you own or rent? *</Label>
        <select
          id="housingType"
          value={form.housingType}
          onChange={update("housingType")}
          className={selectClassName("housingType")}
        >
          <option value="">Select...</option>
          <option value="Own">Own</option>
          <option value="Rent">Rent</option>
        </select>
        {renderFieldError("housingType")}
      </div>
      <div className="space-y-2">
        <Label htmlFor="activityLevel">Activity Level</Label>
        <select
          id="activityLevel"
          value={form.activityLevel}
          onChange={update("activityLevel")}
          className={selectClassName("activityLevel")}
        >
          <option value="">Select activity level...</option>
          <option value="Low">Low - Quiet household</option>
          <option value="Moderate">Moderate - Some activity</option>
          <option value="High">High - Very active household</option>
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">{STEPS[2].description}</p>
      <div className="bg-sky-blue-50 dark:bg-warm-gray-800 rounded-xl p-4 sm:p-5 space-y-3">
        <h3 className="font-semibold text-foreground border-b border-warm-gray-200 dark:border-warm-gray-700 pb-2 flex items-center gap-2">
          <User className="h-4 w-4 text-sky-blue-500" />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span>
            <p className="text-foreground font-medium">
              {form.firstName} {form.lastName}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>
            <p className="text-foreground font-medium">{form.email}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Phone:</span>
            <p className="text-foreground font-medium">{form.phoneNumber}</p>
          </div>
        </div>
      </div>
      <div className="bg-salmon-50 dark:bg-warm-gray-800 rounded-xl p-4 sm:p-5 space-y-3">
        <h3 className="font-semibold text-foreground border-b border-warm-gray-200 dark:border-warm-gray-700 pb-2 flex items-center gap-2">
          <Home className="h-4 w-4 text-salmon-500" />
          Housing Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="sm:col-span-2">
            <span className="text-muted-foreground">Address:</span>
            <p className="text-foreground font-medium">
              {form.streetAddress}, {form.city}, {form.state}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Housing:</span>
            <p className="text-foreground font-medium">
              {form.housing} ({form.housingType})
            </p>
          </div>
          {form.activityLevel && (
            <div>
              <span className="text-muted-foreground">Activity Level:</span>
              <p className="text-foreground font-medium">{form.activityLevel}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Mutation<CreateApplicationResponse>
      mutation={CREATE_APPLICATION}
      onCompleted={() => {
        setMessage("Application Successfully Submitted");
      }}
    >
      {(createApplication, { loading, error }) => {
        if (loading) {
          return (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-sky-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-foreground font-capriola">Submitting your application...</p>
              </div>
            </div>
          );
        }

        const errorMessage = error?.graphQLErrors?.[0]?.message || "";

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
              {message && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center mb-4">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-green-700 dark:text-green-400 text-lg font-capriola">
                    {message}
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">
                    We'll be in touch with you soon!
                  </p>
                </div>
              )}
              {errorMessage && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 text-center mb-4">
                  {errorMessage}
                </div>
              )}

              {!message && (
                <>
                  {renderStepIndicator()}

                  <form
                    onSubmit={(e: FormEvent) => {
                      e.preventDefault();
                      if (currentStep === 2) {
                        createApplication({
                          variables: {
                            animalId: form.animalId,
                            userId: form.userId,
                            applicationData: JSON.stringify({
                              firstName: form.firstName,
                              lastName: form.lastName,
                              email: form.email,
                              phoneNumber: form.phoneNumber,
                              streetAddress: form.streetAddress,
                              city: form.city,
                              state: form.state,
                              housing: form.housing,
                              housingType: form.housingType,
                              activityLevel: form.activityLevel,
                            }),
                          },
                        });
                      }
                    }}
                  >
                    {currentStep === 0 && renderStep0()}
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}

                    <div className="flex justify-between mt-8 pt-6 border-t border-warm-gray-200 dark:border-warm-gray-700">
                      {currentStep > 0 ? (
                        <Button type="button" variant="outline" onClick={prevStep} className="gap-2">
                          <ArrowLeft className="h-4 w-4" />
                          <span className="hidden sm:inline">Back</span>
                        </Button>
                      ) : (
                        <div />
                      )}
                      {currentStep < 2 ? (
                        <Button type="button" variant="skyBlue" onClick={nextStep} className="gap-2">
                          <span className="hidden sm:inline">Next</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="salmon" type="submit" className="gap-2">
                          <CheckCircle2 className="h-4 w-4" />
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
      }}
    </Mutation>
  );
};

export default withRouter(NewApplication);
