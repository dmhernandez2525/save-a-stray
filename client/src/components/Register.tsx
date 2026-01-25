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
import { RegisterResponse } from "../types";
import { PawPrint, ArrowLeft, Mail, Lock, User, Building2, MapPin, CreditCard, Heart, Users, CheckCircle2 } from "lucide-react";

const { REGISTER_USER } = Mutations;
const { IS_LOGGED_IN, USER_ID } = Queries;

type UserRole = "endUser" | "shelter";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole>("endUser");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shelterName, setShelterName] = useState("");
  const [shelterLocation, setShelterLocation] = useState("");
  const [shelterPaymentEmail, setShelterPaymentEmail] = useState("");

  const updateCache = (
    cache: ApolloCache<unknown>,
    { data }: FetchResult<RegisterResponse>
  ) => {
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
  };

  return (
    <Mutation<RegisterResponse>
      mutation={REGISTER_USER}
      onCompleted={(data) => {
        const { token } = data.register;
        localStorage.setItem("auth-token", token);
        navigate(userRole === "shelter" ? "/Shelter" : "/Landing");
      }}
      update={(cache, data) => updateCache(cache, data)}
    >
      {(registerUser, { loading, error }) => {
        const errorMessage = error?.graphQLErrors?.[0]?.message || "";

        return (
          <div className="min-h-screen flex col-start-1 col-end-6 row-start-1 row-end-4">
            {/* Left Side - Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-20 bg-background overflow-y-auto py-8">
              <div className="w-full max-w-lg mx-auto">
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
                    <CardTitle className="text-3xl font-capriola">Create your account</CardTitle>
                    <CardDescription className="text-base">
                      Join our community and help pets find their forever homes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    {errorMessage && (
                      <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 mb-6">
                        {errorMessage}
                      </div>
                    )}

                    {/* Role Selection */}
                    <div className="mb-6">
                      <Label className="text-base mb-3 block">I want to...</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setUserRole("endUser")}
                          className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                            userRole === "endUser"
                              ? "border-sky-blue-500 bg-sky-blue-50 dark:bg-sky-blue-950"
                              : "border-border hover:border-sky-blue-300 hover:bg-muted/50"
                          }`}
                        >
                          {userRole === "endUser" && (
                            <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-sky-blue-500" />
                          )}
                          <Heart className={`h-8 w-8 mb-2 ${userRole === "endUser" ? "text-sky-blue-500" : "text-muted-foreground"}`} />
                          <div className="font-semibold">Adopt a Pet</div>
                          <div className="text-sm text-muted-foreground">
                            Find your new best friend
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserRole("shelter")}
                          className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                            userRole === "shelter"
                              ? "border-salmon-400 bg-salmon-50 dark:bg-salmon-950"
                              : "border-border hover:border-salmon-300 hover:bg-muted/50"
                          }`}
                        >
                          {userRole === "shelter" && (
                            <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-salmon-400" />
                          )}
                          <Building2 className={`h-8 w-8 mb-2 ${userRole === "shelter" ? "text-salmon-400" : "text-muted-foreground"}`} />
                          <div className="font-semibold">List Pets</div>
                          <div className="text-sm text-muted-foreground">
                            I represent a shelter
                          </div>
                        </button>
                      </div>
                    </div>

                    <form
                      className="space-y-5"
                      onSubmit={(e: FormEvent) => {
                        e.preventDefault();
                        const variables: Record<string, string> = {
                          name,
                          userRole,
                          email,
                          password,
                        };
                        if (userRole === "shelter") {
                          variables.shelterName = shelterName;
                          variables.shelterLocation = shelterLocation;
                          variables.shelterPaymentEmail = shelterPaymentEmail;
                        }
                        registerUser({ variables });
                      }}
                    >
                      <div className="space-y-2">
                        <Label htmlFor="name">Full name</Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-11"
                            required
                          />
                        </div>
                      </div>

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
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-11"
                            required
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Must be at least 8 characters
                        </p>
                      </div>

                      {/* Shelter Fields */}
                      {userRole === "shelter" && (
                        <>
                          <div className="relative my-6">
                            <Separator />
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-sm text-muted-foreground">
                              Shelter Details
                            </span>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="shelterName">Shelter name</Label>
                            <div className="relative">
                              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="shelterName"
                                type="text"
                                placeholder="Happy Paws Shelter"
                                value={shelterName}
                                onChange={(e) => setShelterName(e.target.value)}
                                className="pl-11"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="shelterLocation">Location</Label>
                            <div className="relative">
                              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="shelterLocation"
                                type="text"
                                placeholder="City, State"
                                value={shelterLocation}
                                onChange={(e) => setShelterLocation(e.target.value)}
                                className="pl-11"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="shelterPaymentEmail">Payment email</Label>
                            <div className="relative">
                              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="shelterPaymentEmail"
                                type="email"
                                placeholder="payments@shelter.com"
                                value={shelterPaymentEmail}
                                onChange={(e) => setShelterPaymentEmail(e.target.value)}
                                className="pl-11"
                                required
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Used for receiving adoption fee payments
                            </p>
                          </div>
                        </>
                      )}

                      <Button
                        variant={userRole === "shelter" ? "salmon" : "skyBlue"}
                        size="lg"
                        type="submit"
                        className="w-full"
                        loading={loading}
                      >
                        {userRole === "shelter" ? "Register Shelter" : "Create Account"}
                      </Button>
                    </form>

                    <p className="text-center mt-6 text-sm text-muted-foreground">
                      By signing up, you agree to our{" "}
                      <Link
                        to="/tos"
                        className="text-sky-blue-500 hover:text-sky-blue-600"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy"
                        className="text-sky-blue-500 hover:text-sky-blue-600"
                      >
                        Privacy Policy
                      </Link>
                    </p>

                    <p className="text-center mt-4 text-muted-foreground">
                      Already have an account?{" "}
                      <Link
                        to="/login"
                        className="text-sky-blue-500 hover:text-sky-blue-600 font-medium"
                      >
                        Sign in
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Side - Illustration */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-salmon-300 to-salmon-400 relative overflow-hidden">
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
                  <Users className="h-16 w-16 mx-auto mb-6 fill-white/20" />
                  <h2 className="font-capriola text-3xl mb-4">
                    Join Our Community
                  </h2>
                  <p className="text-white/90 text-lg leading-relaxed">
                    Whether you're looking to adopt or you're a shelter ready to connect pets with loving homes, we're here to help make it happen.
                  </p>
                </div>

                {/* Features list */}
                <div className="mt-12 space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <span className="text-white/90">Free to browse and apply</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <span className="text-white/90">Match with the perfect pet</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <span className="text-white/90">Secure & trusted process</span>
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

export default Register;
