import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./components/App";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
  ApolloLink,
  makeVar,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";

import Mutations from "./graphql/mutations";
const { VERIFY_USER } = Mutations;

const token = localStorage.getItem("auth-token");

// Reactive variables for local state
export const isLoggedInVar = makeVar(Boolean(token));
export const userIdVar = makeVar("");

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        isLoggedIn: {
          read() {
            return isLoggedInVar();
          },
        },
        userId: {
          read() {
            return userIdVar();
          },
        },
      },
    },
  },
});

const httpLink = createHttpLink({
  uri:
    import.meta.env.MODE === "production"
      ? "https://save-a-stray-api.onrender.com/graphql"
      : "http://localhost:5000/graphql",
  headers: {
    authorization: localStorage.getItem("auth-token") || "",
  },
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => console.log(message));
  }
  if (networkError) {
    console.log("networkError", networkError);
  }
});

const client = new ApolloClient({
  link: ApolloLink.from([errorLink, httpLink]),
  cache,
});

// Verify user if token exists
const verifyUser = async () => {
  if (token) {
    try {
      const { data } = await client.mutate({
        mutation: VERIFY_USER,
        variables: { token },
      });
      isLoggedInVar(data.verifyUser.loggedIn);
      userIdVar(data.verifyUser._id);
    } catch (error) {
      console.error("Error verifying user:", error);
    }
  }
};

const Root = () => {
  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
};

const container = document.getElementById("root")!;
const root = createRoot(container);

verifyUser().then(() => {
  root.render(<Root />);
});
