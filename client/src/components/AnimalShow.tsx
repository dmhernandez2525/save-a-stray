import React from "react";
import { Query } from "@apollo/client/react/components";
import Queries from "../graphql/queries";
import NewApplication from "./Application";
import { withRouter, WithRouterProps } from "../util/withRouter";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FetchAnimalResponse, AnimalFormState } from "../types";

const { FETCH_ANIMAL } = Queries;

interface AnimalShowProps extends WithRouterProps {}

interface AnimalShowState extends AnimalFormState {
  show: boolean;
}

class AnimalShow extends React.Component<AnimalShowProps, AnimalShowState> {
  constructor(props: AnimalShowProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.showForm = this.showForm.bind(this);
    this.state = {
      name: "",
      type: "",
      age: "",
      sex: "",
      color: "",
      description: "",
      image: "",
      video: "",
      application: "",
      show: false,
    };
  }

  handleClick() {}

  showForm() {
    const app = document.getElementById("show-application-wrapper");
    if (app) {
      app.classList.toggle("hidden", false);
      window.scrollTo({
        top: app.offsetHeight + 50,
        behavior: "smooth",
      });
    }
  }

  render() {
    const backText = "<-- Back to other pets";

    return (
      <Query<FetchAnimalResponse>
        query={FETCH_ANIMAL}
        variables={{ id: this.props.match.params.id }}
      >
        {({ loading, error, data }) => {
          if (loading) {
            return (
              <div className="flex items-center justify-center min-h-screen">
                <h1 className="text-white font-capriola text-2xl animate-pulse">
                  Loading
                </h1>
              </div>
            );
          }

          if (error || !data?.animal) {
            return (
              <div className="flex items-center justify-center min-h-screen">
                <h1 className="text-red-500 font-capriola text-2xl">
                  Error loading animal
                </h1>
              </div>
            );
          }

          const animal = data.animal;

          return (
            <div className="col-start-2 col-end-5 row-start-2 p-4">
              <div className="flex items-center justify-between mb-6">
                <a
                  href="/#/Landing"
                  className="text-sky-blue font-capriola hover:text-salmon transition-colors"
                >
                  {backText}
                </a>
                <h1 className="text-white font-capriola text-4xl">
                  {animal.name}
                </h1>
              </div>

              <Card className="bg-white overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CardContent className="p-6">
                    <CardTitle className="text-sky-blue font-capriola text-2xl mb-4">
                      About {animal.name}
                    </CardTitle>
                    <div className="space-y-3 text-gray-700">
                      <p>
                        Hi, my name is{" "}
                        <span className="font-bold text-sky-blue">
                          {animal.name}
                        </span>
                        .
                      </p>
                      <p>
                        I am a{" "}
                        <span className="font-bold">{animal.age}</span> year old{" "}
                        <span className="font-bold">{animal.sex}</span>.
                      </p>
                      <p>
                        My coat is{" "}
                        <span className="font-bold">{animal.color}</span>.
                      </p>
                      <p>
                        People say:{" "}
                        <span className="italic">{animal.description}</span>
                      </p>
                    </div>
                    <Button
                      variant="salmon"
                      size="lg"
                      className="mt-6 w-full"
                      onClick={this.showForm}
                    >
                      Apply to adopt {animal.name}
                    </Button>
                  </CardContent>
                  <div className="h-full min-h-[300px]">
                    <img
                      src={animal.image}
                      alt={animal.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </Card>

              <div id="show-application-wrapper" className="hidden mt-6">
                <NewApplication animalId={animal._id} />
              </div>
            </div>
          );
        }}
      </Query>
    );
  }
}

export default withRouter(AnimalShow);
