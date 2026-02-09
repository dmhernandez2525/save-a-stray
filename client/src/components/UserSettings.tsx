import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";
import { FetchUserResponse, UserIdData } from "../types";
import { ArrowLeft, User, Settings, Building2, Calendar, Mail, Edit2, X, Check, AlertCircle } from "lucide-react";

const { FETCH_USER, USER_ID } = Queries;
const { UPDATE_USER } = Mutations;

// =============================================================================
// Types
// =============================================================================

interface EditFormData {
  name: string;
  email: string;
}

interface FormErrors {
  name?: string;
  email?: string;
}

// =============================================================================
// Validation
// =============================================================================

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

function validateForm(form: EditFormData): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Name is required";
  } else if (form.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  return errors;
}

// =============================================================================
// Subcomponents
// =============================================================================

function LoadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6" role="status" aria-label="Loading settings">
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

function NotLoggedIn() {
  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="text-center py-12">
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
        <h2 className="font-capriola text-xl mb-2">Not Logged In</h2>
        <p className="text-muted-foreground mb-6">Please log in to access your settings.</p>
        <Button variant="skyBlue" asChild>
          <Link to="/login">Log In</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function ErrorState() {
  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="text-center py-12">
        <div className="w-12 h-12 rounded-full bg-destructive/10 mx-auto mb-4 flex items-center justify-center">
          <X className="h-6 w-6 text-destructive" aria-hidden="true" />
        </div>
        <h2 className="font-capriola text-xl mb-2">Error</h2>
        <p className="text-muted-foreground">Unable to load user data. Please try again.</p>
      </CardContent>
    </Card>
  );
}

interface InfoRowProps {
  icon: typeof User;
  label: string;
  value: string;
  variant?: "default" | "highlight";
}

function InfoRow({ icon: Icon, label, value, variant = "default" }: InfoRowProps) {
  const bgClass = variant === "highlight"
    ? "bg-salmon-50 dark:bg-salmon-900/20"
    : "bg-warm-gray-50 dark:bg-warm-gray-800/50";

  const iconClass = variant === "highlight"
    ? "text-salmon-500"
    : "text-muted-foreground";

  return (
    <div className={`flex items-start gap-3 p-3 ${bgClass} rounded-lg`}>
      <Icon className={`h-5 w-5 ${iconClass} mt-0.5`} aria-hidden="true" />
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * User settings page for viewing and editing profile information.
 */
export default function UserSettings() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditFormData>({ name: "", email: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");

  // Queries
  const { data: userIdData } = useQuery<UserIdData>(USER_ID);
  const userId = userIdData?.userId || "";

  const { data, loading, error } = useQuery<FetchUserResponse>(FETCH_USER, {
    variables: { _id: userId },
    skip: !userId,
  });

  // Mutation
  const [updateUser, { loading: updating, error: updateError }] = useMutation(UPDATE_USER, {
    refetchQueries: [{ query: FETCH_USER, variables: { _id: userId } }],
    onCompleted: () => {
      setEditing(false);
      setSuccessMessage("Profile updated successfully.");
      setErrors({});
    },
  });

  const user = data?.user;

  const handleStartEditing = useCallback(() => {
    if (!user) return;
    setForm({ name: user.name, email: user.email });
    setEditing(true);
    setSuccessMessage("");
    setErrors({});
  }, [user]);

  const handleCancelEditing = useCallback(() => {
    setEditing(false);
    setErrors({});
  }, []);

  const handleFormChange = useCallback((field: keyof EditFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleSave = useCallback(() => {
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    updateUser({
      variables: {
        _id: userId,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
      },
    });
  }, [form, userId, updateUser]);

  // Render states
  if (!userId) {
    return (
      <PageWrapper>
        <NotLoggedIn />
      </PageWrapper>
    );
  }

  if (loading) {
    return (
      <PageWrapper>
        <LoadingSkeleton />
      </PageWrapper>
    );
  }

  if (error || !user) {
    return (
      <PageWrapper>
        <ErrorState />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Success Message */}
        {successMessage && (
          <div
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl p-4 flex items-center gap-3"
            role="alert"
          >
            <Check className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Update Error */}
        {updateError && (
          <div
            className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 flex items-center gap-3"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span>Failed to update profile. Please try again.</span>
          </div>
        )}

        {/* Profile Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sky-blue-600 dark:text-sky-blue-400 font-capriola text-lg flex items-center gap-2">
                <User className="h-5 w-5" aria-hidden="true" />
                Profile Information
              </CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </div>
            {!editing && (
              <Button variant="ghost" size="sm" onClick={handleStartEditing} className="gap-2">
                <Edit2 className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editing ? (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="settings-name">Name *</Label>
                  <Input
                    id="settings-name"
                    value={form.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className="bg-sky-blue-50 dark:bg-warm-gray-800"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-destructive text-xs flex items-center gap-1" role="alert">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-email">Email *</Label>
                  <Input
                    id="settings-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    className="bg-sky-blue-50 dark:bg-warm-gray-800"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-destructive text-xs flex items-center gap-1" role="alert">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="salmon" type="submit" disabled={updating} className="gap-2">
                    <Check className="h-4 w-4" aria-hidden="true" />
                    {updating ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" type="button" onClick={handleCancelEditing}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <InfoRow icon={User} label="Name" value={user.name} />
                <InfoRow icon={Mail} label="Email" value={user.email} />
                <InfoRow
                  icon={Settings}
                  label="Role"
                  value={user.userRole === "endUser" ? "Adopter" : "Shelter Staff"}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sky-blue-600 dark:text-sky-blue-400 font-capriola text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" aria-hidden="true" />
              Account
            </CardTitle>
            <CardDescription>Account information and activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <InfoRow
                icon={Calendar}
                label="Member Since"
                value={new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              />
              {user.shelter && (
                <InfoRow
                  icon={Building2}
                  label="Shelter"
                  value={user.shelter.name}
                  variant="highlight"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

// Page wrapper with header
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background col-start-1 col-end-6 row-start-1 row-end-4 pb-20 md:pb-0">
      <header className="bg-gradient-to-r from-sky-blue-500 to-sky-blue-600 text-white">
        <div className="container-wide py-8 md:py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Settings className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-capriola text-3xl md:text-4xl">Settings</h1>
              <p className="text-white/90">Manage your account preferences</p>
            </div>
          </div>
        </div>
      </header>
      <main className="container-tight py-8 px-4">{children}</main>
    </div>
  );
}
