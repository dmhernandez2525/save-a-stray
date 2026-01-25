import React, { Component } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { OutcomeLog, OutcomeType, OutcomeCondition, ShelterOutcomeLogsResponse } from "../types";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";

const { SHELTER_OUTCOME_LOGS } = Queries;
const { CREATE_OUTCOME_LOG } = Mutations;

const OUTCOME_TYPE_LABELS: Record<OutcomeType, string> = {
  adoption: "Adoption",
  transfer: "Transfer",
  return_to_owner: "Return to Owner",
  euthanasia: "Euthanasia",
  died: "Died",
  escaped: "Escaped",
  release: "Release",
  other: "Other",
};

const OUTCOME_TYPE_STYLES: Record<OutcomeType, string> = {
  adoption: "bg-green-500",
  transfer: "bg-blue-500",
  return_to_owner: "bg-purple-500",
  euthanasia: "bg-gray-700",
  died: "bg-gray-500",
  escaped: "bg-orange-500",
  release: "bg-teal-500",
  other: "bg-gray-400",
};

const CONDITION_LABELS: Record<OutcomeCondition, string> = {
  healthy: "Healthy",
  injured: "Injured",
  sick: "Sick",
  unknown: "Unknown",
};

const CONDITION_STYLES: Record<OutcomeCondition, string> = {
  healthy: "bg-green-500",
  injured: "bg-red-500",
  sick: "bg-orange-500",
  unknown: "bg-gray-500",
};

interface OutcomeLogManagerProps {
  shelterId: string;
  animals?: { _id: string; name: string }[];
}

interface OutcomeLogManagerState {
  showForm: boolean;
  typeFilter: OutcomeType | "all";
  animalId: string;
  outcomeDate: string;
  outcomeType: string;
  destination: string;
  condition: string;
  outcomeNotes: string;
  processedBy: string;
}

class OutcomeLogManager extends Component<OutcomeLogManagerProps, OutcomeLogManagerState> {
  constructor(props: OutcomeLogManagerProps) {
    super(props);
    this.state = {
      showForm: false,
      typeFilter: "all",
      animalId: "",
      outcomeDate: "",
      outcomeType: "adoption",
      destination: "",
      condition: "healthy",
      outcomeNotes: "",
      processedBy: "",
    };
  }

  resetForm() {
    this.setState({
      showForm: false,
      animalId: "",
      outcomeDate: "",
      outcomeType: "adoption",
      destination: "",
      condition: "healthy",
      outcomeNotes: "",
      processedBy: "",
    });
  }

  filterLogs(logs: OutcomeLog[]): OutcomeLog[] {
    if (this.state.typeFilter === "all") return logs;
    return logs.filter((l) => l.outcomeType === this.state.typeFilter);
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
          <h2 className="text-white font-capriola text-xl">Outcome Logs</h2>
          <Button
            variant="salmon"
            size="sm"
            onClick={() => this.setState({ showForm: !this.state.showForm })}
          >
            {this.state.showForm ? "Cancel" : "+ Log Outcome"}
          </Button>
        </div>

        {this.state.showForm && (
          <Mutation
            mutation={CREATE_OUTCOME_LOG}
            refetchQueries={[{ query: SHELTER_OUTCOME_LOGS, variables: { shelterId } }]}
          >
            {(createLog: (opts: { variables: Record<string, string> }) => void) => (
              <Card className="bg-white mb-4">
                <CardContent className="pt-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!this.state.animalId || !this.state.outcomeType) return;
                      createLog({
                        variables: {
                          animalId: this.state.animalId,
                          shelterId,
                          outcomeDate: this.state.outcomeDate,
                          outcomeType: this.state.outcomeType,
                          destination: this.state.destination,
                          condition: this.state.condition,
                          outcomeNotes: this.state.outcomeNotes,
                          processedBy: this.state.processedBy,
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
                        <label className="text-xs font-medium text-gray-600">Outcome Type</label>
                        <select
                          value={this.state.outcomeType}
                          onChange={(e) => this.setState({ outcomeType: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                          required
                        >
                          {(Object.keys(OUTCOME_TYPE_LABELS) as OutcomeType[]).map((type) => (
                            <option key={type} value={type}>{OUTCOME_TYPE_LABELS[type]}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600">Outcome Date</label>
                        <input
                          type="date"
                          value={this.state.outcomeDate}
                          onChange={(e) => this.setState({ outcomeDate: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Condition at Outcome</label>
                        <select
                          value={this.state.condition}
                          onChange={(e) => this.setState({ condition: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                        >
                          {(Object.keys(CONDITION_LABELS) as OutcomeCondition[]).map((cond) => (
                            <option key={cond} value={cond}>{CONDITION_LABELS[cond]}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600">Destination</label>
                        <input
                          type="text"
                          value={this.state.destination}
                          onChange={(e) => this.setState({ destination: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="e.g. New adopter name, receiving shelter"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Processed By</label>
                        <input
                          type="text"
                          value={this.state.processedBy}
                          onChange={(e) => this.setState({ processedBy: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="Staff name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Notes</label>
                      <textarea
                        value={this.state.outcomeNotes}
                        onChange={(e) => this.setState({ outcomeNotes: e.target.value })}
                        className="w-full border rounded px-2 py-1 text-sm"
                        rows={2}
                        placeholder="Additional outcome notes"
                      />
                    </div>
                    <Button type="submit" variant="salmon" size="sm">
                      Save Outcome Log
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </Mutation>
        )}

        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => this.setState({ typeFilter: "all" })}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              this.state.typeFilter === "all"
                ? "bg-white text-gray-800 shadow"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            All
          </button>
          {(Object.keys(OUTCOME_TYPE_LABELS) as OutcomeType[]).map((type) => (
            <button
              key={type}
              onClick={() => this.setState({ typeFilter: type })}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                this.state.typeFilter === type
                  ? "bg-white text-gray-800 shadow"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {OUTCOME_TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        <Query<ShelterOutcomeLogsResponse>
          query={SHELTER_OUTCOME_LOGS}
          variables={{ shelterId }}
        >
          {({ loading, error, data }) => {
            if (loading) return <p className="text-white animate-pulse">Loading outcome logs...</p>;
            if (error) return <p className="text-red-500">Error loading outcome logs</p>;

            const logs = data?.shelterOutcomeLogs || [];
            const filtered = this.filterLogs(logs);

            if (filtered.length === 0) {
              return (
                <Card className="bg-white">
                  <CardContent className="text-center py-6">
                    <p className="text-muted-foreground">No outcome logs found.</p>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-sky-blue font-capriola text-base">
                    Outcomes ({filtered.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filtered.map((log) => (
                      <div key={log._id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">
                              {this.getAnimalName(log.animalId)}
                            </span>
                            <span className={`text-xs text-white px-2 py-0.5 rounded-full ${OUTCOME_TYPE_STYLES[log.outcomeType]}`}>
                              {OUTCOME_TYPE_LABELS[log.outcomeType]}
                            </span>
                            <span className={`text-xs text-white px-2 py-0.5 rounded-full ${log.condition ? CONDITION_STYLES[log.condition as OutcomeCondition] || "bg-gray-500" : "bg-gray-500"}`}>
                              {log.condition ? CONDITION_LABELS[log.condition as OutcomeCondition] || log.condition : "Unknown"}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {this.formatDate(log.outcomeDate)}
                          </span>
                        </div>
                        {log.destination && (
                          <p className="text-xs text-muted-foreground">Destination: {log.destination}</p>
                        )}
                        {log.processedBy && (
                          <p className="text-xs text-muted-foreground">Processed by: {log.processedBy}</p>
                        )}
                        {log.outcomeNotes && (
                          <p className="text-xs text-gray-600 mt-1 italic">{log.outcomeNotes}</p>
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

export default OutcomeLogManager;
