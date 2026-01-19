import React, { Component, FormEvent } from "react";
import { Mutation } from "@apollo/client/react/components";
import { ApolloConsumer, ApolloClient, ApolloCache, FetchResult } from "@apollo/client";
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

interface RegisterProps extends WithRouterProps {}

interface RegisterState extends RegisterFormState {}

class Register extends Component<RegisterProps, RegisterState> {
  constructor(props: RegisterProps) {
    super(props);
    this.state = {
      userRole: "",
      name: "",
      email: "",
      password: "",
    };
  }

  update(field: keyof RegisterState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      this.setState({ [field]: e.target.value } as Pick<RegisterState, keyof RegisterState>);
  }

  updateCache(
    cache: ApolloCache<unknown>,
    { data }: FetchResult<RegisterResponse>
  ) {
    if (data?.register) {
      cache.writeQuery({
        query: IS_LOGGED_IN,
        data: { isLoggedIn: data.register.loggedIn },
      });
      cache.writeQuery({
        query: USER_ID,
        data: { userId: data.register._id },
      });
    }
  }

  render() {
    return (
      <ApolloConsumer>
        {(client: ApolloClient<object>) => (
          <Mutation<RegisterResponse>
            mutation={REGISTER_USER}
            onCompleted={(data) => {
              const { token } = data.register;
              localStorage.setItem("auth-token", token);
              this.props.history.push("/Landing");
            }}
            update={(cache, data) => this.updateCache(cache, data)}
          >
            {(registerUser, { loading, error }) => {
              if (loading)
                return (
                  <div className="flex items-center justify-center min-h-screen">
                    <p className="text-white font-capriola text-xl animate-pulse">
                      Loading...
                    </p>
                  </div>
                );

              const message = error?.graphQLErrors?.[0]?.message || "";

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
                      <CardTitle className="text-sky-blue font-capriola text-4xl text-center underline">
                        Signup
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {message && (
                        <p className="text-red-500 text-center mb-4 text-lg">
                          {message}
                        </p>
                      )}
                      <form
                        className="flex flex-col gap-4"
                        onSubmit={(e: FormEvent) => {
                          e.preventDefault();
                          registerUser({
                            variables: {
                              name: this.state.name,
                              userRole: "endUser",
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
                      <p className="text-salmon text-center mt-2 text-sm">
                        Already have an account?{" "}
                        <Link to="/login" className="underline hover:text-sky-blue">
                          Click here to login.
                        </Link>
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

export default withRouter(Register);
