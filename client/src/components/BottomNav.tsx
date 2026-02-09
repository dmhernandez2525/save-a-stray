import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Query } from "@apollo/client/react/components";
import { ApolloConsumer, ApolloClient } from "@apollo/client";
import Queries from "../graphql/queries";
import { IsLoggedInData } from "../types";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Home,
  Search,
  Heart,
  User,
  PawPrint,
  BookOpen,
  Settings,
  LogOut,
  X,
  Building2,
  UserPlus,
  LogIn,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

const { IS_LOGGED_IN } = Queries;

// Pages where bottom nav should be hidden
const HIDDEN_PAGES = ["/login", "/register", "/newShelter"];

interface NavTab {
  path: string;
  label: string;
  icon: React.ElementType;
  matchPaths?: string[];
}

const LOGGED_IN_TABS: NavTab[] = [
  {
    path: "/",
    label: "Home",
    icon: Home,
    matchPaths: ["/", "/splash", "/Landing"],
  },
  {
    path: "/User",
    label: "Browse",
    icon: Search,
    matchPaths: ["/User", "/AnimalShow"],
  },
  // Center FAB placeholder - index 2 is skipped in rendering
  {
    path: "/success-stories",
    label: "Stories",
    icon: Heart,
    matchPaths: ["/success-stories"],
  },
  {
    path: "/profile",
    label: "Profile",
    icon: User,
    matchPaths: ["/profile", "/settings"],
  },
];

const LOGGED_OUT_TABS: NavTab[] = [
  {
    path: "/",
    label: "Home",
    icon: Home,
    matchPaths: ["/", "/splash"],
  },
  {
    path: "/success-stories",
    label: "Stories",
    icon: Heart,
    matchPaths: ["/success-stories"],
  },
  // Center FAB placeholder
  {
    path: "/quiz",
    label: "Quiz",
    icon: BookOpen,
    matchPaths: ["/quiz"],
  },
  {
    path: "/login",
    label: "Sign In",
    icon: LogIn,
    matchPaths: ["/login"],
  },
];

function isTabActive(tab: NavTab, pathname: string): boolean {
  if (tab.matchPaths) {
    return tab.matchPaths.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );
  }
  return pathname === tab.path;
}

// Bottom Sheet overlay for "More" actions
interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ open, onClose, children }) => {
  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-2xl animate-slide-up" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-warm-gray-300 dark:bg-warm-gray-600" />
        </div>
        {/* Close button */}
        <div className="flex justify-end px-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        {/* Content */}
        <div className="px-4 pb-6 max-h-[60vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Individual sheet action item
interface SheetActionProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
}

const SheetAction: React.FC<SheetActionProps> = ({
  icon: Icon,
  label,
  onClick,
  variant = "default",
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors text-left",
      variant === "destructive"
        ? "text-destructive hover:bg-destructive/10"
        : "text-foreground hover:bg-muted"
    )}
  >
    <Icon className="h-5 w-5 flex-shrink-0" />
    <span className="font-medium">{label}</span>
  </button>
);

const BottomNav: React.FC = () => {
  const location = useLocation();
  const { resolvedTheme, setTheme } = useTheme();
  const [sheetOpen, setSheetOpen] = useState(false);
  const isDarkMode = resolvedTheme === "dark";

  const closeSheet = useCallback(() => setSheetOpen(false), []);

  // Hide on auth pages
  if (HIDDEN_PAGES.includes(location.pathname)) {
    return null;
  }

  return (
    <ApolloConsumer>
      {(client: ApolloClient<object>) => (
        <Query<IsLoggedInData> query={IS_LOGGED_IN}>
          {({ data }) => {
            const isLoggedIn = data?.isLoggedIn ?? false;
            const tabs = isLoggedIn ? LOGGED_IN_TABS : LOGGED_OUT_TABS;

            // Split tabs for rendering: left 2, FAB, right 2
            const leftTabs = tabs.slice(0, 2);
            const rightTabs = tabs.slice(2, 4);

            const handleLogout = () => {
              localStorage.removeItem("auth-token");
              client.writeQuery({
                query: IS_LOGGED_IN,
                data: { isLoggedIn: false },
              });
              closeSheet();
            };

            const handleThemeToggle = () => {
              setTheme(isDarkMode ? "light" : "dark");
              closeSheet();
            };

            return (
              <>
                {/* Spacer to prevent content from being hidden behind the nav */}
                <div className="h-20 md:hidden" />

                {/* Bottom Navigation Bar */}
                <nav
                  className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
                  role="navigation"
                  aria-label="Mobile navigation"
                >
                  {/* Glass background */}
                  <div className="bg-card/95 backdrop-blur-xl border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
                    <div
                      className="flex items-end justify-around px-2 pt-1"
                      style={{
                        paddingBottom:
                          "max(0.5rem, env(safe-area-inset-bottom))",
                      }}
                    >
                      {/* Left tabs */}
                      {leftTabs.map((tab) => {
                        const active = isTabActive(tab, location.pathname);
                        return (
                          <Link
                            key={tab.path}
                            to={tab.path}
                            className={cn(
                              "flex flex-col items-center gap-0.5 py-2 px-3 min-w-[64px] rounded-xl transition-all duration-200",
                              active
                                ? "text-sky-blue-500"
                                : "text-warm-gray-400 dark:text-warm-gray-500 hover:text-warm-gray-600 dark:hover:text-warm-gray-300"
                            )}
                            aria-current={active ? "page" : undefined}
                          >
                            <tab.icon
                              className={cn(
                                "h-6 w-6 transition-transform duration-200",
                                active && "scale-110"
                              )}
                              strokeWidth={active ? 2.5 : 2}
                            />
                            <span
                              className={cn(
                                "text-[10px] leading-tight font-medium",
                                active && "font-bold"
                              )}
                            >
                              {tab.label}
                            </span>
                            {/* Active indicator dot */}
                            {active && (
                              <div className="w-1 h-1 rounded-full bg-sky-blue-500 animate-fade-in-scale" />
                            )}
                          </Link>
                        );
                      })}

                      {/* Center FAB */}
                      <div className="flex flex-col items-center -mt-5">
                        {isLoggedIn ? (
                          <Link
                            to="/quiz"
                            className="relative"
                            aria-label="Match Quiz"
                          >
                            <div
                              className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300",
                                "bg-gradient-to-br from-sky-blue-400 to-sky-blue-600",
                                "hover:shadow-glow-primary hover:scale-105 active:scale-95",
                                location.pathname === "/quiz" &&
                                  "ring-2 ring-sky-blue-300 ring-offset-2 ring-offset-card"
                              )}
                            >
                              <PawPrint className="h-7 w-7 text-white" />
                            </div>
                          </Link>
                        ) : (
                          <Link
                            to="/register"
                            className="relative"
                            aria-label="Get Started"
                          >
                            <div
                              className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300",
                                "bg-gradient-to-br from-salmon-300 to-salmon-500",
                                "hover:shadow-glow-salmon hover:scale-105 active:scale-95"
                              )}
                            >
                              <UserPlus className="h-7 w-7 text-white" />
                            </div>
                          </Link>
                        )}
                        <span className="text-[10px] leading-tight font-medium text-muted-foreground mt-1">
                          {isLoggedIn ? "Quiz" : "Join"}
                        </span>
                      </div>

                      {/* Right tabs */}
                      {rightTabs.map((tab) => {
                        const active = isTabActive(tab, location.pathname);

                        // For the Profile tab (logged in), make it open the sheet instead
                        if (isLoggedIn && tab.path === "/profile") {
                          return (
                            <button
                              key="more"
                              onClick={() => setSheetOpen(true)}
                              className={cn(
                                "flex flex-col items-center gap-0.5 py-2 px-3 min-w-[64px] rounded-xl transition-all duration-200",
                                active || sheetOpen
                                  ? "text-sky-blue-500"
                                  : "text-warm-gray-400 dark:text-warm-gray-500 hover:text-warm-gray-600 dark:hover:text-warm-gray-300"
                              )}
                            >
                              <User
                                className={cn(
                                  "h-6 w-6 transition-transform duration-200",
                                  (active || sheetOpen) && "scale-110"
                                )}
                                strokeWidth={active || sheetOpen ? 2.5 : 2}
                              />
                              <span
                                className={cn(
                                  "text-[10px] leading-tight font-medium",
                                  (active || sheetOpen) && "font-bold"
                                )}
                              >
                                Menu
                              </span>
                              {(active || sheetOpen) && (
                                <div className="w-1 h-1 rounded-full bg-sky-blue-500 animate-fade-in-scale" />
                              )}
                            </button>
                          );
                        }

                        return (
                          <Link
                            key={tab.path}
                            to={tab.path}
                            className={cn(
                              "flex flex-col items-center gap-0.5 py-2 px-3 min-w-[64px] rounded-xl transition-all duration-200",
                              active
                                ? "text-sky-blue-500"
                                : "text-warm-gray-400 dark:text-warm-gray-500 hover:text-warm-gray-600 dark:hover:text-warm-gray-300"
                            )}
                            aria-current={active ? "page" : undefined}
                          >
                            <tab.icon
                              className={cn(
                                "h-6 w-6 transition-transform duration-200",
                                active && "scale-110"
                              )}
                              strokeWidth={active ? 2.5 : 2}
                            />
                            <span
                              className={cn(
                                "text-[10px] leading-tight font-medium",
                                active && "font-bold"
                              )}
                            >
                              {tab.label}
                            </span>
                            {active && (
                              <div className="w-1 h-1 rounded-full bg-sky-blue-500 animate-fade-in-scale" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </nav>

                {/* Bottom Sheet (logged in users) */}
                {isLoggedIn && (
                  <BottomSheet open={sheetOpen} onClose={closeSheet}>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
                        Account
                      </p>
                      <Link to="/profile" onClick={closeSheet}>
                        <SheetAction
                          icon={User}
                          label="My Profile"
                          onClick={closeSheet}
                        />
                      </Link>
                      <Link to="/settings" onClick={closeSheet}>
                        <SheetAction
                          icon={Settings}
                          label="Settings"
                          onClick={closeSheet}
                        />
                      </Link>
                    </div>

                    <div className="my-3 h-px bg-border" />

                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
                        Explore
                      </p>
                      <Link to="/quiz" onClick={closeSheet}>
                        <SheetAction
                          icon={BookOpen}
                          label="Match Quiz"
                          onClick={closeSheet}
                        />
                      </Link>
                      <Link to="/success-stories" onClick={closeSheet}>
                        <SheetAction
                          icon={Heart}
                          label="Success Stories"
                          onClick={closeSheet}
                        />
                      </Link>
                    </div>

                    <div className="my-3 h-px bg-border" />

                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
                        Preferences
                      </p>
                      <SheetAction
                        icon={isDarkMode ? Sun : Moon}
                        label={isDarkMode ? "Light Mode" : "Dark Mode"}
                        onClick={handleThemeToggle}
                      />
                    </div>

                    <div className="my-3 h-px bg-border" />

                    <SheetAction
                      icon={LogOut}
                      label="Sign Out"
                      onClick={handleLogout}
                      variant="destructive"
                    />
                  </BottomSheet>
                )}

                {/* Bottom Sheet (logged out users) */}
                {!isLoggedIn && (
                  <BottomSheet open={sheetOpen} onClose={closeSheet}>
                    <div className="space-y-1">
                      <Link to="/newShelter" onClick={closeSheet}>
                        <SheetAction
                          icon={Building2}
                          label="Register Your Shelter"
                          onClick={closeSheet}
                        />
                      </Link>
                      <SheetAction
                        icon={isDarkMode ? Sun : Moon}
                        label={isDarkMode ? "Light Mode" : "Dark Mode"}
                        onClick={handleThemeToggle}
                      />
                    </div>

                    <div className="my-4 h-px bg-border" />

                    <div className="grid grid-cols-2 gap-3">
                      <Link to="/login" onClick={closeSheet}>
                        <Button variant="outline" className="w-full">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/register" onClick={closeSheet}>
                        <Button variant="skyBlue" className="w-full">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  </BottomSheet>
                )}
              </>
            );
          }}
        </Query>
      )}
    </ApolloConsumer>
  );
};

export default BottomNav;
