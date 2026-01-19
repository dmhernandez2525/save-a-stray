import React, { Component, FormEvent } from "react";
import { Mutation } from "@apollo/client/react/components";
import { ApolloConsumer, ApolloClient, NormalizedCacheObject, FetchResult } from "@apollo/client";
import Mutations from "../graphql/mutations";
import Queries from "../graphql/queries";
import { Link } from "react-router-dom";
import { withRouter, WithRouterProps } from "../util/withRouter";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { RegisterResponse, RegisterFormState } from "../types";

const { REGISTER_USER } = Mutations;
const { IS_LOGGED_IN, USER_ID } = Queries;

interface RegisterShelterProps extends WithRouterProps {}

interface RegisterShelterState extends RegisterFormState {}

class RegisterShelter extends Component<RegisterShelterProps, RegisterShelterState> {
  constructor(props: RegisterShelterProps) {
    super(props);
    this.state = {
      userRole: "",
      name: "",
      email: "",
      password: "",
    };
  }

  update(field: keyof RegisterShelterState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      this.setState({ [field]: e.target.value } as Pick<RegisterShelterState, keyof RegisterShelterState>);
  }

  updateCache(
    client: ApolloClient<NormalizedCacheObject>,
    { data }: FetchResult<RegisterResponse>
  ) {
    if (data?.register) {
      client.writeQuery({
        query: IS_LOGGED_IN,
        data: { isLoggedIn: data.register.loggedIn },
      });
      client.writeQuery({
        query: USER_ID,
        data: { userId: data.register._id },
      });
    }
  }

  render() {
    return (
      <ApolloConsumer>
        {(client: ApolloClient<NormalizedCacheObject>) => (
          <Mutation<RegisterResponse>
            mutation={REGISTER_USER}
            onCompleted={(data) => {
              const { token } = data.register;
              localStorage.setItem("auth-token", token);
              this.props.history.push("/Landing");
            }}
            update={(client, data) => this.updateCache(client, data)}
          >
            {(registerUser, { loading, error }) => {
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
                        Admin User
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form
                        className="flex flex-col gap-4"
                        onSubmit={(e: FormEvent) => {
                          e.preventDefault();
                          registerUser({
                            variables: {
                              shelterId: this.props.match.params.id,
                              name: this.state.name,
                              userRole: "shelter",
                              email: this.state.email,
                              password: this.state.password,
                            },
                          });
                        }}
                      >
                        <Input
                          value={this.state.name}
                          onChange={this.update("name")}
                          placeholder="Name"
                          className="bg-blue-50"
                        />
                        <Input
                          value={this.state.email}
                          onChange={this.update("email")}
                          placeholder="Email"
                          type="email"
                          className="bg-blue-50"
                        />
                        <Input
                          value={this.state.password}
                          onChange={this.update("password")}
                          type="password"
                          placeholder="Password"
                          className="bg-blue-50"
                        />
                        <Button variant="salmon" size="lg" type="submit" className="w-full">
                          Register Account
                        </Button>
                      </form>
                      <p className="text-salmon text-center mt-4 text-sm">
                        By clicking "Sign Up" I agree to the Save A Stray{" "}
                        <a href="#/tos" className="underline hover:text-sky-blue">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#/privacy" className="underline hover:text-sky-blue">
                          Privacy Policy
                        </a>
                      </p>
                    </CardContent>
                  </Card>
                </div>
              );
            }}
          </Mutation>
        )}
      </ApolloConsumer>
    );
  }
}

export default withRouter(RegisterShelter);
