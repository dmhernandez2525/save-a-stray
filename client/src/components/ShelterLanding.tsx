import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Query, Mutation } from "@apollo/client/react/components";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Shelter, Animal, AnimalStatus, FetchShelterResponse } from "../types";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";
import ShelterDashboardLayout from "./layouts/ShelterDashboardLayout";
import ShelterApplications from "./ShelterApplications";
import ShelterAnalytics from "./ShelterAnalytics";
import StaffManagement from "./StaffManagement";
import BulkImport from "./BulkImport";
import EventCalendar from "./EventCalendar";
import DonationTracker from "./DonationTracker";
import FosterManagement from "./FosterManagement";
import ApplicationTemplateManager from "./ApplicationTemplateManager";
import ActivityFeed from "./ActivityFeed";
import TerminalReaderManager from "./TerminalReaderManager";
import MessagingPanel from "./MessagingPanel";
import VolunteerManager from "./VolunteerManager";
import BehaviorNoteManager from "./BehaviorNoteManager";
import AnnouncementManager from "./AnnouncementManager";
import MicrochipManager from "./MicrochipManager";
import WeightTracker from "./WeightTracker";
import VaccinationManager from "./VaccinationManager";
import AdoptionFeeManager from "./AdoptionFeeManager";
import SpayNeuterManager from "./SpayNeuterManager";
import IntakeLogManager from "./IntakeLogManager";
import OutcomeLogManager from "./OutcomeLogManager";
import { exportAnimalsCsv } from "../util/exportCsv";
import {
  PawPrint, Plus, Download, Search, Eye, Edit2,
  Phone, Mail, Globe, Clock, FileText, ChevronRight,
  TrendingUp, ClipboardList, Heart, CheckCircle2,
  AlertCircle, XCircle
} from "lucide-react";

const { FETCH_SHELTER } = Queries;
const { UPDATE_ANIMAL_STATUS, EDIT_SHELTER } = Mutations;

const STATUS_CONFIG: Record<AnimalStatus, { bg: string; text: string; label: string }> = {
  available: {
    bg: "bg-success-100 dark:bg-success-900/30",
    text: "text-success-700 dark:text-success-400",
    label: "Available",
  },
  pending: {
    bg: "bg-warning-100 dark:bg-warning-900/30",
    text: "text-warning-700 dark:text-warning-400",
    label: "Pending",
  },
  adopted: {
    bg: "bg-sky-blue-100 dark:bg-sky-blue-900/30",
    text: "text-sky-blue-700 dark:text-sky-blue-400",
    label: "Adopted",
  },
};

interface ShelterLandingProps {
  shelterInfo?: Shelter;
}

interface ContactFormState {
  phone: string;
  email: string;
  website: string;
  hours: string;
  description: string;
}

const ShelterLanding: React.FC<ShelterLandingProps> = ({ shelterInfo }) => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [statusFilter, setStatusFilter] = useState<AnimalStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingContact, setEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState<ContactFormState>({
    phone: "",
    email: "",
    website: "",
    hours: "",
    description: "",
  });

  const shelterId = shelterInfo?._id;

  const filterAnimals = (animals: Animal[]): Animal[] => {
    let filtered = animals;
    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => (a.status || "available") === statusFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.breed?.toLowerCase().includes(query) ||
          a.type.toLowerCase().includes(query)
      );
    }
    return filtered;
  };

  const startEditContact = (shelter: Shelter) => {
    setEditingContact(true);
    setContactForm({
      phone: shelter.phone || "",
      email: shelter.email || "",
      website: shelter.website || "",
      hours: shelter.hours || "",
      description: shelter.description || "",
    });
  };

  if (!shelterId) {
    return (
      <ShelterDashboardLayout
        shelterName="Shelter"
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      >
        <Card className="max-w-md mx-auto">
          <CardContent className="p-4 sm:p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-warning-500 mb-4" />
            <h2 className="font-capriola text-xl mb-2">No Shelter Found</h2>
            <p className="text-muted-foreground mb-6">
              No shelter is associated with your account. Please complete your shelter registration.
            </p>
            <Button variant="skyBlue" asChild>
              <Link to="/newShelter">Register Shelter</Link>
            </Button>
          </CardContent>
        </Card>
      </ShelterDashboardLayout>
    );
  }

  return (
    <Query<FetchShelterResponse>
      query={FETCH_SHELTER}
      variables={{ _id: shelterId }}
    >
      {({ loading, error, data }) => {
        if (loading) {
          return (
            <ShelterDashboardLayout
              shelterName={shelterInfo?.name || "Loading..."}
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
                <Skeleton className="h-64 rounded-xl" />
              </div>
            </ShelterDashboardLayout>
          );
        }

        if (error) {
          return (
            <ShelterDashboardLayout
              shelterName={shelterInfo?.name || "Shelter"}
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            >
              <Card className="max-w-md mx-auto">
                <CardContent className="p-4 sm:p-8 text-center">
                  <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
                  <h2 className="font-capriola text-xl mb-2">Error Loading Data</h2>
                  <p className="text-muted-foreground">
                    Unable to load shelter data. Please try again later.
                  </p>
                </CardContent>
              </Card>
            </ShelterDashboardLayout>
          );
        }

        const shelter = data?.shelter;
        const animals = shelter?.animals || [];
        const filtered = filterAnimals(animals);

        const counts = {
          all: animals.length,
          available: animals.filter((a) => (a.status || "available") === "available").length,
          pending: animals.filter((a) => a.status === "pending").length,
          adopted: animals.filter((a) => a.status === "adopted").length,
        };

        const renderSection = () => {
          switch (activeSection) {
            case "dashboard":
              return (
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                      title="Total Animals"
                      value={counts.all}
                      icon={PawPrint}
                      color="sky-blue"
                    />
                    <StatCard
                      title="Available"
                      value={counts.available}
                      icon={CheckCircle2}
                      color="success"
                      trend="+2 this week"
                    />
                    <StatCard
                      title="Pending"
                      value={counts.pending}
                      icon={Clock}
                      color="warning"
                    />
                    <StatCard
                      title="Adopted"
                      value={counts.adopted}
                      icon={Heart}
                      color="salmon"
                      trend="+5 this month"
                    />
                  </div>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        <Button variant="skyBlue" asChild>
                          <Link to="/newAnimal">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Animal
                          </Link>
                        </Button>
                        <Button variant="outline" onClick={() => setActiveSection("applications")}>
                          <ClipboardList className="h-4 w-4 mr-2" />
                          View Applications
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => exportAnimalsCsv(animals, shelter?.name || "shelter")}
                          disabled={animals.length === 0}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Animals
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Info */}
                  {renderContactInfo(shelter || ({} as Shelter))}

                  {/* Recent Animals */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Recent Animals</CardTitle>
                        <CardDescription>Your latest additions</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setActiveSection("animals")}>
                        View All
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {animals.length === 0 ? (
                        <div className="text-center py-8">
                          <PawPrint className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                          <p className="text-muted-foreground mb-4">
                            No animals yet. Add your first animal to get started!
                          </p>
                          <Button variant="skyBlue" asChild>
                            <Link to="/newAnimal">
                              <Plus className="h-4 w-4 mr-2" />
                              Add First Animal
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {animals.slice(0, 5).map((animal) => (
                            <AnimalRow key={animal._id} animal={animal} shelterId={shelterId} />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );

            case "analytics":
              return <ShelterAnalytics shelterId={shelterId} />;

            case "activity":
              return <ActivityFeed shelterId={shelterId} />;

            case "animals":
              return (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-capriola">All Animals</h2>
                      <p className="text-muted-foreground">
                        Manage your shelter's animals
                      </p>
                    </div>
                    <Button variant="skyBlue" asChild>
                      <Link to="/newAnimal">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Animal
                      </Link>
                    </Button>
                  </div>

                  {/* Filters */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search animals..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Select
                          value={statusFilter}
                          onValueChange={(v) => setStatusFilter(v as AnimalStatus | "all")}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status ({counts.all})</SelectItem>
                            <SelectItem value="available">Available ({counts.available})</SelectItem>
                            <SelectItem value="pending">Pending ({counts.pending})</SelectItem>
                            <SelectItem value="adopted">Adopted ({counts.adopted})</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          onClick={() => exportAnimalsCsv(filtered, shelter?.name || "shelter")}
                          disabled={filtered.length === 0}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Animal List */}
                  <Card>
                    <CardContent className="p-0">
                      {filtered.length === 0 ? (
                        <div className="text-center py-12">
                          <PawPrint className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                          <p className="text-muted-foreground">
                            {searchQuery || statusFilter !== "all"
                              ? "No animals match your filters"
                              : "No animals yet"}
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {filtered.map((animal) => (
                            <AnimalRow key={animal._id} animal={animal} shelterId={shelterId} />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );

            case "bulk-import":
              return <BulkImport shelterId={shelterId} />;

            case "vaccinations":
              return (
                <VaccinationManager
                  shelterId={shelterId}
                  animals={animals.map((a) => ({ _id: a._id, name: a.name }))}
                />
              );

            case "weight":
              return (
                <WeightTracker
                  shelterId={shelterId}
                  animals={animals.map((a) => ({ _id: a._id, name: a.name }))}
                />
              );

            case "spay-neuter":
              return (
                <SpayNeuterManager
                  shelterId={shelterId}
                  animals={animals.map((a) => ({ _id: a._id, name: a.name }))}
                />
              );

            case "behavior":
              return (
                <BehaviorNoteManager
                  shelterId={shelterId}
                  animals={animals.map((a) => ({ _id: a._id, name: a.name }))}
                />
              );

            case "applications":
              return <ShelterApplications shelterId={shelterId} />;

            case "templates":
              return <ApplicationTemplateManager shelterId={shelterId} />;

            case "staff":
              return <StaffManagement shelterId={shelterId} />;

            case "volunteers":
              return <VolunteerManager shelterId={shelterId} />;

            case "fosters":
              return <FosterManagement shelterId={shelterId} />;

            case "messages":
              return <MessagingPanel shelterId={shelterId} currentUserId={shelterId} />;

            case "announcements":
              return <AnnouncementManager shelterId={shelterId} />;

            case "donations":
              return <DonationTracker shelterId={shelterId} />;

            case "fees":
              return <AdoptionFeeManager shelterId={shelterId} />;

            case "terminal":
              return <TerminalReaderManager shelterId={shelterId} />;

            case "intake":
              return (
                <IntakeLogManager
                  shelterId={shelterId}
                  animals={animals.map((a) => ({ _id: a._id, name: a.name }))}
                />
              );

            case "outcome":
              return (
                <OutcomeLogManager
                  shelterId={shelterId}
                  animals={animals.map((a) => ({ _id: a._id, name: a.name }))}
                />
              );

            case "microchips":
              return (
                <MicrochipManager
                  shelterId={shelterId}
                  animals={animals.map((a) => ({ _id: a._id, name: a.name }))}
                />
              );

            case "calendar":
              return <EventCalendar shelterId={shelterId} />;

            default:
              return null;
          }
        };

        const renderContactInfo = (shelter: Shelter) => {
          const hasContact = shelter.phone || shelter.email || shelter.website || shelter.hours || shelter.description;

          if (editingContact) {
            return (
              <Mutation
                mutation={EDIT_SHELTER}
                refetchQueries={[{ query: FETCH_SHELTER, variables: { _id: shelter._id } }]}
                onCompleted={() => setEditingContact(false)}
              >
                {(editShelter: (opts: { variables: Record<string, string> }) => void) => (
                  <Card>
                    <CardHeader>
                      <CardTitle>Edit Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact-phone">Phone</Label>
                          <Input
                            id="contact-phone"
                            value={contactForm.phone}
                            onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                            placeholder="(555) 123-4567"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-email">Contact Email</Label>
                          <Input
                            id="contact-email"
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            placeholder="info@shelter.org"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-website">Website</Label>
                          <Input
                            id="contact-website"
                            value={contactForm.website}
                            onChange={(e) => setContactForm({ ...contactForm, website: e.target.value })}
                            placeholder="https://www.shelter.org"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-hours">Hours</Label>
                          <Input
                            id="contact-hours"
                            value={contactForm.hours}
                            onChange={(e) => setContactForm({ ...contactForm, hours: e.target.value })}
                            placeholder="Mon-Fri 9am-5pm"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-description">About</Label>
                        <Input
                          id="contact-description"
                          value={contactForm.description}
                          onChange={(e) => setContactForm({ ...contactForm, description: e.target.value })}
                          placeholder="Brief description of your shelter"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="skyBlue"
                          onClick={() =>
                            editShelter({
                              variables: {
                                _id: shelter._id,
                                name: shelter.name,
                                location: shelter.location,
                                paymentEmail: shelter.paymentEmail,
                                ...contactForm,
                              },
                            })
                          }
                        >
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setEditingContact(false)}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </Mutation>
            );
          }

          return (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Public contact details for adopters</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => startEditContact(shelter)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                {!hasContact ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">
                      No contact information added yet.
                    </p>
                    <Button variant="outline" onClick={() => startEditContact(shelter)}>
                      Add Contact Info
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shelter.phone && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="font-medium">{shelter.phone}</p>
                        </div>
                      </div>
                    )}
                    {shelter.email && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="font-medium">{shelter.email}</p>
                        </div>
                      </div>
                    )}
                    {shelter.website && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Globe className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Website</p>
                          <a
                            href={shelter.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-sky-blue-500 hover:underline"
                          >
                            {shelter.website}
                          </a>
                        </div>
                      </div>
                    )}
                    {shelter.hours && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Hours</p>
                          <p className="font-medium">{shelter.hours}</p>
                        </div>
                      </div>
                    )}
                    {shelter.description && (
                      <div className="col-span-full flex items-start gap-3 pt-2">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">About</p>
                          <p className="text-muted-foreground">{shelter.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        };

        return (
          <ShelterDashboardLayout
            shelterName={shelter?.name || shelterInfo?.name || "Shelter"}
            verified={shelter?.verified || shelterInfo?.verified}
            verifiedAt={shelter?.verifiedAt || shelterInfo?.verifiedAt}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          >
            {renderSection()}
          </ShelterDashboardLayout>
        );
      }}
    </Query>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: typeof PawPrint;
  color: "sky-blue" | "success" | "warning" | "salmon";
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    "sky-blue": "bg-sky-blue-100 dark:bg-sky-blue-900/30 text-sky-blue-600 dark:text-sky-blue-400",
    success: "bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400",
    warning: "bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400",
    salmon: "bg-salmon-100 dark:bg-salmon-900/30 text-salmon-600 dark:text-salmon-400",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold mt-1">{value}</p>
            {trend && (
              <p className="text-xs text-success-600 dark:text-success-400 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Animal Row Component
interface AnimalRowProps {
  animal: Animal;
  shelterId: string;
}

const AnimalRow: React.FC<AnimalRowProps> = ({ animal, shelterId }) => {
  const status = (animal.status || "available") as AnimalStatus;
  const statusConfig = STATUS_CONFIG[status];

  return (
    <Mutation
      mutation={UPDATE_ANIMAL_STATUS}
      refetchQueries={[{ query: FETCH_SHELTER, variables: { _id: shelterId } }]}
    >
      {(updateStatus: (opts: { variables: { _id: string; status: string } }) => void) => (
        <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
            <img src={animal.image} alt={animal.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{animal.name}</p>
            <p className="text-sm text-muted-foreground">
              {animal.breed && `${animal.breed} · `}
              {animal.type} · {animal.age} yr{animal.age !== 1 ? "s" : ""} · {animal.sex}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0`}>
              {statusConfig.label}
            </Badge>
            <Select
              value={status}
              onValueChange={(value) => updateStatus({ variables: { _id: animal._id, status: value } })}
            >
              <SelectTrigger className="w-[130px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="adopted">Adopted</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/AnimalShow/${animal._id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </Mutation>
  );
};

export default ShelterLanding;
