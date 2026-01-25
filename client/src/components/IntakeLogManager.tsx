import React, { Component } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { IntakeLog, IntakeType, IntakeCondition, ShelterIntakeLogsResponse } from "../types";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";

const { SHELTER_INTAKE_LOGS } = Queries;
const { CREATE_INTAKE_LOG } = Mutations;

const INTAKE_TYPE_LABELS: Record<IntakeType, string> = {
  stray: "Stray",
  surrender: "Surrender",
  transfer: "Transfer",
  return: "Return",
  born_in_care: "Born in Care",
};

const CONDITION_STYLES: Record<IntakeCondition, string> = {
  healthy: "bg-green-500",
  injured: "bg-red-500",
  sick: "bg-orange-500",
  unknown: "bg-gray-500",
};

const CONDITION_LABELS: Record<IntakeCondition, string> = {
  healthy: "Healthy",
  injured: "Injured",
  sick: "Sick",
  unknown: "Unknown",
};

interface IntakeLogManagerProps {
  shelterId: string;
  animals?: { _id: string; name: string }[];
}

interface IntakeLogManagerState {
  showForm: boolean;
  typeFilter: IntakeType | "all";
  animalId: string;
  intakeDate: string;
  intakeType: string;
  source: string;
  condition: string;
  intakeNotes: string;
  receivedBy: string;
}

class IntakeLogManager extends Component<IntakeLogManagerProps, IntakeLogManagerState> {
  constructor(props: IntakeLogManagerProps) {
    super(props);
    this.state = {
      showForm: false,
      typeFilter: "all",
      animalId: "",
      intakeDate: "",
      intakeType: "stray",
      source: "",
      condition: "unknown",
      intakeNotes: "",
      receivedBy: "",
    };
  }

  resetForm() {
    this.setState({
      showForm: false,
      animalId: "",
      intakeDate: "",
      intakeType: "stray",
      source: "",
      condition: "unknown",
      intakeNotes: "",
      receivedBy: "",
    });
  }

  filterLogs(logs: IntakeLog[]): IntakeLog[] {
    if (this.state.typeFilter === "all") return logs;
    return logs.filter((l) => l.intakeType === this.state.typeFilter);
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
          <h2 className="text-white font-capriola text-xl">Intake Logs</h2>
          <Button
            variant="salmon"
            size="sm"
            onClick={() => this.setState({ showForm: !this.state.showForm })}
          >
            {this.state.showForm ? "Cancel" : "+ Log Intake"}
          </Button>
        </div>

        {this.state.showForm && (
          <Mutation
            mutation={CREATE_INTAKE_LOG}
            refetchQueries={[{ query: SHELTER_INTAKE_LOGS, variables: { shelterId } }]}
          >
            {(createLog: (opts: { variables: Record<string, string> }) => void) => (
              <Card className="bg-white mb-4">
                <CardContent className="pt-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!this.state.animalId || !this.state.intakeType) return;
                      createLog({
                        variables: {
                          animalId: this.state.animalId,
                          shelterId,
                          intakeDate: this.state.intakeDate,
                          intakeType: this.state.intakeType,
                          source: this.state.source,
                          condition: this.state.condition,
                          intakeNotes: this.state.intakeNotes,
                          receivedBy: this.state.receivedBy,
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
                        <label className="text-xs font-medium text-gray-600">Intake Type</label>
                        <select
                          value={this.state.intakeType}
                          onChange={(e) => this.setState({ intakeType: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                          required
                        >
                          {(Object.keys(INTAKE_TYPE_LABELS) as IntakeType[]).map((type) => (
                            <option key={type} value={type}>{INTAKE_TYPE_LABELS[type]}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600">Intake Date</label>
                        <input
                          type="date"
                          value={this.state.intakeDate}
                          onChange={(e) => this.setState({ intakeDate: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Condition</label>
                        <select
                          value={this.state.condition}
                          onChange={(e) => this.setState({ condition: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                        >
                          {(Object.keys(CONDITION_LABELS) as IntakeCondition[]).map((cond) => (
                            <option key={cond} value={cond}>{CONDITION_LABELS[cond]}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600">Source</label>
                        <input
                          type="text"
                          value={this.state.source}
                          onChange={(e) => this.setState({ source: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="e.g. Found on Main St."
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Received By</label>
                        <input
                          type="text"
                          value={this.state.receivedBy}
                          onChange={(e) => this.setState({ receivedBy: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="Staff name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Notes</label>
                      <textarea
                        value={this.state.intakeNotes}
                        onChange={(e) => this.setState({ intakeNotes: e.target.value })}
                        className="w-full border rounded px-2 py-1 text-sm"
                        rows={2}
                        placeholder="Additional intake notes"
                      />
                    </div>
                    <Button type="submit" variant="salmon" size="sm">
                      Save Intake Log
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
          {(Object.keys(INTAKE_TYPE_LABELS) as IntakeType[]).map((type) => (
            <button
              key={type}
              onClick={() => this.setState({ typeFilter: type })}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                this.state.typeFilter === type
                  ? "bg-white text-gray-800 shadow"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {INTAKE_TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        <Query<ShelterIntakeLogsResponse>
          query={SHELTER_INTAKE_LOGS}
          variables={{ shelterId }}
        >
          {({ loading, error, data }) => {
            if (loading) return <p className="text-white animate-pulse">Loading intake logs...</p>;
            if (error) return <p className="text-red-500">Error loading intake logs</p>;

            const logs = data?.shelterIntakeLogs || [];
            const filtered = this.filterLogs(logs);

            if (filtered.length === 0) {
              return (
                <Card className="bg-white">
                  <CardContent className="text-center py-6">
                    <p className="text-muted-foreground">No intake logs found.</p>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-sky-blue font-capriola text-base">
                    Logs ({filtered.length})
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
                            <span className="text-xs font-medium text-blue-700">
                              {INTAKE_TYPE_LABELS[log.intakeType]}
                            </span>
                            <span className={`text-xs text-white px-2 py-0.5 rounded-full ${CONDITION_STYLES[log.condition]}`}>
                              {CONDITION_LABELS[log.condition]}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {this.formatDate(log.intakeDate)}
                          </span>
                        </div>
                        {log.source && (
                          <p className="text-xs text-muted-foreground">Source: {log.source}</p>
                        )}
                        {log.receivedBy && (
                          <p className="text-xs text-muted-foreground">Received by: {log.receivedBy}</p>
                        )}
                        {log.intakeNotes && (
                          <p className="text-xs text-gray-600 mt-1 italic">{log.intakeNotes}</p>
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

export default IntakeLogManager;
