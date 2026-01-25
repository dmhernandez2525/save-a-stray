import React, { useState } from "react";
import { Query } from "@apollo/client/react/components";
import Queries from "../graphql/queries";
import NewApplication from "./Application";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
import { FetchAnimalResponse, SimilarAnimalsResponse, AnimalStatus, MedicalRecord } from "../types";
import FavoriteButton from "./FavoriteButton";
import ShareButtons from "./ShareButtons";
import {
  ArrowLeft, Heart, MapPin, Calendar, Palette, PawPrint,
  Stethoscope, FileText, ChevronLeft, ChevronRight, Play,
  Building2, Clock, CheckCircle2, AlertCircle, Info
} from "lucide-react";

const { FETCH_ANIMAL, SIMILAR_ANIMALS } = Queries;

const STATUS_CONFIG: Record<AnimalStatus, { bg: string; text: string; icon: typeof CheckCircle2; label: string }> = {
  available: {
    bg: "bg-success-100 dark:bg-success-900/30",
    text: "text-success-700 dark:text-success-400",
    icon: CheckCircle2,
    label: "Available for Adoption",
  },
  pending: {
    bg: "bg-warning-100 dark:bg-warning-900/30",
    text: "text-warning-700 dark:text-warning-400",
    icon: Clock,
    label: "Adoption Pending",
  },
  adopted: {
    bg: "bg-sky-blue-100 dark:bg-sky-blue-900/30",
    text: "text-sky-blue-700 dark:text-sky-blue-400",
    icon: Heart,
    label: "Adopted",
  },
};

const AnimalShow: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showApplication, setShowApplication] = useState(false);

  return (
    <div className="min-h-screen bg-background col-start-1 col-end-6 row-start-1 row-end-4">
      <Query<FetchAnimalResponse>
        query={FETCH_ANIMAL}
        variables={{ id }}
      >
        {({ loading, error, data }) => {
          if (loading) {
            return (
              <div className="container-wide py-8">
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="grid lg:grid-cols-2 gap-8">
                  <Skeleton className="aspect-square rounded-2xl" />
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </div>
              </div>
            );
          }

          if (error || !data?.animal) {
            return (
              <div className="container-wide py-12">
                <Card className="max-w-md mx-auto p-8 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
                  <h2 className="font-capriola text-xl mb-2">Animal Not Found</h2>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find the animal you're looking for.
                  </p>
                  <Button variant="skyBlue" onClick={() => navigate("/Landing")}>
                    Browse All Pets
                  </Button>
                </Card>
              </div>
            );
          }

          const animal = data.animal;
          const status = (animal.status || "available") as AnimalStatus;
          const statusConfig = STATUS_CONFIG[status];
          const StatusIcon = statusConfig.icon;
          const allImages = [animal.image, ...(animal.images || [])].filter(Boolean);

          return (
            <>
              {/* Breadcrumb */}
              <div className="bg-muted/50 border-b">
                <div className="container-wide py-4">
                  <Link
                    to="/Landing"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to browsing
                  </Link>
                </div>
              </div>

              <div className="container-wide py-8">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                  {/* Image Gallery */}
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                      <img
                        src={allImages[selectedImageIndex] || animal.image}
                        alt={`${animal.name} - Photo ${selectedImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Navigation Arrows */}
                      {allImages.length > 1 && (
                        <>
                          <button
                            onClick={() => setSelectedImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-warm-gray-800/90 flex items-center justify-center text-foreground hover:bg-white dark:hover:bg-warm-gray-800 transition-colors shadow-lg"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setSelectedImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-warm-gray-800/90 flex items-center justify-center text-foreground hover:bg-white dark:hover:bg-warm-gray-800 transition-colors shadow-lg"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </>
                      )}

                      {/* Favorite Button */}
                      <div className="absolute top-4 right-4">
                        <FavoriteButton animalId={animal._id} />
                      </div>

                      {/* Image Counter */}
                      {allImages.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                          {selectedImageIndex + 1} / {allImages.length}
                        </div>
                      )}
                    </div>

                    {/* Thumbnail Strip */}
                    {allImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {allImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                              selectedImageIndex === idx
                                ? "border-sky-blue-500 ring-2 ring-sky-blue-500/20"
                                : "border-transparent hover:border-muted-foreground/30"
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

                    {/* Video */}
                    {animal.video && (
                      <Card className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Play className="h-4 w-4 text-sky-blue-500" />
                            <span className="font-medium">Video</span>
                          </div>
                          <video
                            src={animal.video}
                            controls
                            className="w-full rounded-lg"
                          >
                            Your browser does not support the video tag.
                          </video>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Details */}
                  <div>
                    {/* Header */}
                    <div className="mb-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h1 className="font-capriola text-3xl md:text-4xl text-foreground">
                          {animal.name}
                        </h1>
                        <ShareButtons
                          title={`Meet ${animal.name}!`}
                          text={`Check out ${animal.name}, a ${animal.age} year old ${animal.type} available for adoption.`}
                          url={`${window.location.origin}/#/AnimalShow/${animal._id}`}
                        />
                      </div>
                      <p className="text-muted-foreground text-lg">
                        {animal.breed || animal.type}
                      </p>

                      {/* Status Badge */}
                      <div className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl ${statusConfig.bg}`}>
                        <StatusIcon className={`h-4 w-4 ${statusConfig.text}`} />
                        <span className={`font-medium ${statusConfig.text}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      <div className="bg-muted/50 rounded-xl p-4 text-center">
                        <PawPrint className="h-5 w-5 mx-auto mb-1 text-sky-blue-500" />
                        <p className="text-xs text-muted-foreground uppercase">Type</p>
                        <p className="font-semibold">{animal.type}</p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-4 text-center">
                        <Calendar className="h-5 w-5 mx-auto mb-1 text-sky-blue-500" />
                        <p className="text-xs text-muted-foreground uppercase">Age</p>
                        <p className="font-semibold">{animal.age} year{animal.age !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-4 text-center">
                        <Info className="h-5 w-5 mx-auto mb-1 text-sky-blue-500" />
                        <p className="text-xs text-muted-foreground uppercase">Sex</p>
                        <p className="font-semibold">{animal.sex}</p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-4 text-center">
                        <Palette className="h-5 w-5 mx-auto mb-1 text-sky-blue-500" />
                        <p className="text-xs text-muted-foreground uppercase">Color</p>
                        <p className="font-semibold">{animal.color}</p>
                      </div>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="about" className="mb-6">
                      <TabsList className="w-full">
                        <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
                        <TabsTrigger value="medical" className="flex-1">Medical</TabsTrigger>
                        <TabsTrigger value="shelter" className="flex-1">Shelter</TabsTrigger>
                      </TabsList>

                      <TabsContent value="about" className="mt-4">
                        {animal.description ? (
                          <p className="text-muted-foreground leading-relaxed">
                            {animal.description}
                          </p>
                        ) : (
                          <p className="text-muted-foreground italic">
                            No description available yet. Contact the shelter for more information about {animal.name}.
                          </p>
                        )}
                      </TabsContent>

                      <TabsContent value="medical" className="mt-4">
                        {animal.medicalRecords && animal.medicalRecords.length > 0 ? (
                          <div className="space-y-4">
                            {animal.medicalRecords.map((record: MedicalRecord, idx: number) => (
                              <div
                                key={record._id || idx}
                                className="flex gap-4 p-4 bg-muted/50 rounded-xl"
                              >
                                <div className="w-10 h-10 rounded-full bg-sky-blue-100 dark:bg-sky-blue-900/30 flex items-center justify-center flex-shrink-0">
                                  <Stethoscope className="h-5 w-5 text-sky-blue-600 dark:text-sky-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="secondary">{record.recordType}</Badge>
                                    <span className="text-xs text-muted-foreground">{record.date}</span>
                                  </div>
                                  <p className="text-sm">{record.description}</p>
                                  {record.veterinarian && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Veterinarian: {record.veterinarian}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Stethoscope className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                            <p className="text-muted-foreground">
                              No medical records available yet.
                            </p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="shelter" className="mt-4">
                        <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl">
                          <div className="w-12 h-12 rounded-xl bg-salmon-100 dark:bg-salmon-900/30 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-6 w-6 text-salmon-600 dark:text-salmon-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">
                              {animal.shelter?.name || "Partner Shelter"}
                            </h3>
                            {animal.shelter?.location && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {animal.shelter.location}
                              </p>
                            )}
                            <Button
                              variant="link"
                              className="h-auto p-0 text-sky-blue-500 mt-2"
                              onClick={() => {
                                // Navigate to shelter page when implemented
                              }}
                            >
                              View shelter profile
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* CTA */}
                    {status === "available" && !showApplication && (
                      <Button
                        variant="skyBlue"
                        size="xl"
                        className="w-full"
                        onClick={() => setShowApplication(true)}
                      >
                        <Heart className="h-5 w-5 mr-2" />
                        Apply to Adopt {animal.name}
                      </Button>
                    )}

                    {status === "pending" && (
                      <div className="bg-warning-50 dark:bg-warning-950 border border-warning-200 dark:border-warning-800 rounded-xl p-4 text-center">
                        <Clock className="h-6 w-6 mx-auto text-warning-600 dark:text-warning-400 mb-2" />
                        <p className="text-warning-700 dark:text-warning-300 font-medium">
                          This animal has a pending adoption application
                        </p>
                        <p className="text-sm text-warning-600 dark:text-warning-400 mt-1">
                          Check back later or browse other available pets
                        </p>
                      </div>
                    )}

                    {status === "adopted" && (
                      <div className="bg-sky-blue-50 dark:bg-sky-blue-950 border border-sky-blue-200 dark:border-sky-blue-800 rounded-xl p-4 text-center">
                        <Heart className="h-6 w-6 mx-auto text-sky-blue-600 dark:text-sky-blue-400 mb-2 fill-current" />
                        <p className="text-sky-blue-700 dark:text-sky-blue-300 font-medium">
                          {animal.name} has found their forever home!
                        </p>
                        <p className="text-sm text-sky-blue-600 dark:text-sky-blue-400 mt-1">
                          Browse other pets looking for loving families
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Application Form */}
                {showApplication && status === "available" && (
                  <div className="mt-12 max-w-2xl mx-auto">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-sky-blue-500" />
                          Adoption Application for {animal.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <NewApplication animalId={animal._id} />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Similar Animals */}
                <Query<SimilarAnimalsResponse>
                  query={SIMILAR_ANIMALS}
                  variables={{ animalId: animal._id, limit: 4 }}
                >
                  {({ data: similarData }) => {
                    if (!similarData?.similarAnimals?.length) return null;
                    return (
                      <div className="mt-12">
                        <Separator className="mb-8" />
                        <h2 className="font-capriola text-2xl mb-6">
                          You May Also Like
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {similarData.similarAnimals.map((sim) => (
                            <Link
                              key={sim._id}
                              to={`/AnimalShow/${sim._id}`}
                              className="group"
                            >
                              <Card variant="interactive" className="overflow-hidden h-full">
                                <div className="relative h-40 overflow-hidden">
                                  <img
                                    src={sim.image}
                                    alt={sim.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-warm-gray-900/60 via-transparent to-transparent" />
                                  <div className="absolute bottom-2 left-2 right-2">
                                    <p className="font-capriola text-white text-lg truncate">
                                      {sim.name}
                                    </p>
                                  </div>
                                </div>
                                <CardContent className="p-3">
                                  <p className="text-sm text-muted-foreground">
                                    {sim.breed || sim.type} &middot; {sim.age} yr{sim.age !== 1 ? "s" : ""}
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
            </>
          );
        }}
      </Query>
    </div>
  );
};

export default AnimalShow;
