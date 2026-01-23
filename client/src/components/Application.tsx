import React, { Component, FormEvent } from "react";
import { Mutation } from "@apollo/client/react/components";
import Mutations from "../graphql/mutations";
import { withRouter, WithRouterProps } from "../util/withRouter";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { CreateApplicationResponse, ApplicationFormState } from "../types";

const { CREATE_APPLICATION } = Mutations;

const STEPS = [
  { title: "Personal Information", description: "Tell us about yourself" },
  { title: "Housing Details", description: "About your living situation" },
  { title: "Review & Submit", description: "Confirm your application" },
];

interface ApplicationProps extends WithRouterProps {
  animalId?: string;
}

interface ApplicationState extends ApplicationFormState {
  currentStep: number;
  stepErrors: Record<string, string>;
}

class NewApplication extends Component<ApplicationProps, ApplicationState> {
  constructor(props: ApplicationProps) {
    super(props);
    this.state = {
      animalId: props.animalId || "",
      userId: "",
      applicationData: "",
      firstName: "",
      lastName: "",
      streetAddress: "",
      city: "",
      state: "",
      email: "",
      phoneNumber: "",
      housing: "",
      housingType: "",
      message: "",
      activityLevel: "",
      currentStep: 0,
      stepErrors: {},
    };
    this.submitApp = this.submitApp.bind(this);
  }

  update(field: keyof ApplicationFormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      this.setState({
        [field]: e.target.value,
        stepErrors: {},
      } as unknown as Pick<ApplicationState, keyof ApplicationState>);
  }

  validateStep(step: number): boolean {
    const errors: Record<string, string> = {};

    if (step === 0) {
      if (!this.state.firstName.trim()) errors.firstName = "First name is required";
      if (!this.state.lastName.trim()) errors.lastName = "Last name is required";
      if (!this.state.email.trim()) errors.email = "Email is required";
      if (this.state.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.email)) {
        errors.email = "Please enter a valid email";
      }
      if (!this.state.phoneNumber.trim()) errors.phoneNumber = "Phone number is required";
    }

    if (step === 1) {
      if (!this.state.streetAddress.trim()) errors.streetAddress = "Street address is required";
      if (!this.state.city.trim()) errors.city = "City is required";
      if (!this.state.state.trim()) errors.state = "State is required";
      if (!this.state.housing.trim()) errors.housing = "Housing type is required";
      if (!this.state.housingType.trim()) errors.housingType = "Own/Rent is required";
    }

    if (Object.keys(errors).length > 0) {
      this.setState({ stepErrors: errors });
      return false;
    }
    return true;
  }

  nextStep = () => {
    if (this.validateStep(this.state.currentStep)) {
      this.setState((prev) => ({ currentStep: prev.currentStep + 1 }));
    }
  };

  prevStep = () => {
    this.setState((prev) => ({
      currentStep: Math.max(0, prev.currentStep - 1),
      stepErrors: {},
    }));
  };

  submitApp() {
    this.setState({ message: "Application Successfully Submitted" });
  }

  renderStepIndicator() {
    return (
      <div className="flex items-center justify-between mb-6">
        {STEPS.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index < this.state.currentStep
                    ? "bg-green-500 text-white"
                    : index === this.state.currentStep
                    ? "bg-sky-blue text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {index < this.state.currentStep ? "\u2713" : index + 1}
              </div>
              <p className="text-xs mt-1 text-gray-600 text-center hidden sm:block">
                {step.title}
              </p>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 ${
                  index < this.state.currentStep ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  renderFieldError(field: string) {
    const error = this.state.stepErrors[field];
    if (!error) return null;
    return <p className="text-red-500 text-xs mt-1">{error}</p>;
  }

  renderStep0() {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          {STEPS[0].description}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={this.state.firstName}
              onChange={this.update("firstName")}
              placeholder="First name"
              className={`bg-blue-50 ${this.state.stepErrors.firstName ? "border-red-500" : ""}`}
            />
            {this.renderFieldError("firstName")}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={this.state.lastName}
              onChange={this.update("lastName")}
              placeholder="Last name"
              className={`bg-blue-50 ${this.state.stepErrors.lastName ? "border-red-500" : ""}`}
            />
            {this.renderFieldError("lastName")}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={this.state.email}
            onChange={this.update("email")}
            placeholder="your.email@example.com"
            className={`bg-blue-50 ${this.state.stepErrors.email ? "border-red-500" : ""}`}
          />
          {this.renderFieldError("email")}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number *</Label>
          <Input
            id="phoneNumber"
            value={this.state.phoneNumber}
            onChange={this.update("phoneNumber")}
            placeholder="(555) 123-4567"
            className={`bg-blue-50 ${this.state.stepErrors.phoneNumber ? "border-red-500" : ""}`}
          />
          {this.renderFieldError("phoneNumber")}
        </div>
      </div>
    );
  }

  renderStep1() {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          {STEPS[1].description}
        </p>
        <div className="space-y-2">
          <Label htmlFor="streetAddress">Street Address *</Label>
          <Input
            id="streetAddress"
            value={this.state.streetAddress}
            onChange={this.update("streetAddress")}
            placeholder="123 Main St"
            className={`bg-blue-50 ${this.state.stepErrors.streetAddress ? "border-red-500" : ""}`}
          />
          {this.renderFieldError("streetAddress")}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={this.state.city}
              onChange={this.update("city")}
              placeholder="City"
              className={`bg-blue-50 ${this.state.stepErrors.city ? "border-red-500" : ""}`}
            />
            {this.renderFieldError("city")}
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              value={this.state.state}
              onChange={this.update("state")}
              placeholder="State"
              className={`bg-blue-50 ${this.state.stepErrors.state ? "border-red-500" : ""}`}
            />
            {this.renderFieldError("state")}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="housing">Housing Type *</Label>
          <select
            id="housing"
            value={this.state.housing}
            onChange={this.update("housing") as unknown as React.ChangeEventHandler<HTMLSelectElement>}
            className={`flex h-10 w-full rounded-md border border-input bg-blue-50 px-3 py-2 text-sm ${
              this.state.stepErrors.housing ? "border-red-500" : ""
            }`}
          >
            <option value="">Select housing type...</option>
            <option value="House">House</option>
            <option value="Apartment">Apartment</option>
            <option value="Condo">Condo</option>
            <option value="Townhouse">Townhouse</option>
            <option value="Other">Other</option>
          </select>
          {this.renderFieldError("housing")}
        </div>
        <div className="space-y-2">
          <Label htmlFor="housingType">Do you own or rent? *</Label>
          <select
            id="housingType"
            value={this.state.housingType}
            onChange={this.update("housingType") as unknown as React.ChangeEventHandler<HTMLSelectElement>}
            className={`flex h-10 w-full rounded-md border border-input bg-blue-50 px-3 py-2 text-sm ${
              this.state.stepErrors.housingType ? "border-red-500" : ""
            }`}
          >
            <option value="">Select...</option>
            <option value="Own">Own</option>
            <option value="Rent">Rent</option>
          </select>
          {this.renderFieldError("housingType")}
        </div>
        <div className="space-y-2">
          <Label htmlFor="activityLevel">Activity Level</Label>
          <select
            id="activityLevel"
            value={this.state.activityLevel}
            onChange={this.update("activityLevel") as unknown as React.ChangeEventHandler<HTMLSelectElement>}
            className="flex h-10 w-full rounded-md border border-input bg-blue-50 px-3 py-2 text-sm"
          >
            <option value="">Select activity level...</option>
            <option value="Low">Low - Quiet household</option>
            <option value="Moderate">Moderate - Some activity</option>
            <option value="High">High - Very active household</option>
          </select>
        </div>
      </div>
    );
  }

  renderStep2() {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          {STEPS[2].description}
        </p>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>
              <p className="text-gray-800 font-medium">{this.state.firstName} {this.state.lastName}</p>
            </div>
            <div>
              <span className="text-gray-500">Email:</span>
              <p className="text-gray-800 font-medium">{this.state.email}</p>
            </div>
            <div>
              <span className="text-gray-500">Phone:</span>
              <p className="text-gray-800 font-medium">{this.state.phoneNumber}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-gray-800 border-b pb-2">Housing Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Address:</span>
              <p className="text-gray-800 font-medium">
                {this.state.streetAddress}, {this.state.city}, {this.state.state}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Housing:</span>
              <p className="text-gray-800 font-medium">{this.state.housing} ({this.state.housingType})</p>
            </div>
            {this.state.activityLevel && (
              <div>
                <span className="text-gray-500">Activity Level:</span>
                <p className="text-gray-800 font-medium">{this.state.activityLevel}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <Mutation<CreateApplicationResponse>
        mutation={CREATE_APPLICATION}
        onCompleted={() => {
          this.submitApp();
        }}
      >
        {(createApplication, { loading, error }) => {
          if (loading)
            return (
              <p className="text-white font-capriola animate-pulse">
                Submitting...
              </p>
            );

          const errorMessage = error?.graphQLErrors?.[0]?.message || "";

          return (
            <Card className="w-full max-w-2xl mx-auto bg-white">
              <CardHeader>
                <CardTitle className="text-sky-blue font-capriola text-2xl text-center">
                  Application for Adoption
                </CardTitle>
              </CardHeader>
              <CardContent>
                {this.state.message && (
                  <p className="text-green-500 text-center mb-4 text-lg font-capriola">
                    {this.state.message}
                  </p>
                )}
                {errorMessage && (
                  <p className="text-red-500 text-center mb-4">
                    {errorMessage}
                  </p>
                )}

                {!this.state.message && (
                  <>
                    {this.renderStepIndicator()}

                    <form
                      onSubmit={(e: FormEvent) => {
                        e.preventDefault();
                        if (this.state.currentStep === 2) {
                          createApplication({
                            variables: {
                              animalId: this.state.animalId,
                              userId: this.state.userId,
                              applicationData: JSON.stringify({
                                firstName: this.state.firstName,
                                lastName: this.state.lastName,
                                email: this.state.email,
                                phoneNumber: this.state.phoneNumber,
                                streetAddress: this.state.streetAddress,
                                city: this.state.city,
                                state: this.state.state,
                                housing: this.state.housing,
                                housingType: this.state.housingType,
                                activityLevel: this.state.activityLevel,
                              }),
                            },
                          });
                        }
                      }}
                    >
                      {this.state.currentStep === 0 && this.renderStep0()}
                      {this.state.currentStep === 1 && this.renderStep1()}
                      {this.state.currentStep === 2 && this.renderStep2()}

                      <div className="flex justify-between mt-6">
                        {this.state.currentStep > 0 ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={this.prevStep}
                          >
                            Back
                          </Button>
                        ) : (
                          <div />
                        )}
                        {this.state.currentStep < 2 ? (
                          <Button
                            type="button"
                            variant="salmon"
                            onClick={this.nextStep}
                          >
                            Next
                          </Button>
                        ) : (
                          <Button variant="salmon" type="submit">
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
  }
}

export default withRouter(NewApplication);
