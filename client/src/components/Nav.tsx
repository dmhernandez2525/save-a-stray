import React, { useState } from "react";
import { Query } from "@apollo/client/react/components";
import Queries from "../graphql/queries";
import { ApolloConsumer, ApolloClient } from "@apollo/client";
import { Link, useLocation } from "react-router-dom";
import { withRouter, WithRouterProps } from "../util/withRouter";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "./ui/sheet";
import { IsLoggedInData, UserIdData } from "../types";
import { PawPrint, Menu, User, Settings, LogOut, Heart, BookOpen, ChevronDown, X } from "lucide-react";

const { IS_LOGGED_IN, USER_ID } = Queries;

interface NavProps extends WithRouterProps {}

const Nav: React.FC<NavProps> = (props) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isAuthPage = ["/login", "/register", "/newShelter"].includes(location.pathname);
  const isLandingPage = location.pathname === "/" || location.pathname === "/splash";

  // Don't show nav on auth pages
  if (isAuthPage) {
    return null;
  }

  return (
    <header className={`col-start-1 col-end-6 row-start-1 z-50 ${isLandingPage ? 'absolute top-0 left-0 right-0' : 'relative'}`}>
      <div className="container-wide">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <PawPrint className="h-8 w-8 text-sky-blue-500 transition-transform group-hover:rotate-12" />
            <span className="font-capriola text-xl text-warm-gray-900 dark:text-white hidden sm:block">
              Save Your Stray
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <ApolloConsumer>
              {(client: ApolloClient<object>) => (
                <Query<IsLoggedInData> query={IS_LOGGED_IN}>
                  {({ data }) => {
                    if (data?.isLoggedIn) {
                      return (
                        <>
                          {/* Logged in nav links */}
                          <Link to="/User">
                            <Button variant="ghost" className="text-warm-gray-700 dark:text-warm-gray-300">
                              Browse Pets
                            </Button>
                          </Link>
                          <Link to="/success-stories">
                            <Button variant="ghost" className="text-warm-gray-700 dark:text-warm-gray-300">
                              Success Stories
                            </Button>
                          </Link>
                          <Link to="/quiz">
                            <Button variant="ghost" className="text-warm-gray-700 dark:text-warm-gray-300">
                              Match Quiz
                            </Button>
                          </Link>

                          {/* User dropdown */}
                          <Query<UserIdData> query={USER_ID}>
                            {({ data: userData }) => (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="gap-2 ml-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-sky-blue-100 text-sky-blue-700 text-sm">
                                        {userData?.userId?.charAt(0)?.toUpperCase() || "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <ChevronDown className="h-4 w-4 text-warm-gray-500" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                  <DropdownMenuItem onClick={() => props.history.push("/profile")}>
                                    <User className="mr-2 h-4 w-4" />
                                    Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => props.history.push("/settings")}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      localStorage.removeItem("auth-token");
                                      client.writeQuery({
                                        query: IS_LOGGED_IN,
                                        data: { isLoggedIn: false },
                                      });
                                      props.history.push("/");
                                    }}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </Query>
                        </>
                      );
                    } else {
                      return (
                        <>
                          {/* Logged out nav links */}
                          <Link to="/success-stories">
                            <Button variant="ghost" className="text-warm-gray-700 dark:text-warm-gray-300">
                              Success Stories
                            </Button>
                          </Link>
                          <Link to="/quiz">
                            <Button variant="ghost" className="text-warm-gray-700 dark:text-warm-gray-300">
                              Match Quiz
                            </Button>
                          </Link>
                          <Link to="/newShelter">
                            <Button variant="ghost" className="text-warm-gray-700 dark:text-warm-gray-300">
                              For Shelters
                            </Button>
                          </Link>
                          <div className="flex items-center gap-2 ml-4">
                            <Link to="/login">
                              <Button variant="ghost" className="text-warm-gray-700 dark:text-warm-gray-300">
                                Sign In
                              </Button>
                            </Link>
                            <Link to="/register">
                              <Button variant="skyBlue">
                                Get Started
                              </Button>
                            </Link>
                          </div>
                        </>
                      );
                    }
                  }}
                </Query>
              )}
            </ApolloConsumer>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <PawPrint className="h-6 w-6 text-sky-blue-500" />
                    Save Your Stray
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-8 flex flex-col gap-2">
                  <ApolloConsumer>
                    {(client: ApolloClient<object>) => (
                      <Query<IsLoggedInData> query={IS_LOGGED_IN}>
                        {({ data }) => {
                          if (data?.isLoggedIn) {
                            return (
                              <>
                                <Link to="/User" onClick={() => setMobileMenuOpen(false)}>
                                  <Button variant="ghost" className="w-full justify-start gap-3">
                                    <PawPrint className="h-5 w-5" />
                                    Browse Pets
                                  </Button>
                                </Link>
                                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                                  <Button variant="ghost" className="w-full justify-start gap-3">
                                    <User className="h-5 w-5" />
                                    Profile
                                  </Button>
                                </Link>
                                <Link to="/success-stories" onClick={() => setMobileMenuOpen(false)}>
                                  <Button variant="ghost" className="w-full justify-start gap-3">
                                    <Heart className="h-5 w-5" />
                                    Success Stories
                                  </Button>
                                </Link>
                                <Link to="/quiz" onClick={() => setMobileMenuOpen(false)}>
                                  <Button variant="ghost" className="w-full justify-start gap-3">
                                    <BookOpen className="h-5 w-5" />
                                    Match Quiz
                                  </Button>
                                </Link>
                                <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>
                                  <Button variant="ghost" className="w-full justify-start gap-3">
                                    <Settings className="h-5 w-5" />
                                    Settings
                                  </Button>
                                </Link>
                                <div className="my-4 h-px bg-border" />
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start gap-3 text-destructive hover:text-destructive"
                                  onClick={() => {
                                    localStorage.removeItem("auth-token");
                                    client.writeQuery({
                                      query: IS_LOGGED_IN,
                                      data: { isLoggedIn: false },
                                    });
                                    setMobileMenuOpen(false);
                                    props.history.push("/");
                                  }}
                                >
                                  <LogOut className="h-5 w-5" />
                                  Logout
                                </Button>
                              </>
                            );
                          } else {
                            return (
                              <>
                                <Link to="/success-stories" onClick={() => setMobileMenuOpen(false)}>
                                  <Button variant="ghost" className="w-full justify-start gap-3">
                                    <Heart className="h-5 w-5" />
                                    Success Stories
                                  </Button>
                                </Link>
                                <Link to="/quiz" onClick={() => setMobileMenuOpen(false)}>
                                  <Button variant="ghost" className="w-full justify-start gap-3">
                                    <BookOpen className="h-5 w-5" />
                                    Match Quiz
                                  </Button>
                                </Link>
                                <Link to="/newShelter" onClick={() => setMobileMenuOpen(false)}>
                                  <Button variant="ghost" className="w-full justify-start gap-3">
                                    <PawPrint className="h-5 w-5" />
                                    For Shelters
                                  </Button>
                                </Link>
                                <div className="my-4 h-px bg-border" />
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                  <Button variant="outline" className="w-full">
                                    Sign In
                                  </Button>
                                </Link>
                                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                  <Button variant="skyBlue" className="w-full">
                                    Get Started
                                  </Button>
                                </Link>
                              </>
                            );
                          }
                        }}
                      </Query>
                    )}
                  </ApolloConsumer>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default withRouter(Nav);
