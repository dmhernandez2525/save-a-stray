import React, { Component } from "react";
import { Query } from "@apollo/client/react/components";
import Queries from "../graphql/queries";
import AnimalFeedItem from "./AnimalFeedItem";
import { withRouter, WithRouterProps } from "../util/withRouter";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FindAnimalsResponse, Animal } from "../types";

const { FIND_ANIMALS } = Queries;

interface UserLandingProps extends WithRouterProps {
  splash?: string;
}

interface UserLandingState {
  currentSelector: string | null;
  animal: Animal | null;
}

class UserLanding extends Component<UserLandingProps, UserLandingState> {
  constructor(props: UserLandingProps) {
    super(props);
    this.updateCurrentSelector = this.updateCurrentSelector.bind(this);
    this.state = {
      currentSelector: null,
      animal: null,
    };
  }

  updateCurrentSelector(type: string) {
    this.setState({ currentSelector: type });
    const button = document.getElementById("feed-buttons");
    if (button) {
      button.classList.add("small");
      button.classList.remove("big");
    }
  }

  updateCurrentAnimal(animal: Animal) {
    this.setState({ animal });
  }

  render() {
    let main;

    if (this.state.currentSelector === null) {
      main = (
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
      );
    } else if (this.props.splash === "splash") {
      this.props.history.push("/login");
    } else {
      main = (
        <Query<FindAnimalsResponse>
          query={FIND_ANIMALS}
          variables={{ type: this.state.currentSelector }}
        >
          {({ loading, error, data }) => {
            if (loading)
              return (
                <p className="text-white font-capriola animate-pulse">
                  Loading...
                </p>
              );
            if (error)
              return <p className="text-red-500 font-capriola">Error</p>;

            const allAnimals = data?.findAnimals?.map((animal) => (
              <li key={animal._id} className="list-none">
                <AnimalFeedItem animal={animal} />
              </li>
            ));

            return (
              <div className="w-full">
                <ul className="flex flex-wrap gap-4 justify-center p-4">
                  {allAnimals}
                </ul>
              </div>
            );
          }}
        </Query>
      );
    }

    return (
      <div className="flex flex-col items-center p-4">
        <h1 className="text-white font-capriola text-3xl mb-6">
          Browse Animals
        </h1>
        <div className="flex gap-4 mb-6" id="feed-buttons">
          <Button
            variant="skyBlue"
            size="lg"
            onClick={() => this.updateCurrentSelector("Dogs")}
            className="min-w-[120px]"
          >
            Dogs
          </Button>
          <Button
            variant="skyBlue"
            size="lg"
            onClick={() => this.updateCurrentSelector("Cats")}
            className="min-w-[120px]"
          >
            Cats
          </Button>
          <Button
            variant="skyBlue"
            size="lg"
            onClick={() => this.updateCurrentSelector("Other")}
            className="min-w-[120px]"
          >
            Other
          </Button>
        </div>
        {main}
      </div>
    );
  }
}

export default withRouter(UserLanding);
