import React from "react";
import { Query } from "@apollo/client/react/components";
import Queries from "../graphql/queries";
import { ApolloConsumer, ApolloClient } from "@apollo/client";
import { Link } from "react-router-dom";
import { withRouter, WithRouterProps } from "../util/withRouter";
import { Button } from "./ui/button";
import { IsLoggedInData } from "../types";

const { IS_LOGGED_IN } = Queries;

interface NavProps extends WithRouterProps {}

const Nav: React.FC<NavProps> = (props) => {
  const isHomePage =
    props.history.location.pathname === "/" ||
    props.history.location.pathname === "/Landing";

  const BackButton = !isHomePage ? (
    <Button
      variant="ghost"
      className="font-capriola text-sky-blue hover:underline hover:decoration-salmon"
      onClick={(e) => {
        e.preventDefault();
        props.history.goBack();
      }}
    >
      back
    </Button>
  ) : null;

  return (
    <div className="col-start-3 col-end-5 row-start-1 row-end-2 z-10 grid grid-rows-nav relative">
      <div className="row-start-2 flex justify-self-end">
        <ApolloConsumer>
          {(client: ApolloClient<object>) => (
            <Query<IsLoggedInData> query={IS_LOGGED_IN}>
              {({ data }) => {
                if (data?.isLoggedIn) {
                  return (
                    <div className="flex flex-row-reverse justify-center gap-2">
                      <Button
                        variant="ghost"
                        className="font-capriola text-sky-blue hover:underline hover:decoration-salmon"
                        onClick={(e) => {
                          e.preventDefault();
                          localStorage.removeItem("auth-token");
                          client.writeQuery({
                            query: IS_LOGGED_IN,
                            data: { isLoggedIn: false },
                          });
                          props.history.push("/");
                        }}
                      >
                        Logout
                      </Button>
                      <Link
                        to="/profile"
                        className="font-capriola text-sky-blue no-underline self-center hover:underline hover:decoration-salmon text-sm"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/success-stories"
                        className="font-capriola text-sky-blue no-underline self-center hover:underline hover:decoration-salmon text-sm"
                      >
                        Stories
                      </Link>
                      {BackButton}
                    </div>
                  );
                } else {
                  return (
                    <div className="flex flex-row-reverse justify-center gap-2">
                      <Link
                        to="/login"
                        className="font-capriola text-[calc(2vw+1vh)] text-sky-blue no-underline self-center hover:underline hover:decoration-salmon"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="font-capriola text-[calc(2vw+1vh)] text-sky-blue no-underline self-center hover:underline hover:decoration-salmon"
                      >
                        Register
                      </Link>
                    </div>
                  );
                }
              }}
            </Query>
          )}
        </ApolloConsumer>
      </div>
    </div>
  );
};

export default withRouter(Nav);
