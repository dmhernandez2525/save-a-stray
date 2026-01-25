import React from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import Queries from "../graphql/queries";
import NewApplication from "./Application";
import { withRouter, WithRouterProps } from "../util/withRouter";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FetchAnimalResponse, SimilarAnimalsResponse, AnimalStatus, MedicalRecord } from "../types";
import { Link } from "react-router-dom";
import Mutations from "../graphql/mutations";
import ShareButtons from "./ShareButtons";

const { FETCH_ANIMAL, SIMILAR_ANIMALS } = Queries;
const { ADD_MEDICAL_RECORD } = Mutations;

const STATUS_STYLES: Record<AnimalStatus, string> = {
  available: "bg-green-500 text-white",
  pending: "bg-yellow-500 text-white",
  adopted: "bg-blue-500 text-white",
};

const STATUS_LABELS: Record<AnimalStatus, string> = {
  available: "Available for Adoption",
  pending: "Adoption Pending",
  adopted: "Adopted",
};

interface AnimalShowProps extends WithRouterProps {}

interface AnimalShowState {
  showApplication: boolean;
  selectedImageIndex: number;
}

class AnimalShow extends React.Component<AnimalShowProps, AnimalShowState> {
  constructor(props: AnimalShowProps) {
    super(props);
    this.state = { showApplication: false, selectedImageIndex: 0 };
  }

  render() {
    return (
      <Query<FetchAnimalResponse>
        query={FETCH_ANIMAL}
        variables={{ id: this.props.match.params.id }}
      >
        {({ loading, error, data }) => {
          if (loading) {
            return (
              <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-white font-capriola text-2xl animate-pulse">
                  Loading...
                </p>
              </div>
            );
          }

          if (error || !data?.animal) {
            return (
              <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-red-500 font-capriola text-2xl">
                  Error loading animal
                </p>
              </div>
            );
          }

          const animal = data.animal;
          const status = (animal.status || "available") as AnimalStatus;

          return (
            <div className="max-w-4xl mx-auto p-4">
              <div className="flex items-center justify-between mb-6">
                <a
                  href="/#/Landing"
                  className="text-sky-blue font-capriola hover:text-salmon transition-colors"
                >
                  &larr; Back to browsing
                </a>
                <div className="flex items-center gap-3">
                  <ShareButtons
                    title={`Meet ${animal.name}!`}
                    text={`Check out ${animal.name}, a ${animal.age} year old ${animal.type} available for adoption.`}
                    url={`${window.location.origin}/#/AnimalShow/${animal._id}`}
                  />
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${STATUS_STYLES[status]}`}>
                    {STATUS_LABELS[status]}
                  </span>
                </div>
              </div>

              <Card className="bg-white overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="flex flex-col">
                    <div className="min-h-[300px] md:min-h-[400px] flex-1">
                      {(() => {
                        const allImages = [animal.image, ...(animal.images || [])].filter(Boolean);
                        const currentImage = allImages[this.state.selectedImageIndex] || animal.image;
                        return (
                          <>
                            <img
                              src={currentImage}
                              alt={`${animal.name} - Photo ${this.state.selectedImageIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {allImages.length > 1 && (
                              <div className="flex gap-2 p-2 bg-gray-100 overflow-x-auto">
                                {allImages.map((img, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => this.setState({ selectedImageIndex: idx })}
                                    className={`w-16 h-16 flex-shrink-0 rounded overflow-hidden border-2 transition-colors ${
                                      this.state.selectedImageIndex === idx
                                        ? "border-sky-blue"
                                        : "border-transparent hover:border-gray-300"
                                    }`}
                                  >
                                    <img
                                      src={img}
                                      alt={`${animal.name} thumbnail ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col">
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-sky-blue font-capriola text-3xl">
                        {animal.name}
                      </CardTitle>
                      {animal.breed && (
                        <p className="text-muted-foreground text-sm mt-1">{animal.breed}</p>
                      )}
                    </CardHeader>
                    <CardContent className="p-0 flex-1">
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground uppercase">Type</p>
                          <p className="font-semibold text-gray-800">{animal.type}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground uppercase">Age</p>
                          <p className="font-semibold text-gray-800">{animal.age} yrs</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground uppercase">Sex</p>
                          <p className="font-semibold text-gray-800">{animal.sex}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground uppercase">Color</p>
                          <p className="font-semibold text-gray-800">{animal.color}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 italic mb-4">{animal.description}</p>
                    </CardContent>
                    {status === "available" && (
                      <Button
                        variant="salmon"
                        size="lg"
                        className="w-full mt-auto"
                        onClick={() => this.setState({ showApplication: true })}
                      >
                        Apply to Adopt {animal.name}
                      </Button>
                    )}
                    {status === "pending" && (
                      <p className="text-center text-yellow-600 font-capriola text-sm mt-auto">
                        This animal has a pending adoption application.
                      </p>
                    )}
                    {status === "adopted" && (
                      <p className="text-center text-blue-600 font-capriola text-sm mt-auto">
                        This animal has been adopted!
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {animal.video && (
                <Card className="bg-white mt-4 overflow-hidden">
                  <CardContent className="p-4">
                    <h3 className="font-capriola text-sky-blue text-lg mb-3">Video</h3>
                    <video
                      src={animal.video}
                      controls
                      className="w-full rounded-lg max-h-[400px]"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </CardContent>
                </Card>
              )}

              {animal.medicalRecords && animal.medicalRecords.length > 0 && (
                <Card className="bg-white mt-4">
                  <CardHeader>
                    <CardTitle className="text-sky-blue font-capriola text-lg">Medical History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {animal.medicalRecords.map((record: MedicalRecord, idx: number) => (
                        <div key={record._id || idx} className="border-l-4 border-sky-blue pl-3 py-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-medium">{record.recordType}</span>
                            <span className="text-xs text-muted-foreground">{record.date}</span>
                          </div>
                          <p className="text-sm text-gray-800 mt-1">{record.description}</p>
                          {record.veterinarian && (
                            <p className="text-xs text-muted-foreground mt-0.5">Vet: {record.veterinarian}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {this.state.showApplication && status === "available" && (
                <div className="mt-6">
                  <NewApplication animalId={animal._id} />
                </div>
              )}

              <Query<SimilarAnimalsResponse>
                query={SIMILAR_ANIMALS}
                variables={{ animalId: animal._id, limit: 4 }}
              >
                {({ data: similarData }) => {
                  if (!similarData?.similarAnimals?.length) return null;
                  return (
                    <div className="mt-6">
                      <h3 className="font-capriola text-sky-blue text-xl mb-4">
                        Similar Animals You May Like
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {similarData.similarAnimals.map((sim) => (
                          <Link
                            key={sim._id}
                            to={`/animal/${sim._id}`}
                            className="no-underline"
                          >
                            <Card className="bg-white hover:shadow-lg transition-shadow overflow-hidden h-full">
                              <div className="h-32 overflow-hidden">
                                <img
                                  src={sim.image}
                                  alt={sim.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <CardContent className="p-3">
                                <p className="font-capriola text-sky-blue text-sm truncate">
                                  {sim.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {sim.breed || sim.type} &middot; {sim.age} yrs
                                </p>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }}
              </Query>
            </div>
          );
        }}
      </Query>
    );
  }
}

export default withRouter(AnimalShow);
