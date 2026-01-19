import React from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import Queries from "../graphql/queries";

const { IS_LOGGED_IN } = Queries;

const AuthRoute = ({ element, routeType }) => {
  const { data, loading } = useQuery(IS_LOGGED_IN);

  if (loading) return null;

  // if the route type is "auth" then this route will only render if the
  // user is not logged in - useful for authentication routes
  if (routeType === "auth") {
    if (data?.isLoggedIn) {
      return <Navigate to="/" replace />;
    }
    return element;
  }

  // otherwise this will be a protected route which will only
  // render the component if the user is logged in
  if (data?.isLoggedIn) {
    return element;
  }
  return <Navigate to="/login" replace />;
};

export default AuthRoute;
