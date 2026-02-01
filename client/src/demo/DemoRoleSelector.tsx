// Demo Role Selector - Shown on auth pages when VITE_DEMO_MODE=true
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { useDemo } from "./DemoContext";
import { DemoRole, roleDescriptions, getAllDemoUsers } from "./demoUsers";
import {
  Heart,
  Building2,
  Shield,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface DemoRoleSelectorProps {
  onClose?: () => void;
}

const roleIcons: Record<DemoRole, React.FC<{ className?: string }>> = {
  adopter: Heart,
  shelter_staff: Building2,
  shelter_admin: Shield,
};

const roleColors: Record<DemoRole, { bg: string; text: string; border: string }> = {
  adopter: {
    bg: "bg-sky-blue-50 dark:bg-sky-blue-900/20",
    text: "text-sky-blue-600 dark:text-sky-blue-400",
    border: "border-sky-blue-200 dark:border-sky-blue-800",
  },
  shelter_staff: {
    bg: "bg-salmon-50 dark:bg-salmon-900/20",
    text: "text-salmon-600 dark:text-salmon-400",
    border: "border-salmon-200 dark:border-salmon-800",
  },
  shelter_admin: {
    bg: "bg-gold-50 dark:bg-gold-900/20",
    text: "text-gold-600 dark:text-gold-400",
    border: "border-gold-200 dark:border-gold-800",
  },
};

const DemoRoleSelector: React.FC<DemoRoleSelectorProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { selectDemoUser, isDemoModeEnabled } = useDemo();

  if (!isDemoModeEnabled) {
    return null;
  }

  const handleSelectRole = (role: DemoRole) => {
    selectDemoUser(role);
    // Navigate to actual app routes (not /demo/* routes)
    if (role === "adopter") {
      navigate("/User");
    } else {
      navigate("/Shelter");
    }
    onClose?.();
  };

  const demoUsers = getAllDemoUsers();

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      <div className="flex items-center justify-center gap-2 py-2 px-4 bg-gold-100 dark:bg-gold-900/30 rounded-xl">
        <Sparkles className="h-4 w-4 text-gold-600 dark:text-gold-400" />
        <span className="text-sm font-medium text-gold-700 dark:text-gold-300">
          Demo Mode Enabled
        </span>
      </div>

      {/* Role Cards */}
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Select a role to explore the platform without creating an account
        </p>

        {demoUsers.map((user) => {
          const role = user.demoRole;
          const Icon = roleIcons[role];
          const colors = roleColors[role];
          const desc = roleDescriptions[role];

          return (
            <Card
              key={role}
              className={`cursor-pointer transition-all hover:shadow-md ${colors.border} border-2`}
              onClick={() => handleSelectRole(role)}
            >
              <CardHeader className={`${colors.bg} pb-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${colors.text}`} />
                    </div>
                    <div>
                      <CardTitle className={`text-lg ${colors.text}`}>
                        {desc.title}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {user.displayName}
                      </CardDescription>
                    </div>
                  </div>
                  <ArrowRight className={`h-5 w-5 ${colors.text}`} />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  {user.description}
                </p>
                <ul className="space-y-1.5">
                  {desc.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className={`h-3 w-3 ${colors.text}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator />

      {/* Skip Demo */}
      <p className="text-xs text-center text-muted-foreground">
        Want full access?{" "}
        <button
          onClick={onClose}
          className="text-sky-blue-500 hover:text-sky-blue-600 font-medium"
        >
          Create an account instead
        </button>
      </p>
    </div>
  );
};

export default DemoRoleSelector;
