import React from "react";
import { Query } from "@apollo/client/react/components";
import { ApolloConsumer, ApolloClient } from "@apollo/client";
import Queries from "../graphql/queries";
import UserShow from "./UserLanding";
import ShelterShow from "./ShelterLanding";
import { FetchUserResponse, UserIdData } from "../types";

const { FETCH_USER, USER_ID } = Queries;

interface LandingProps {}

interface LandingState {
  userId: string;
}

class Landing extends React.Component<LandingProps, LandingState> {
  private userId: string = "";

  constructor(props: LandingProps) {
    super(props);
    this.state = {
      userId: "",
    };
  }

  render() {
    return (
      <ApolloConsumer>
        {(client: ApolloClient<object>) => {
          const user = client.readQuery<UserIdData>({
            query: USER_ID,
          });

          this.userId = user?.userId || "";

          return (
            <Query<FetchUserResponse>
              query={FETCH_USER}
              variables={{ _id: this.userId }}
            >
              {({ loading, error, data }) => {
                if (loading) {
                  return (
                    <div className="flex items-center justify-center min-h-[200px]">
                      <h1 className="text-white font-capriola text-2xl animate-pulse">
                        Loading
                      </h1>
                    </div>
                  );
                }

                if (error) {
                  return (
                    <div className="flex items-center justify-center min-h-[200px]">
                      <h1 className="text-red-500 font-capriola text-2xl">
                        Error loading user data
                      </h1>
                    </div>
                  );
                }

                if (data?.user?.userRole === "shelter") {
                  return <ShelterShow shelterInfo={data.user.shelter} />;
                } else if (data?.user?.userRole === "endUser") {
                  return <UserShow />;
                }

                return null;
              }}
            </Query>
          );
        }}
      </ApolloConsumer>
    );
  }
}

export default Landing;
