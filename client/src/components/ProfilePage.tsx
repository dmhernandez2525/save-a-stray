import React from "react";
import { ApolloConsumer, ApolloClient } from "@apollo/client";
import Queries from "../graphql/queries";
import UserProfile from "./UserProfile";
import { UserIdData } from "../types";

const { USER_ID } = Queries;

const ProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background col-start-1 col-end-6 row-start-1 row-end-4 pb-20 md:pb-0">
      <ApolloConsumer>
        {(client: ApolloClient<object>) => {
          const data = client.readQuery<UserIdData>({ query: USER_ID });
          const userId = data?.userId || "";

          if (!userId) {
            return (
              <div className="flex items-center justify-center min-h-[200px]">
                <p className="text-foreground font-capriola">Please log in to view your profile.</p>
              </div>
            );
          }

          return <UserProfile userId={userId} />;
        }}
      </ApolloConsumer>
    </div>
  );
};

export default ProfilePage;
