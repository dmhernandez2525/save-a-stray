import React, { Component } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { ApolloConsumer, ApolloClient } from "@apollo/client";
import { withRouter, WithRouterProps } from "../util/withRouter";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";
import { FetchUserResponse, UserIdData } from "../types";

const { FETCH_USER, USER_ID } = Queries;
const { UPDATE_USER } = Mutations;

interface UserSettingsProps extends WithRouterProps {}

interface UserSettingsState {
  name: string;
  email: string;
  editing: boolean;
  message: string;
}

class UserSettings extends Component<UserSettingsProps, UserSettingsState> {
  constructor(props: UserSettingsProps) {
    super(props);
    this.state = { name: "", email: "", editing: false, message: "" };
  }

  startEditing(currentName: string, currentEmail: string) {
    this.setState({ name: currentName, email: currentEmail, editing: true, message: "" });
  }

  render() {
    return (
      <ApolloConsumer>
        {(client: ApolloClient<object>) => {
          let userId = "";
          try {
            const data = client.readQuery<UserIdData>({ query: USER_ID });
            userId = data?.userId || "";
          } catch {
            userId = "";
          }

          if (!userId) {
            return (
              <div className="max-w-2xl mx-auto p-4">
                <Card className="bg-white">
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">Please log in to access settings.</p>
                  </CardContent>
                </Card>
              </div>
            );
          }

          return (
            <Query<FetchUserResponse> query={FETCH_USER} variables={{ _id: userId }}>
              {({ loading, error, data }) => {
                if (loading) return <p className="text-white font-capriola animate-pulse text-center mt-8">Loading...</p>;
                if (error || !data?.user) return <p className="text-red-500 text-center mt-8">Error loading user data</p>;

                const user = data.user;

                return (
                  <div className="max-w-2xl mx-auto p-4">
                    <h1 className="text-white font-capriola text-3xl mb-6">Settings</h1>

                    {this.state.message && (
                      <div className="bg-green-100 text-green-800 rounded-lg p-3 mb-4 text-sm font-medium">
                        {this.state.message}
                      </div>
                    )}

                    <Card className="bg-white mb-6">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sky-blue font-capriola text-lg">Profile Information</CardTitle>
                        {!this.state.editing && (
                          <Button variant="ghost" size="sm" onClick={() => this.startEditing(user.name, user.email)}>
                            Edit
                          </Button>
                        )}
                      </CardHeader>
                      <CardContent>
                        {this.state.editing ? (
                          <Mutation
                            mutation={UPDATE_USER}
                            refetchQueries={[{ query: FETCH_USER, variables: { _id: userId } }]}
                            onCompleted={() => this.setState({ editing: false, message: "Profile updated successfully." })}
                          >
                            {(updateUser: (opts: { variables: Record<string, string> }) => void) => (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="settings-name">Name</Label>
                                  <Input
                                    id="settings-name"
                                    value={this.state.name}
                                    onChange={(e) => this.setState({ name: e.target.value })}
                                    className="bg-blue-50"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="settings-email">Email</Label>
                                  <Input
                                    id="settings-email"
                                    type="email"
                                    value={this.state.email}
                                    onChange={(e) => this.setState({ email: e.target.value })}
                                    className="bg-blue-50"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="salmon" onClick={() => updateUser({
                                    variables: { _id: userId, name: this.state.name, email: this.state.email }
                                  })}>Save</Button>
                                  <Button variant="outline" onClick={() => this.setState({ editing: false })}>Cancel</Button>
                                </div>
                              </div>
                            )}
                          </Mutation>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase">Name</p>
                              <p className="font-medium text-gray-800">{user.name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase">Email</p>
                              <p className="font-medium text-gray-800">{user.email}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase">Role</p>
                              <p className="font-medium text-gray-800 capitalize">{user.userRole === 'endUser' ? 'Adopter' : 'Shelter Staff'}</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="bg-white">
                      <CardHeader>
                        <CardTitle className="text-sky-blue font-capriola text-lg">Account</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">Member Since</p>
                            <p className="font-medium text-gray-800">
                              {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                            </p>
                          </div>
                          {user.shelter && (
                            <div>
                              <p className="text-xs text-muted-foreground uppercase">Shelter</p>
                              <p className="font-medium text-gray-800">{user.shelter.name}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              }}
            </Query>
          );
        }}
      </ApolloConsumer>
    );
  }
}

export default withRouter(UserSettings);
