import React from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import Queries from "../graphql/queries";
import { IsLoggedInData } from "../types";

const { IS_LOGGED_IN } = Queries;

interface ProtectedRouteProps {
  element: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const { data, loading } = useQuery<IsLoggedInData>(IS_LOGGED_IN);

  if (loading) return null;

  // This route will only render if the user is logged in
  if (data?.isLoggedIn) {
    return element;
  }
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;
