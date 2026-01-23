import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Query, Mutation } from "@apollo/client/react/components";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Shelter, Animal, AnimalStatus, FetchShelterResponse } from "../types";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";
import ShelterApplications from "./ShelterApplications";
import ShelterAnalytics from "./ShelterAnalytics";
import StaffManagement from "./StaffManagement";
import BulkImport from "./BulkImport";
import EventCalendar from "./EventCalendar";
import DonationTracker from "./DonationTracker";
import FosterManagement from "./FosterManagement";
import ApplicationTemplateManager from "./ApplicationTemplateManager";
import VerificationBadge from "./VerificationBadge";
import { exportAnimalsCsv } from "../util/exportCsv";

const { FETCH_SHELTER } = Queries;
const { UPDATE_ANIMAL_STATUS, EDIT_SHELTER } = Mutations;

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

interface ContactFormState {
  phone: string;
  email: string;
  website: string;
  hours: string;
  description: string;
}

interface ShelterLandingState {
  statusFilter: AnimalStatus | "all";
  editingContact: boolean;
  contactForm: ContactFormState;
}

class ShelterLanding extends Component<ShelterLandingProps, ShelterLandingState> {
  constructor(props: ShelterLandingProps) {
    super(props);
    this.state = {
      statusFilter: "all",
      editingContact: false,
      contactForm: { phone: '', email: '', website: '', hours: '', description: '' }
    };
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

  startEditContact(shelter: Shelter) {
    this.setState({
      editingContact: true,
      contactForm: {
        phone: shelter.phone || '',
        email: shelter.email || '',
        website: shelter.website || '',
        hours: shelter.hours || '',
        description: shelter.description || ''
      }
    });
  }

  updateContactField(field: keyof ContactFormState, value: string) {
    this.setState((prev) => ({
      contactForm: { ...prev.contactForm, [field]: value }
    }));
  }

  renderContactInfo(shelter: Shelter) {
    const hasContact = shelter.phone || shelter.email || shelter.website || shelter.hours || shelter.description;

    if (this.state.editingContact) {
      return (
        <Mutation
          mutation={EDIT_SHELTER}
          refetchQueries={[{ query: FETCH_SHELTER, variables: { _id: shelter._id } }]}
          onCompleted={() => this.setState({ editingContact: false })}
        >
          {(editShelter: (opts: { variables: Record<string, string> }) => void) => (
            <Card className="bg-white mb-6">
              <CardHeader>
                <CardTitle className="text-sky-blue font-capriola text-lg">Edit Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="contact-phone">Phone</Label>
                    <Input id="contact-phone" value={this.state.contactForm.phone}
                      onChange={(e) => this.updateContactField('phone', e.target.value)}
                      placeholder="(555) 123-4567" className="bg-blue-50" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="contact-email">Contact Email</Label>
                    <Input id="contact-email" value={this.state.contactForm.email}
                      onChange={(e) => this.updateContactField('email', e.target.value)}
                      placeholder="info@shelter.org" className="bg-blue-50" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="contact-website">Website</Label>
                    <Input id="contact-website" value={this.state.contactForm.website}
                      onChange={(e) => this.updateContactField('website', e.target.value)}
                      placeholder="https://www.shelter.org" className="bg-blue-50" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="contact-hours">Hours</Label>
                    <Input id="contact-hours" value={this.state.contactForm.hours}
                      onChange={(e) => this.updateContactField('hours', e.target.value)}
                      placeholder="Mon-Fri 9am-5pm" className="bg-blue-50" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contact-description">About</Label>
                  <Input id="contact-description" value={this.state.contactForm.description}
                    onChange={(e) => this.updateContactField('description', e.target.value)}
                    placeholder="Brief description of your shelter" className="bg-blue-50" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="salmon" onClick={() => editShelter({
                    variables: {
                      _id: shelter._id,
                      name: shelter.name,
                      location: shelter.location,
                      paymentEmail: shelter.paymentEmail,
                      ...this.state.contactForm
                    }
                  })}>Save</Button>
                  <Button variant="outline" onClick={() => this.setState({ editingContact: false })}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </Mutation>
      );
    }

    return (
      <Card className="bg-white mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sky-blue font-capriola text-lg">Contact Information</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => this.startEditContact(shelter)}>
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          {!hasContact ? (
            <p className="text-muted-foreground text-sm">
              No contact information added yet. Click Edit to add your shelter&apos;s contact details.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {shelter.phone && (
                <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{shelter.phone}</span></div>
              )}
              {shelter.email && (
                <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{shelter.email}</span></div>
              )}
              {shelter.website && (
                <div><span className="text-muted-foreground">Website:</span> <a href={shelter.website} target="_blank" rel="noopener noreferrer" className="font-medium text-sky-blue hover:underline">{shelter.website}</a></div>
              )}
              {shelter.hours && (
                <div><span className="text-muted-foreground">Hours:</span> <span className="font-medium">{shelter.hours}</span></div>
              )}
              {shelter.description && (
                <div className="col-span-full"><span className="text-muted-foreground">About:</span> <span className="font-medium">{shelter.description}</span></div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  render() {
    const shelterId = this.props.shelterInfo?._id;

    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-white font-capriola text-3xl">
              {this.props.shelterInfo?.name || "Shelter"} Dashboard
            </h1>
            <VerificationBadge
              verified={this.props.shelterInfo?.verified}
              verifiedAt={this.props.shelterInfo?.verifiedAt}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="salmon" size="lg" asChild>
              <Link to="/newAnimal">+ Add Animal</Link>
            </Button>
          </div>
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
                  {this.renderContactInfo(data?.shelter || {} as Shelter)}

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
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-sky-blue font-capriola">
                        Animals ({filtered.length})
                      </CardTitle>
                      {animals.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportAnimalsCsv(animals, data?.shelter?.name || "shelter")}
                        >
                          Export CSV
                        </Button>
                      )}
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

                  <div className="mt-6">
                    <h2 className="text-white font-capriola text-xl mb-4">Staff</h2>
                    <StaffManagement shelterId={shelterId} />
                  </div>

                  <div className="mt-6">
                    <BulkImport shelterId={shelterId} />
                  </div>

                  <div className="mt-6">
                    <EventCalendar shelterId={shelterId} />
                  </div>

                  <div className="mt-6">
                    <DonationTracker shelterId={shelterId} />
                  </div>

                  <div className="mt-6">
                    <FosterManagement shelterId={shelterId} />
                  </div>

                  <div className="mt-6">
                    <ApplicationTemplateManager shelterId={shelterId} />
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
