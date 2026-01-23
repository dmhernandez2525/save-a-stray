import React, { Component } from "react";
import { Query } from "@apollo/client/react/components";
import Queries from "../graphql/queries";
import AnimalFeedItem from "./AnimalFeedItem";
import SearchFilters from "./SearchFilters";
import { withRouter, WithRouterProps } from "../util/withRouter";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { FindAnimalsResponse, FindAnimalsVariables, Animal } from "../types";

const { FIND_ANIMALS } = Queries;

const PAGE_SIZE = 12;
const DEBOUNCE_MS = 300;

const TEXT_FILTER_KEYS: (keyof FindAnimalsVariables)[] = ["name", "breed", "color"];
const NUMERIC_FILTER_KEYS: (keyof FindAnimalsVariables)[] = ["minAge", "maxAge"];
const DEBOUNCED_KEYS = new Set<keyof FindAnimalsVariables>([...TEXT_FILTER_KEYS, ...NUMERIC_FILTER_KEYS]);

interface UserLandingProps extends WithRouterProps {
  splash?: string;
}

interface UserLandingState {
  filters: FindAnimalsVariables;
  queryFilters: FindAnimalsVariables;
  animal: Animal | null;
  hasMore: boolean;
}

class UserLanding extends Component<UserLandingProps, UserLandingState> {
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(props: UserLandingProps) {
    super(props);
    this.state = {
      filters: {},
      queryFilters: {},
      animal: null,
      hasMore: true,
    };
  }

  componentWillUnmount() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  handleFiltersChange = (newFilters: FindAnimalsVariables) => {
    const prevFilters = this.state.filters;

    // Determine which key changed
    const changedKey = Object.keys(newFilters).find(
      (key) => newFilters[key as keyof FindAnimalsVariables] !== prevFilters[key as keyof FindAnimalsVariables]
    ) as keyof FindAnimalsVariables | undefined;

    // Also check for keys that were removed (set to undefined)
    const removedKey = Object.keys(prevFilters).find(
      (key) => prevFilters[key as keyof FindAnimalsVariables] !== undefined && newFilters[key as keyof FindAnimalsVariables] === undefined
    ) as keyof FindAnimalsVariables | undefined;

    const affectedKey = changedKey || removedKey;
    const shouldDebounce = affectedKey && DEBOUNCED_KEYS.has(affectedKey);

    // Always update the display filters immediately
    this.setState({ filters: newFilters });

    if (shouldDebounce) {
      // Debounce the query update for text/numeric inputs
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = setTimeout(() => {
        this.setState({ queryFilters: newFilters, hasMore: true });
        this.debounceTimer = null;
      }, DEBOUNCE_MS);
    } else {
      // Immediate update for buttons and selects
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }
      this.setState({ queryFilters: newFilters, hasMore: true });
    }
  };

  hasActiveFilters(filters: FindAnimalsVariables): boolean {
    return !!(filters.type || filters.breed || filters.sex || filters.status || filters.name || filters.color || filters.minAge !== undefined || filters.maxAge !== undefined);
  }

  render() {
    if (this.props.splash === "splash") {
      this.props.history.push("/login");
      return null;
    }

    const hasQueryFilters = this.hasActiveFilters(this.state.queryFilters);
    const isDebouncing = this.hasActiveFilters(this.state.filters) &&
      JSON.stringify(this.state.filters) !== JSON.stringify(this.state.queryFilters);

    return (
      <div className="flex flex-col items-center p-4">
        <h1 className="text-white font-capriola text-3xl mb-6">
          Browse Animals
        </h1>
        <SearchFilters
          filters={this.state.filters}
          onFiltersChange={this.handleFiltersChange}
        />
        {isDebouncing && (
          <p className="text-white/70 text-sm font-capriola mt-2 animate-pulse">
            Searching...
          </p>
        )}
        <div className="mt-6 w-full">
          {!hasQueryFilters ? (
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
              variables={{ ...this.state.queryFilters, limit: PAGE_SIZE, offset: 0 }}
              onCompleted={(data) => {
                const animals = data?.findAnimals || [];
                if (animals.length < PAGE_SIZE && this.state.hasMore) {
                  this.setState({ hasMore: false });
                }
              }}
            >
              {({ loading, error, data, fetchMore }) => {
                if (loading && (!data || !data.findAnimals))
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
                    {this.state.hasMore && animals.length >= PAGE_SIZE && (
                      <div className="flex justify-center mt-4">
                        <Button
                          variant="salmon"
                          onClick={() => {
                            fetchMore({
                              variables: { offset: animals.length },
                              updateQuery: (prev, { fetchMoreResult }) => {
                                if (!fetchMoreResult) return prev;
                                const newAnimals = fetchMoreResult.findAnimals;
                                if (newAnimals.length < PAGE_SIZE) {
                                  this.setState({ hasMore: false });
                                }
                                return {
                                  findAnimals: [...prev.findAnimals, ...newAnimals],
                                };
                              },
                            });
                          }}
                        >
                          Load More
                        </Button>
                      </div>
                    )}
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
