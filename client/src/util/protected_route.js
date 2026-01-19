import React from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import Queries from "../graphql/queries";

const { IS_LOGGED_IN } = Queries;

const ProtectedRoute = ({ element }) => {
  const { data, loading } = useQuery(IS_LOGGED_IN);

  if (loading) return null;

  // This route will only render if the user is logged in
  if (data?.isLoggedIn) {
    return element;
  }
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;
