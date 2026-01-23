import React, { Component } from "react";
import { Query } from "@apollo/client/react/components";
import Queries from "../graphql/queries";
import AnimalFeedItem from "./AnimalFeedItem";
import SearchFilters from "./SearchFilters";
import { withRouter, WithRouterProps } from "../util/withRouter";
import { Card, CardContent } from "./ui/card";
import { FindAnimalsResponse, FindAnimalsVariables, Animal } from "../types";

const { FIND_ANIMALS } = Queries;

interface UserLandingProps extends WithRouterProps {
  splash?: string;
}

interface UserLandingState {
  filters: FindAnimalsVariables;
  animal: Animal | null;
}

class UserLanding extends Component<UserLandingProps, UserLandingState> {
  constructor(props: UserLandingProps) {
    super(props);
    this.state = {
      filters: {},
      animal: null,
    };
  }

  hasActiveFilters(): boolean {
    const { filters } = this.state;
    return !!(filters.type || filters.sex || filters.name || filters.color || filters.minAge !== undefined || filters.maxAge !== undefined);
  }

  render() {
    if (this.props.splash === "splash") {
      this.props.history.push("/login");
      return null;
    }

    const hasFilters = this.hasActiveFilters();

    return (
      <div className="flex flex-col items-center p-4">
        <h1 className="text-white font-capriola text-3xl mb-6">
          Browse Animals
        </h1>
        <SearchFilters
          filters={this.state.filters}
          onFiltersChange={(filters) => this.setState({ filters })}
        />
        <div className="mt-6 w-full">
          {!hasFilters ? (
            <Card className="bg-transparent border-none shadow-none">
              <CardContent className="text-center">
                <p className="text-white font-capriola text-lg italic">
                  "When we adopt a dog or any pet, we know it is going to end with
                  us having to say goodbye, but we still do it. And we do it for a
                  very good reason: They bring so much joy and optimism and
                  happiness. They attack every moment of every day with that
                  attitude."
                </p>
              </CardContent>
            </Card>
          ) : (
            <Query<FindAnimalsResponse, FindAnimalsVariables>
              query={FIND_ANIMALS}
              variables={this.state.filters}
            >
              {({ loading, error, data }) => {
                if (loading)
                  return (
                    <p className="text-white font-capriola animate-pulse text-center">
                      Loading...
                    </p>
                  );
                if (error)
                  return <p className="text-red-500 font-capriola text-center">Error</p>;

                const animals = data?.findAnimals || [];

                if (animals.length === 0) {
                  return (
                    <p className="text-white font-capriola text-center">
                      No animals found matching your filters.
                    </p>
                  );
                }

                return (
                  <div className="w-full">
                    <ul className="flex flex-wrap gap-4 justify-center p-4">
                      {animals.map((animal) => (
                        <li key={animal._id} className="list-none">
                          <AnimalFeedItem animal={animal} />
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }}
            </Query>
          )}
        </div>
      </div>
    );
  }
}

export default withRouter(UserLanding);
