import React, { useState } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { ApolloConsumer, ApolloClient } from "@apollo/client";
import { Link } from "react-router-dom";
import { withRouter, WithRouterProps } from "../util/withRouter";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";
import { FetchUserResponse, UserIdData } from "../types";
import { ArrowLeft, User, Settings, Building2, Calendar, Mail, Edit2, X, Check } from "lucide-react";

const { FETCH_USER, USER_ID } = Queries;
const { UPDATE_USER } = Mutations;

type UserSettingsProps = WithRouterProps;

const UserSettings: React.FC<UserSettingsProps> = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  const startEditing = (currentName: string, currentEmail: string) => {
    setName(currentName);
    setEmail(currentEmail);
    setEditing(true);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-background col-start-1 col-end-6 row-start-1 row-end-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-blue-500 to-sky-blue-600 text-white">
        <div className="container-wide py-8 md:py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-capriola text-3xl md:text-4xl">Settings</h1>
              <p className="text-white/90">Manage your account preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-tight py-8 px-4">
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
                <Card className="max-w-md mx-auto">
                  <CardContent className="text-center py-12">
                    <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h2 className="font-capriola text-xl mb-2">Not Logged In</h2>
                    <p className="text-muted-foreground mb-6">
                      Please log in to access your settings.
                    </p>
                    <Button variant="skyBlue" asChild>
                      <Link to="/login">Log In</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Query<FetchUserResponse> query={FETCH_USER} variables={{ _id: userId }}>
                {({ loading, error, data }) => {
                  if (loading) {
                    return (
                      <div className="max-w-2xl mx-auto space-y-6">
                        <Card>
                          <CardHeader>
                            <Skeleton className="h-6 w-40" />
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-32" />
                          </CardContent>
                        </Card>
                      </div>
                    );
                  }

                  if (error || !data?.user) {
                    return (
                      <Card className="max-w-md mx-auto">
                        <CardContent className="text-center py-12">
                          <div className="w-12 h-12 rounded-full bg-destructive/10 mx-auto mb-4 flex items-center justify-center">
                            <X className="h-6 w-6 text-destructive" />
                          </div>
                          <h2 className="font-capriola text-xl mb-2">Error</h2>
                          <p className="text-muted-foreground">
                            Unable to load user data. Please try again.
                          </p>
                        </CardContent>
                      </Card>
                    );
                  }

                  const user = data.user;

                  return (
                    <div className="max-w-2xl mx-auto space-y-6">
                      {message && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl p-4 flex items-center gap-3">
                          <Check className="h-5 w-5 flex-shrink-0" />
                          <span className="font-medium">{message}</span>
                        </div>
                      )}

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-sky-blue-600 dark:text-sky-blue-400 font-capriola text-lg flex items-center gap-2">
                              <User className="h-5 w-5" />
                              Profile Information
                            </CardTitle>
                            <CardDescription>Your personal details</CardDescription>
                          </div>
                          {!editing && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(user.name, user.email)}
                              className="gap-2"
                            >
                              <Edit2 className="h-4 w-4" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                          )}
                        </CardHeader>
                        <CardContent>
                          {editing ? (
                            <Mutation
                              mutation={UPDATE_USER}
                              refetchQueries={[{ query: FETCH_USER, variables: { _id: userId } }]}
                              onCompleted={() => {
                                setEditing(false);
                                setMessage("Profile updated successfully.");
                              }}
                            >
                              {(updateUser: (opts: { variables: Record<string, string> }) => void) => (
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="settings-name">Name</Label>
                                    <Input
                                      id="settings-name"
                                      value={name}
                                      onChange={(e) => setName(e.target.value)}
                                      className="bg-sky-blue-50 dark:bg-warm-gray-800"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="settings-email">Email</Label>
                                    <Input
                                      id="settings-email"
                                      type="email"
                                      value={email}
                                      onChange={(e) => setEmail(e.target.value)}
                                      className="bg-sky-blue-50 dark:bg-warm-gray-800"
                                    />
                                  </div>
                                  <div className="flex gap-3 pt-2">
                                    <Button
                                      variant="salmon"
                                      onClick={() =>
                                        updateUser({
                                          variables: { _id: userId, name, email },
                                        })
                                      }
                                      className="gap-2"
                                    >
                                      <Check className="h-4 w-4" />
                                      Save Changes
                                    </Button>
                                    <Button variant="outline" onClick={() => setEditing(false)}>
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </Mutation>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex items-start gap-3 p-3 bg-warm-gray-50 dark:bg-warm-gray-800/50 rounded-lg">
                                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                    Name
                                  </p>
                                  <p className="font-medium text-foreground">{user.name}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3 p-3 bg-warm-gray-50 dark:bg-warm-gray-800/50 rounded-lg">
                                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                    Email
                                  </p>
                                  <p className="font-medium text-foreground">{user.email}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3 p-3 bg-warm-gray-50 dark:bg-warm-gray-800/50 rounded-lg">
                                <Settings className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                    Role
                                  </p>
                                  <p className="font-medium text-foreground capitalize">
                                    {user.userRole === "endUser" ? "Adopter" : "Shelter Staff"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sky-blue-600 dark:text-sky-blue-400 font-capriola text-lg flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Account
                          </CardTitle>
                          <CardDescription>Account information and activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 bg-warm-gray-50 dark:bg-warm-gray-800/50 rounded-lg">
                              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                  Member Since
                                </p>
                                <p className="font-medium text-foreground">
                                  {new Date().toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                  })}
                                </p>
                              </div>
                            </div>
                            {user.shelter && (
                              <div className="flex items-start gap-3 p-3 bg-salmon-50 dark:bg-salmon-900/20 rounded-lg">
                                <Building2 className="h-5 w-5 text-salmon-500 mt-0.5" />
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                    Shelter
                                  </p>
                                  <p className="font-medium text-foreground">{user.shelter.name}</p>
                                </div>
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
      </div>
    </div>
  );
};

export default withRouter(UserSettings);
