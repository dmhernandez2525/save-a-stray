import React, { Component } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { WaitlistEntry, ShelterWaitlistsResponse } from "../types";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";

const { SHELTER_WAITLISTS } = Queries;
const { JOIN_WAITLIST, REMOVE_FROM_WAITLIST, UPDATE_WAITLIST_STATUS } = Mutations;

interface WaitlistManagerProps {
  shelterId: string;
}

interface WaitlistManagerState {
  showForm: boolean;
  animalId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  notes: string;
  filterStatus: string;
}

const STATUS_COLORS: Record<string, string> = {
  waiting: "bg-blue-100 text-blue-800",
  notified: "bg-yellow-100 text-yellow-800",
  expired: "bg-gray-100 text-gray-800",
  adopted: "bg-green-100 text-green-800",
};

const STATUS_LABELS: Record<string, string> = {
  waiting: "Waiting",
  notified: "Notified",
  expired: "Expired",
  adopted: "Adopted",
};

class WaitlistManager extends Component<WaitlistManagerProps, WaitlistManagerState> {
  state: WaitlistManagerState = {
    showForm: false,
    animalId: "",
    userName: "",
    userEmail: "",
    userPhone: "",
    notes: "",
    filterStatus: "all",
  };

  resetForm = () => {
    this.setState({
      showForm: false,
      animalId: "",
      userName: "",
      userEmail: "",
      userPhone: "",
      notes: "",
    });
  };

  renderForm(joinWaitlist: (options: { variables: Record<string, unknown> }) => Promise<{ data?: { joinWaitlist: WaitlistEntry } | null }>) {
    const { animalId, userName, userEmail, userPhone, notes } = this.state;

    return (
      <div className="border rounded-lg p-4 mb-4" data-testid="waitlist-form">
        <h4 className="font-medium mb-3">Add to Waitlist</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="wl-animal">Animal ID *</Label>
            <Input
              id="wl-animal"
              value={animalId}
              onChange={(e) => this.setState({ animalId: e.target.value })}
              placeholder="Animal ID"
              data-testid="waitlist-animal-input"
            />
          </div>
          <div>
            <Label htmlFor="wl-name">Name *</Label>
            <Input
              id="wl-name"
              value={userName}
              onChange={(e) => this.setState({ userName: e.target.value })}
              placeholder="Applicant name"
              data-testid="waitlist-name-input"
            />
          </div>
          <div>
            <Label htmlFor="wl-email">Email *</Label>
            <Input
              id="wl-email"
              type="email"
              value={userEmail}
              onChange={(e) => this.setState({ userEmail: e.target.value })}
              placeholder="email@example.com"
              data-testid="waitlist-email-input"
            />
          </div>
          <div>
            <Label htmlFor="wl-phone">Phone</Label>
            <Input
              id="wl-phone"
              value={userPhone}
              onChange={(e) => this.setState({ userPhone: e.target.value })}
              placeholder="(555) 123-4567"
              data-testid="waitlist-phone-input"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="wl-notes">Notes</Label>
            <Input
              id="wl-notes"
              value={notes}
              onChange={(e) => this.setState({ notes: e.target.value })}
              placeholder="Additional notes"
              data-testid="waitlist-notes-input"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            data-testid="submit-waitlist"
            onClick={async () => {
              if (!animalId.trim() || !userName.trim() || !userEmail.trim()) return;
              await joinWaitlist({
                variables: {
                  animalId: animalId.trim(),
                  shelterId: this.props.shelterId,
                  userName: userName.trim(),
                  userEmail: userEmail.trim(),
                  userPhone: userPhone.trim(),
                  notes: notes.trim(),
                },
              });
              this.resetForm();
            }}
          >
            Add to Waitlist
          </Button>
          <Button variant="outline" onClick={this.resetForm} data-testid="cancel-waitlist">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  renderEntry(
    entry: WaitlistEntry,
    removeFromWaitlist: (options: { variables: Record<string, unknown> }) => Promise<{ data?: { removeFromWaitlist: WaitlistEntry } | null }>,
    updateStatus: (options: { variables: Record<string, unknown> }) => Promise<{ data?: { updateWaitlistStatus: WaitlistEntry } | null }>
  ) {
    return (
      <div key={entry._id} className="border rounded-lg p-3 flex items-start justify-between" data-testid="waitlist-entry">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center" data-testid="waitlist-position">
              {entry.position}
            </span>
            <span className="font-medium" data-testid="waitlist-name">{entry.userName}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[entry.status] || STATUS_COLORS.waiting}`}
              data-testid="waitlist-status"
            >
              {STATUS_LABELS[entry.status] || entry.status}
            </span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            <span data-testid="waitlist-email">{entry.userEmail}</span>
            {entry.userPhone && <span className="ml-3" data-testid="waitlist-phone">{entry.userPhone}</span>}
          </div>
          {entry.notes && (
            <p className="text-xs text-muted-foreground mt-1" data-testid="waitlist-notes">{entry.notes}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Animal: {entry.animalId} | Joined: {new Date(entry.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-1 ml-2">
          {entry.status === "waiting" && (
            <Button
              size="sm"
              variant="outline"
              data-testid="notify-btn"
              onClick={() => updateStatus({ variables: { _id: entry._id, status: "notified" } })}
            >
              Notify
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="text-red-600"
            data-testid="remove-btn"
            onClick={() => removeFromWaitlist({ variables: { _id: entry._id } })}
          >
            Remove
          </Button>
        </div>
      </div>
    );
  }

  render() {
    const { shelterId } = this.props;
    const { showForm, filterStatus } = this.state;

    return (
      <Card data-testid="waitlist-manager">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Waitlist Management</CardTitle>
            {!showForm && (
              <Button size="sm" onClick={() => this.setState({ showForm: true })} data-testid="add-waitlist-btn">
                Add to Waitlist
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Mutation
            mutation={JOIN_WAITLIST}
            refetchQueries={[{ query: SHELTER_WAITLISTS, variables: { shelterId } }]}
          >
            {(joinWaitlist: (options: { variables: Record<string, unknown> }) => Promise<{ data?: { joinWaitlist: WaitlistEntry } | null }>) => (
              <>
                {showForm && this.renderForm(joinWaitlist)}
              </>
            )}
          </Mutation>

          <div className="flex gap-2 mb-3">
            {["all", "waiting", "notified", "expired", "adopted"].map((status) => (
              <button
                key={status}
                className={`text-xs px-2 py-1 rounded ${filterStatus === status ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
                onClick={() => this.setState({ filterStatus: status })}
                data-testid={`filter-${status}`}
              >
                {status === "all" ? "All" : STATUS_LABELS[status]}
              </button>
            ))}
          </div>

          <Query<ShelterWaitlistsResponse> query={SHELTER_WAITLISTS} variables={{ shelterId }}>
            {({ loading, error, data }: { loading: boolean; error?: { message: string }; data?: ShelterWaitlistsResponse }) => {
              if (loading) return <p data-testid="loading">Loading waitlist...</p>;
              if (error) return <p className="text-red-500" data-testid="error">Error: {error.message}</p>;
              if (!data || data.shelterWaitlists.length === 0) {
                return <p className="text-muted-foreground" data-testid="empty">No waitlist entries yet.</p>;
              }

              const entries = filterStatus === "all"
                ? data.shelterWaitlists
                : data.shelterWaitlists.filter((e) => e.status === filterStatus);

              const waitingCount = data.shelterWaitlists.filter((e) => e.status === "waiting").length;
              const notifiedCount = data.shelterWaitlists.filter((e) => e.status === "notified").length;

              return (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-4" data-testid="waitlist-stats">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="text-lg font-bold text-blue-700" data-testid="waiting-count">{waitingCount}</p>
                      <p className="text-xs text-muted-foreground">Waiting</p>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded">
                      <p className="text-lg font-bold text-yellow-700" data-testid="notified-count">{notifiedCount}</p>
                      <p className="text-xs text-muted-foreground">Notified</p>
                    </div>
                  </div>

                  <Mutation
                    mutation={REMOVE_FROM_WAITLIST}
                    refetchQueries={[{ query: SHELTER_WAITLISTS, variables: { shelterId } }]}
                  >
                    {(removeFromWaitlist: (options: { variables: Record<string, unknown> }) => Promise<{ data?: { removeFromWaitlist: WaitlistEntry } | null }>) => (
                      <Mutation
                        mutation={UPDATE_WAITLIST_STATUS}
                        refetchQueries={[{ query: SHELTER_WAITLISTS, variables: { shelterId } }]}
                      >
                        {(updateStatus: (options: { variables: Record<string, unknown> }) => Promise<{ data?: { updateWaitlistStatus: WaitlistEntry } | null }>) => (
                          <div className="space-y-2" data-testid="waitlist-list">
                            {entries.length === 0 ? (
                              <p className="text-muted-foreground text-sm" data-testid="filtered-empty">No entries with this status.</p>
                            ) : (
                              entries.map((entry) => this.renderEntry(entry, removeFromWaitlist, updateStatus))
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

export default WaitlistManager;
