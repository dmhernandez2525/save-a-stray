import React, { Component } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Volunteer, ShelterVolunteersResponse } from "../types";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";

const { SHELTER_VOLUNTEERS } = Queries;
const { ADD_VOLUNTEER, UPDATE_VOLUNTEER_STATUS, LOG_VOLUNTEER_HOURS } = Mutations;

interface VolunteerManagerProps {
  shelterId: string;
}

interface VolunteerManagerState {
  showForm: boolean;
  name: string;
  email: string;
  phone: string;
  skills: string;
  availability: string;
  notes: string;
  hoursInput: Record<string, string>;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  pending: "Pending",
};

class VolunteerManager extends Component<VolunteerManagerProps, VolunteerManagerState> {
  state: VolunteerManagerState = {
    showForm: false,
    name: "",
    email: "",
    phone: "",
    skills: "",
    availability: "",
    notes: "",
    hoursInput: {},
  };

  resetForm = () => {
    this.setState({
      showForm: false,
      name: "",
      email: "",
      phone: "",
      skills: "",
      availability: "",
      notes: "",
    });
  };

  renderForm(addVolunteer: (options: { variables: Record<string, unknown> }) => Promise<{ data?: { addVolunteer: Volunteer } | null }>) {
    const { name, email, phone, skills, availability, notes } = this.state;

    return (
      <div className="border rounded-lg p-4 mb-4" data-testid="volunteer-form">
        <h4 className="font-medium mb-3">Add New Volunteer</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="vol-name">Name *</Label>
            <Input
              id="vol-name"
              value={name}
              onChange={(e) => this.setState({ name: e.target.value })}
              placeholder="Full name"
              data-testid="volunteer-name-input"
            />
          </div>
          <div>
            <Label htmlFor="vol-email">Email</Label>
            <Input
              id="vol-email"
              type="email"
              value={email}
              onChange={(e) => this.setState({ email: e.target.value })}
              placeholder="email@example.com"
              data-testid="volunteer-email-input"
            />
          </div>
          <div>
            <Label htmlFor="vol-phone">Phone</Label>
            <Input
              id="vol-phone"
              value={phone}
              onChange={(e) => this.setState({ phone: e.target.value })}
              placeholder="(555) 123-4567"
              data-testid="volunteer-phone-input"
            />
          </div>
          <div>
            <Label htmlFor="vol-availability">Availability</Label>
            <Input
              id="vol-availability"
              value={availability}
              onChange={(e) => this.setState({ availability: e.target.value })}
              placeholder="e.g. Weekends, Mon/Wed/Fri"
              data-testid="volunteer-availability-input"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="vol-skills">Skills (comma-separated)</Label>
            <Input
              id="vol-skills"
              value={skills}
              onChange={(e) => this.setState({ skills: e.target.value })}
              placeholder="e.g. dog walking, grooming, training"
              data-testid="volunteer-skills-input"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="vol-notes">Notes</Label>
            <Input
              id="vol-notes"
              value={notes}
              onChange={(e) => this.setState({ notes: e.target.value })}
              placeholder="Additional notes"
              data-testid="volunteer-notes-input"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            data-testid="submit-volunteer"
            onClick={async () => {
              if (!name.trim()) return;
              const skillsArray = skills
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s.length > 0);
              await addVolunteer({
                variables: {
                  shelterId: this.props.shelterId,
                  name: name.trim(),
                  email: email.trim(),
                  phone: phone.trim(),
                  skills: skillsArray,
                  availability: availability.trim(),
                  notes: notes.trim(),
                },
              });
              this.resetForm();
            }}
          >
            Add Volunteer
          </Button>
          <Button variant="outline" onClick={this.resetForm} data-testid="cancel-volunteer">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  renderVolunteerCard(
    volunteer: Volunteer,
    updateStatus: (options: { variables: Record<string, unknown> }) => Promise<{ data?: { updateVolunteerStatus: Volunteer } | null }>,
    logHours: (options: { variables: Record<string, unknown> }) => Promise<{ data?: { logVolunteerHours: Volunteer } | null }>
  ) {
    const hoursValue = this.state.hoursInput[volunteer._id] || "";

    return (
      <div key={volunteer._id} className="border rounded-lg p-4" data-testid="volunteer-card">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium" data-testid="volunteer-name">{volunteer.name}</h4>
            {volunteer.email && (
              <p className="text-sm text-muted-foreground" data-testid="volunteer-email">{volunteer.email}</p>
            )}
            {volunteer.phone && (
              <p className="text-sm text-muted-foreground" data-testid="volunteer-phone">{volunteer.phone}</p>
            )}
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[volunteer.status] || STATUS_COLORS.pending}`}
            data-testid="volunteer-status"
          >
            {STATUS_LABELS[volunteer.status] || volunteer.status}
          </span>
        </div>

        {volunteer.skills.length > 0 && (
          <div className="mt-2" data-testid="volunteer-skills">
            <span className="text-xs text-muted-foreground">Skills: </span>
            {volunteer.skills.map((skill, i) => (
              <span key={i} className="inline-block bg-blue-100 text-blue-800 text-xs rounded px-2 py-0.5 mr-1 mb-1">
                {skill}
              </span>
            ))}
          </div>
        )}

        {volunteer.availability && (
          <p className="text-sm mt-1" data-testid="volunteer-availability">
            <span className="text-muted-foreground">Availability:</span> {volunteer.availability}
          </p>
        )}

        <div className="flex items-center gap-4 mt-2">
          <span className="text-sm" data-testid="volunteer-hours">
            <span className="font-medium">{volunteer.totalHours}</span> hours logged
          </span>
          <span className="text-xs text-muted-foreground">
            Since {new Date(volunteer.startDate).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {volunteer.status === "pending" && (
            <Button
              size="sm"
              data-testid="activate-volunteer"
              onClick={() => updateStatus({ variables: { _id: volunteer._id, status: "active" } })}
            >
              Activate
            </Button>
          )}
          {volunteer.status === "active" && (
            <Button
              size="sm"
              variant="outline"
              data-testid="deactivate-volunteer"
              onClick={() => updateStatus({ variables: { _id: volunteer._id, status: "inactive" } })}
            >
              Deactivate
            </Button>
          )}
          {volunteer.status === "inactive" && (
            <Button
              size="sm"
              variant="outline"
              data-testid="reactivate-volunteer"
              onClick={() => updateStatus({ variables: { _id: volunteer._id, status: "active" } })}
            >
              Reactivate
            </Button>
          )}
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min="1"
              className="w-20 h-8"
              placeholder="Hrs"
              value={hoursValue}
              onChange={(e) =>
                this.setState({
                  hoursInput: { ...this.state.hoursInput, [volunteer._id]: e.target.value },
                })
              }
              data-testid="hours-input"
            />
            <Button
              size="sm"
              variant="outline"
              data-testid="log-hours-btn"
              onClick={async () => {
                const hours = parseInt(hoursValue);
                if (hours > 0) {
                  await logHours({ variables: { _id: volunteer._id, hours } });
                  this.setState({
                    hoursInput: { ...this.state.hoursInput, [volunteer._id]: "" },
                  });
                }
              }}
            >
              Log Hours
            </Button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { shelterId } = this.props;
    const { showForm } = this.state;

    return (
      <Card data-testid="volunteer-manager">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Volunteer Management</CardTitle>
            {!showForm && (
              <Button size="sm" onClick={() => this.setState({ showForm: true })} data-testid="add-volunteer-btn">
                Add Volunteer
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Mutation
            mutation={ADD_VOLUNTEER}
            refetchQueries={[{ query: SHELTER_VOLUNTEERS, variables: { shelterId } }]}
          >
            {(addVolunteer: (options: { variables: Record<string, unknown> }) => Promise<{ data?: { addVolunteer: Volunteer } | null }>) => (
              <>
                {showForm && this.renderForm(addVolunteer)}
              </>
            )}
          </Mutation>

          <Query<ShelterVolunteersResponse> query={SHELTER_VOLUNTEERS} variables={{ shelterId }}>
            {({ loading, error, data }: { loading: boolean; error?: { message: string }; data?: ShelterVolunteersResponse }) => {
              if (loading) return <p data-testid="loading">Loading volunteers...</p>;
              if (error) return <p className="text-red-500" data-testid="error">Error: {error.message}</p>;
              if (!data || data.shelterVolunteers.length === 0) {
                return <p className="text-muted-foreground" data-testid="empty">No volunteers registered yet.</p>;
              }

              const volunteers = data.shelterVolunteers;
              const activeCount = volunteers.filter((v) => v.status === "active").length;
              const pendingCount = volunteers.filter((v) => v.status === "pending").length;
              const totalHours = volunteers.reduce((sum, v) => sum + v.totalHours, 0);

              return (
                <div>
                  <div className="grid grid-cols-3 gap-4 mb-4" data-testid="volunteer-stats">
                    <div className="text-center p-2 bg-green-50 rounded">
                      <p className="text-lg font-bold text-green-700" data-testid="active-count">{activeCount}</p>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded">
                      <p className="text-lg font-bold text-yellow-700" data-testid="pending-count">{pendingCount}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="text-lg font-bold text-blue-700" data-testid="total-hours">{totalHours}</p>
                      <p className="text-xs text-muted-foreground">Total Hours</p>
                    </div>
                  </div>

                  <Mutation
                    mutation={UPDATE_VOLUNTEER_STATUS}
                    refetchQueries={[{ query: SHELTER_VOLUNTEERS, variables: { shelterId } }]}
                  >
                    {(updateStatus: (options: { variables: Record<string, unknown> }) => Promise<{ data?: { updateVolunteerStatus: Volunteer } | null }>) => (
                      <Mutation
                        mutation={LOG_VOLUNTEER_HOURS}
                        refetchQueries={[{ query: SHELTER_VOLUNTEERS, variables: { shelterId } }]}
                      >
                        {(logHours: (options: { variables: Record<string, unknown> }) => Promise<{ data?: { logVolunteerHours: Volunteer } | null }>) => (
                          <div className="space-y-3" data-testid="volunteer-list">
                            {volunteers.map((volunteer) =>
                              this.renderVolunteerCard(volunteer, updateStatus, logHours)
                            )}
                          </div>
                        )}
                      </Mutation>
                    )}
                  </Mutation>
                </div>
              );
            }}
          </Query>
        </CardContent>
      </Card>
    );
  }
}

export default VolunteerManager;
