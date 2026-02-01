import React from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import Queries from "../graphql/queries";
import { IsLoggedInData } from "../types";
import { useDemo } from "../demo/DemoContext";

const { IS_LOGGED_IN } = Queries;

interface ProtectedRouteProps {
  element: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const { data, loading } = useQuery<IsLoggedInData>(IS_LOGGED_IN);
  const { isDemo } = useDemo();

  if (loading) return null;

  // Allow access if user is logged in OR in demo mode
  if (data?.isLoggedIn || isDemo) {
    return element;
  }
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;
