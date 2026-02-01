import React, { useState, FormEvent } from "react";
import { Mutation } from "@apollo/client/react/components";
import { ApolloCache, FetchResult } from "@apollo/client";
import Mutations from "../graphql/mutations";
import Queries from "../graphql/queries";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { LoginResponse } from "../types";
import { PawPrint, ArrowLeft, Mail, Lock, Heart, Sparkles } from "lucide-react";
import { isDemoMode } from "../config/env";
import DemoRoleSelector from "../demo/DemoRoleSelector";

const { LOGIN_USER } = Mutations;
const { IS_LOGGED_IN, USER_ID } = Queries;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showDemoSelector, setShowDemoSelector] = useState(isDemoMode());
  const demoModeEnabled = isDemoMode();

  const updateCache = (
    cache: ApolloCache<unknown>,
    { data }: FetchResult<LoginResponse>
  ) => {
    if (data?.login) {
      cache.writeQuery({
        query: IS_LOGGED_IN,
        data: { isLoggedIn: data.login.loggedIn },
      });
      cache.writeQuery({
        query: USER_ID,
        data: { userId: data.login._id },
      });
    }
  };

  return (
    <Mutation<LoginResponse>
      mutation={LOGIN_USER}
      onCompleted={(data) => {
        const { token } = data.login;
        localStorage.setItem("auth-token", token);
        navigate("/Landing");
      }}
      update={(cache, data) => updateCache(cache, data)}
    >
      {(loginUser, { loading, error }) => {
        const errorMessage = error?.graphQLErrors?.[0]?.message || "";

        return (
          <div className="min-h-screen flex col-start-1 col-end-6 row-start-1 row-end-4">
            {/* Left Side - Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-20 bg-background">
              <div className="w-full max-w-md mx-auto">
                {/* Back Link */}
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to home
                </Link>

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 mb-8">
                  <PawPrint className="h-10 w-10 text-sky-blue-500" />
                  <span className="font-capriola text-2xl text-foreground">
                    Save Your Stray
                  </span>
                </Link>

                {/* Form Card */}
                <Card variant="ghost" className="border-none shadow-none p-0">
                  <CardHeader className="px-0">
                    <CardTitle className="text-3xl font-capriola">Welcome back</CardTitle>
                    <CardDescription className="text-base">
                      Sign in to continue finding your perfect companion
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    {errorMessage && (
                      <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 mb-6">
                        {errorMessage}
                      </div>
                    )}

                    <form
                      className="space-y-5"
                      onSubmit={(e: FormEvent) => {
                        e.preventDefault();
                        loginUser({
                          variables: { email, password },
                        });
                      }}
                    >
                      <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-11"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="password">Password</Label>
                          <Link
                            to="#"
                            className="text-sm text-sky-blue-500 hover:text-sky-blue-600"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-11"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        variant="skyBlue"
                        size="lg"
                        type="submit"
                        className="w-full"
                        loading={loading}
                      >
                        Sign In
                      </Button>
                    </form>

                    <div className="relative my-6">
                      <Separator />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-sm text-muted-foreground">
                        or
                      </span>
                    </div>

                    {/* Demo Mode Section */}
                    {demoModeEnabled && showDemoSelector ? (
                      <DemoRoleSelector onClose={() => setShowDemoSelector(false)} />
                    ) : (
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onClick={() => {
                          if (demoModeEnabled) {
                            setShowDemoSelector(true);
                          } else {
                            loginUser({
                              variables: {
                                email: "demo@demo.com",
                                password: "hunter12",
                              },
                            });
                          }
                        }}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {demoModeEnabled ? "Try Demo Mode" : "Try Demo Account"}
                      </Button>
                    )}

                    <p className="text-center mt-6 text-muted-foreground">
                      Don't have an account?{" "}
                      <Link
                        to="/register"
                        className="text-sky-blue-500 hover:text-sky-blue-600 font-medium"
                      >
                        Sign up for free
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Side - Illustration */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-sky-blue-500 to-sky-blue-600 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute top-1/3 right-1/4 text-white/20">
                <PawPrint className="h-24 w-24 rotate-12" />
              </div>
              <div className="absolute bottom-1/3 left-1/4 text-white/20">
                <PawPrint className="h-16 w-16 -rotate-12" />
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center items-center p-12 text-white relative z-10">
                <div className="max-w-md text-center">
                  <Heart className="h-16 w-16 mx-auto mb-6 fill-white/20" />
                  <h2 className="font-capriola text-3xl mb-4">
                    Welcome Back, Animal Lover!
                  </h2>
                  <p className="text-white/90 text-lg leading-relaxed">
                    Your perfect companion is waiting. Sign in to continue your adoption journey and make a difference in an animal's life.
                  </p>
                </div>

                {/* Stats */}
                <div className="mt-12 grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="font-capriola text-4xl">500+</div>
                    <div className="text-white/80 text-sm">Happy Adoptions</div>
                  </div>
                  <div className="text-center">
                    <div className="font-capriola text-4xl">50+</div>
                    <div className="text-white/80 text-sm">Partner Shelters</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </Mutation>
  );
};

export default Login;
