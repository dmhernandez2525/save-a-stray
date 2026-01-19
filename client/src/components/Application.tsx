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

interface ApplicationProps extends WithRouterProps {
  animalId?: string;
}

interface ApplicationState extends ApplicationFormState {}

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
    };
    this.submitApp = this.submitApp.bind(this);
  }

  update(field: keyof ApplicationState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      this.setState({ [field]: e.target.value } as Pick<ApplicationState, keyof ApplicationState>);
  }

  submitApp() {
    this.setState({ message: "Application Successfully Submitted" });
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
                Loading...
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
                <form
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  onSubmit={(e: FormEvent) => {
                    e.preventDefault();
                    createApplication({
                      variables: {
                        animalId: this.state.animalId,
                        userId: this.state.userId,
                        applicationData: `firstName: ${this.state.firstName}
                          lastName: ${this.state.lastName}
                          streetAddress: ${this.state.streetAddress}
                          city: ${this.state.city}
                          state: ${this.state.state}
                          email: ${this.state.email}
                          phoneNumber: ${this.state.phoneNumber}
                          housing: ${this.state.housing}
                          housingType: ${this.state.housingType}
                          activityLevel: ${this.state.activityLevel}`,
                      },
                    });
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={this.state.firstName}
                      onChange={this.update("firstName")}
                      placeholder="First name"
                      className="bg-blue-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={this.state.lastName}
                      onChange={this.update("lastName")}
                      placeholder="Last name"
                      className="bg-blue-50"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="streetAddress">Street Address</Label>
                    <Input
                      id="streetAddress"
                      value={this.state.streetAddress}
                      onChange={this.update("streetAddress")}
                      placeholder="Street address"
                      className="bg-blue-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={this.state.city}
                      onChange={this.update("city")}
                      placeholder="City"
                      className="bg-blue-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={this.state.state}
                      onChange={this.update("state")}
                      placeholder="State"
                      className="bg-blue-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={this.state.email}
                      onChange={this.update("email")}
                      placeholder="Email"
                      className="bg-blue-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={this.state.phoneNumber}
                      onChange={this.update("phoneNumber")}
                      placeholder="Phone number"
                      className="bg-blue-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="housing">Housing Type</Label>
                    <Input
                      id="housing"
                      value={this.state.housing}
                      onChange={this.update("housing")}
                      placeholder="What type of house do you live in?"
                      className="bg-blue-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="housingType">Own or Rent</Label>
                    <Input
                      id="housingType"
                      value={this.state.housingType}
                      onChange={this.update("housingType")}
                      placeholder="Do you rent or own?"
                      className="bg-blue-50"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="activityLevel">Activity Level</Label>
                    <Input
                      id="activityLevel"
                      value={this.state.activityLevel}
                      onChange={this.update("activityLevel")}
                      placeholder="What is your general noise and activity level?"
                      className="bg-blue-50"
                    />
                  </div>
                  <div className="md:col-span-2 mt-4">
                    <Button variant="salmon" size="lg" type="submit" className="w-full">
                      Submit Application
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          );
        }}
      </Mutation>
    );
  }
}

export default withRouter(NewApplication);
