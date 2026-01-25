import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Query, Mutation } from "@apollo/client/react/components";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Shelter, Animal, AnimalStatus, FetchShelterResponse } from "../types";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";
import ShelterApplications from "./ShelterApplications";
import ShelterAnalytics from "./ShelterAnalytics";

const { FETCH_SHELTER } = Queries;
const { UPDATE_ANIMAL_STATUS } = Mutations;

const STATUS_STYLES: Record<AnimalStatus, string> = {
  available: "bg-green-500",
  pending: "bg-yellow-500",
  adopted: "bg-blue-500",
};

const STATUS_LABELS: Record<AnimalStatus, string> = {
  available: "Available",
  pending: "Pending",
  adopted: "Adopted",
};

const STATUS_OPTIONS: AnimalStatus[] = ["available", "pending", "adopted"];

interface ShelterLandingProps {
  shelterInfo?: Shelter;
}

interface ShelterLandingState {
  statusFilter: AnimalStatus | "all";
}

class ShelterLanding extends Component<ShelterLandingProps, ShelterLandingState> {
  constructor(props: ShelterLandingProps) {
    super(props);
    this.state = { statusFilter: "all" };
  }

  filterAnimals(animals: Animal[]): Animal[] {
    if (this.state.statusFilter === "all") return animals;
    return animals.filter((a) => (a.status || "available") === this.state.statusFilter);
  }

  renderAnimalRow(animal: Animal) {
    const status = (animal.status || "available") as AnimalStatus;

    return (
      <div key={animal._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          <img src={animal.image} alt={animal.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 truncate">{animal.name}</p>
          <p className="text-xs text-muted-foreground">
            {animal.breed && `${animal.breed} · `}{animal.type} · {animal.age} yrs · {animal.sex}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs text-white font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[status]}`}>
            {STATUS_LABELS[status]}
          </span>
          <Mutation
            mutation={UPDATE_ANIMAL_STATUS}
            refetchQueries={[{ query: FETCH_SHELTER, variables: { _id: this.props.shelterInfo?._id } }]}
          >
            {(updateStatus: (opts: { variables: { _id: string; status: string } }) => void) => (
              <select
                value={status}
                onChange={(e) => updateStatus({ variables: { _id: animal._id, status: e.target.value } })}
                className="text-xs border rounded px-1 py-0.5"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{STATUS_LABELS[opt]}</option>
                ))}
              </select>
            )}
          </Mutation>
        </div>
      </div>
    );
  }

  render() {
    const shelterId = this.props.shelterInfo?._id;

    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white font-capriola text-3xl">
            {this.props.shelterInfo?.name || "Shelter"} Dashboard
          </h1>
          <Button variant="salmon" size="lg" asChild>
            <Link to="/newAnimal">+ Add Animal</Link>
          </Button>
        </div>

        {shelterId ? (
          <Query<FetchShelterResponse>
            query={FETCH_SHELTER}
            variables={{ _id: shelterId }}
          >
            {({ loading, error, data }) => {
              if (loading) return <p className="text-white font-capriola animate-pulse">Loading...</p>;
              if (error) return <p className="text-red-500 font-capriola">Error loading shelter data</p>;

              const animals = data?.shelter?.animals || [];
              const filtered = this.filterAnimals(animals);

              const counts = {
                all: animals.length,
                available: animals.filter((a) => (a.status || "available") === "available").length,
                pending: animals.filter((a) => a.status === "pending").length,
                adopted: animals.filter((a) => a.status === "adopted").length,
              };

              return (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {(["all", ...STATUS_OPTIONS] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => this.setState({ statusFilter: filter })}
                        className={`p-3 rounded-lg text-center transition-colors ${
                          this.state.statusFilter === filter
                            ? "bg-white text-gray-800 shadow-md"
                            : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                      >
                        <p className="text-2xl font-bold">{counts[filter]}</p>
                        <p className="text-xs uppercase">{filter === "all" ? "Total" : STATUS_LABELS[filter]}</p>
                      </button>
                    ))}
                  </div>

                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle className="text-sky-blue font-capriola">
                        Animals ({filtered.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {filtered.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                          No animals found. Add your first animal to get started!
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {filtered.map((animal) => this.renderAnimalRow(animal))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="mt-6">
                    <h2 className="text-white font-capriola text-xl mb-4">Analytics</h2>
                    <ShelterAnalytics shelterId={shelterId} />
                  </div>

                  <div className="mt-6">
                    <h2 className="text-white font-capriola text-xl mb-4">Applications</h2>
                    <ShelterApplications shelterId={shelterId} />
                  </div>
                </>
              );
            }}
          </Query>
        ) : (
          <Card className="bg-white">
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                No shelter associated with your account. Please complete your shelter registration.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
}

export default ShelterLanding;
