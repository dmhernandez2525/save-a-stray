import React, { Component, FormEvent } from "react";
import { Mutation } from "@apollo/client/react/components";
import { ApolloClient, NormalizedCacheObject, FetchResult } from "@apollo/client";
import Mutations from "../graphql/mutations";
import Queries from "../graphql/queries";
import { Link } from "react-router-dom";
import { withRouter, WithRouterProps } from "../util/withRouter";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LoginResponse, LoginFormState } from "../types";

const { LOGIN_USER } = Mutations;
const { IS_LOGGED_IN, USER_ID } = Queries;

interface LoginProps extends WithRouterProps {}

interface LoginState extends LoginFormState {}

class Login extends Component<LoginProps, LoginState> {
  constructor(props: LoginProps) {
    super(props);
    this.state = {
      email: "",
      password: "",
    };
  }

  update(field: keyof LoginState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      this.setState({ [field]: e.target.value } as Pick<LoginState, keyof LoginState>);
  }

  updateCache(
    client: ApolloClient<NormalizedCacheObject>,
    { data }: FetchResult<LoginResponse>
  ) {
    if (data?.login) {
      client.writeQuery({
        query: IS_LOGGED_IN,
        data: { isLoggedIn: data.login.loggedIn },
      });
      client.writeQuery({
        query: USER_ID,
        data: { userId: data.login._id },
      });
    }
  }

  render() {
    return (
      <Mutation<LoginResponse>
        mutation={LOGIN_USER}
        onCompleted={(data) => {
          const { token } = data.login;
          localStorage.setItem("auth-token", token);
          this.props.history.push("/Landing");
        }}
        update={(client, data) => this.updateCache(client, data)}
      >
        {(loginUser, { loading, error }) => {
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
                    Login
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
                      loginUser({
                        variables: {
                          email: this.state.email,
                          password: this.state.password,
                        },
                      });
                    }}
                  >
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
                      Log In
                    </Button>
                  </form>

                  <form
                    className="mt-4"
                    onSubmit={(e: FormEvent) => {
                      e.preventDefault();
                      loginUser({
                        variables: {
                          email: "demo@demo.com",
                          password: "hunter12",
                        },
                      });
                    }}
                  >
                    <Button variant="salmon" size="lg" type="submit" className="w-full">
                      DEMO
                    </Button>
                  </form>

                  <p className="text-salmon text-center mt-4 text-sm">
                    Don't have an account?{" "}
                    <Link to="/register" className="underline hover:text-sky-blue">
                      Click here to sign up.
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </div>
          );
        }}
      </Mutation>
    );
  }
}

export default withRouter(Login);
