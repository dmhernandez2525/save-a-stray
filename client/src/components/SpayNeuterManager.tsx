import React, { Component } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { SpayNeuterRecord, SpayNeuterStatus, ShelterSpayNeuterResponse } from "../types";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";

const { SHELTER_SPAY_NEUTER } = Queries;
const { SCHEDULE_SPAY_NEUTER, UPDATE_SPAY_NEUTER_STATUS } = Mutations;

const STATUS_STYLES: Record<SpayNeuterStatus, string> = {
  scheduled: "bg-yellow-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

const STATUS_LABELS: Record<SpayNeuterStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

interface SpayNeuterManagerProps {
  shelterId: string;
  animals?: { _id: string; name: string }[];
}

interface SpayNeuterManagerState {
  showForm: boolean;
  statusFilter: SpayNeuterStatus | "all";
  animalId: string;
  procedureType: string;
  scheduledDate: string;
  veterinarian: string;
  clinic: string;
  notes: string;
}

class SpayNeuterManager extends Component<SpayNeuterManagerProps, SpayNeuterManagerState> {
  constructor(props: SpayNeuterManagerProps) {
    super(props);
    this.state = {
      showForm: false,
      statusFilter: "all",
      animalId: "",
      procedureType: "spay",
      scheduledDate: "",
      veterinarian: "",
      clinic: "",
      notes: "",
    };
  }

  resetForm() {
    this.setState({
      showForm: false,
      animalId: "",
      procedureType: "spay",
      scheduledDate: "",
      veterinarian: "",
      clinic: "",
      notes: "",
    });
  }

  filterRecords(records: SpayNeuterRecord[]): SpayNeuterRecord[] {
    if (this.state.statusFilter === "all") return records;
    return records.filter((r) => r.status === this.state.statusFilter);
  }

  getAnimalName(animalId: string): string {
    const animal = this.props.animals?.find((a) => a._id === animalId);
    return animal?.name || "Unknown";
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString();
  }

  render() {
    const { shelterId } = this.props;

    return (
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-capriola text-xl">Spay/Neuter Records</h2>
          <Button
            variant="salmon"
            size="sm"
            onClick={() => this.setState({ showForm: !this.state.showForm })}
          >
            {this.state.showForm ? "Cancel" : "+ Schedule"}
          </Button>
        </div>

        {this.state.showForm && (
          <Mutation
            mutation={SCHEDULE_SPAY_NEUTER}
            refetchQueries={[{ query: SHELTER_SPAY_NEUTER, variables: { shelterId } }]}
          >
            {(schedule: (opts: { variables: Record<string, string> }) => void) => (
              <Card className="bg-white mb-4">
                <CardContent className="pt-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!this.state.animalId || !this.state.procedureType) return;
                      schedule({
                        variables: {
                          animalId: this.state.animalId,
                          shelterId,
                          procedureType: this.state.procedureType,
                          scheduledDate: this.state.scheduledDate,
                          veterinarian: this.state.veterinarian,
                          clinic: this.state.clinic,
                          notes: this.state.notes,
                        },
                      });
                      this.resetForm();
                    }}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600">Animal</label>
                        <select
                          value={this.state.animalId}
                          onChange={(e) => this.setState({ animalId: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                          required
                        >
                          <option value="">Select animal</option>
                          {this.props.animals?.map((a) => (
                            <option key={a._id} value={a._id}>{a.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Procedure</label>
                        <select
                          value={this.state.procedureType}
                          onChange={(e) => this.setState({ procedureType: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                          required
                        >
                          <option value="spay">Spay</option>
                          <option value="neuter">Neuter</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600">Scheduled Date</label>
                        <input
                          type="date"
                          value={this.state.scheduledDate}
                          onChange={(e) => this.setState({ scheduledDate: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Veterinarian</label>
                        <input
                          type="text"
                          value={this.state.veterinarian}
                          onChange={(e) => this.setState({ veterinarian: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="e.g. Dr. Smith"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600">Clinic</label>
                        <input
                          type="text"
                          value={this.state.clinic}
                          onChange={(e) => this.setState({ clinic: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="Clinic name"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Notes</label>
                        <input
                          type="text"
                          value={this.state.notes}
                          onChange={(e) => this.setState({ notes: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="Optional notes"
                        />
                      </div>
                    </div>
                    <Button type="submit" variant="salmon" size="sm">
                      Schedule Procedure
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </Mutation>
        )}

        <div className="flex gap-2 mb-4 flex-wrap">
          {(["all", "scheduled", "completed", "cancelled"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => this.setState({ statusFilter: filter })}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                this.state.statusFilter === filter
                  ? "bg-white text-gray-800 shadow"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {filter === "all" ? "All" : STATUS_LABELS[filter]}
            </button>
          ))}
        </div>

        <Query<ShelterSpayNeuterResponse>
          query={SHELTER_SPAY_NEUTER}
          variables={{ shelterId }}
        >
          {({ loading, error, data }) => {
            if (loading) return <p className="text-white animate-pulse">Loading records...</p>;
            if (error) return <p className="text-red-500">Error loading records</p>;

            const records = data?.shelterSpayNeuter || [];
            const filtered = this.filterRecords(records);

            if (filtered.length === 0) {
              return (
                <Card className="bg-white">
                  <CardContent className="text-center py-6">
                    <p className="text-muted-foreground">No spay/neuter records found.</p>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-sky-blue font-capriola text-base">
                    Records ({filtered.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filtered.map((record) => (
                      <div key={record._id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">
                              {this.getAnimalName(record.animalId)}
                            </span>
                            <span className="text-xs font-medium text-purple-700 capitalize">
                              {record.procedureType}
                            </span>
                            <span className={`text-xs text-white px-2 py-0.5 rounded-full ${STATUS_STYLES[record.status]}`}>
                              {STATUS_LABELS[record.status]}
                            </span>
                          </div>
                          {record.status === 'scheduled' && (
                            <Mutation
                              mutation={UPDATE_SPAY_NEUTER_STATUS}
                              refetchQueries={[{ query: SHELTER_SPAY_NEUTER, variables: { shelterId } }]}
                            >
                              {(updateStatus: (opts: { variables: { _id: string; status: string } }) => void) => (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => updateStatus({ variables: { _id: record._id, status: 'completed' } })}
                                    className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded"
                                  >
                                    Complete
                                  </button>
                                  <button
                                    onClick={() => updateStatus({ variables: { _id: record._id, status: 'cancelled' } })}
                                    className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </Mutation>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {record.scheduledDate && `Scheduled: ${this.formatDate(record.scheduledDate)}`}
                          {record.completedDate && ` | Completed: ${this.formatDate(record.completedDate)}`}
                        </p>
                        {record.veterinarian && (
                          <p className="text-xs text-muted-foreground">Vet: {record.veterinarian}</p>
                        )}
                        {record.clinic && (
                          <p className="text-xs text-muted-foreground">Clinic: {record.clinic}</p>
                        )}
                        {record.notes && (
                          <p className="text-xs text-gray-600 mt-1 italic">{record.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          }}
        </Query>
      </div>
    );
  }
}

export default SpayNeuterManager;
