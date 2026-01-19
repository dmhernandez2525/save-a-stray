import React, { Component, FormEvent } from "react";
import { Mutation } from "@apollo/client/react/components";
import Mutations from "../graphql/mutations";
import { Link } from "react-router-dom";
import { withRouter, WithRouterProps } from "../util/withRouter";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { CreateShelterResponse, ShelterFormState } from "../types";

const { CREATE_SHELTER } = Mutations;

interface ShelterProps extends WithRouterProps {}

interface ShelterState extends ShelterFormState {}

class NewShelter extends Component<ShelterProps, ShelterState> {
  constructor(props: ShelterProps) {
    super(props);
    this.state = {
      name: "",
      location: "",
      users: "",
      paymentEmail: "",
      animals: "",
    };
  }

  update(field: keyof ShelterState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      this.setState({ [field]: e.target.value } as Pick<ShelterState, keyof ShelterState>);
  }

  render() {
    return (
      <Mutation<CreateShelterResponse>
        mutation={CREATE_SHELTER}
        onCompleted={(data) => {
          localStorage.setItem("Shelter", JSON.stringify(data.newShelter));
          this.props.history.push(`/RegisterShelter/${data.newShelter._id}`);
        }}
      >
        {(createShelter, { loading, error }) => {
          if (loading)
            return (
              <p className="text-white font-capriola animate-pulse">
                Loading...
              </p>
            );

          return (
            <div className="fixed inset-0 bg-sky-blue/80 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md bg-white">
                <CardHeader className="relative">
                  <Link
                    to="/"
                    className="absolute right-4 top-4 text-sky-blue text-4xl font-capriola hover:text-salmon transition-colors"
                  >
                    X
                  </Link>
                  <CardTitle className="text-sky-blue font-capriola text-3xl text-center underline">
                    Shelter Signup
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    className="flex flex-col gap-4"
                    onSubmit={(e: FormEvent) => {
                      e.preventDefault();
                      createShelter({
                        variables: {
                          name: this.state.name,
                          location: this.state.location,
                          paymentEmail: this.state.paymentEmail,
                        },
                      });
                    }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="name">Shelter Name</Label>
                      <Input
                        id="name"
                        value={this.state.name}
                        onChange={this.update("name")}
                        placeholder="Shelter name"
                        className="bg-blue-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={this.state.location}
                        onChange={this.update("location")}
                        placeholder="Location"
                        className="bg-blue-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentEmail">Shelter Email</Label>
                      <Input
                        id="paymentEmail"
                        type="email"
                        value={this.state.paymentEmail}
                        onChange={this.update("paymentEmail")}
                        placeholder="Shelter email"
                        className="bg-blue-50"
                      />
                    </div>
                    <Button variant="salmon" size="lg" type="submit" className="w-full mt-4">
                      Create Shelter
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          );
        }}
      </Mutation>
    );
  }
}

export default withRouter(NewShelter);
