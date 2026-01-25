import React, { Component } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { WeightRecord, WeightUnit, ShelterWeightRecordsResponse } from "../types";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";

const { SHELTER_WEIGHT_RECORDS } = Queries;
const { RECORD_WEIGHT, DELETE_WEIGHT_RECORD } = Mutations;

const UNIT_LABELS: Record<WeightUnit, string> = {
  lbs: "lbs",
  kg: "kg",
};

interface WeightTrackerProps {
  shelterId: string;
  animals?: { _id: string; name: string }[];
}

interface WeightTrackerState {
  showForm: boolean;
  animalFilter: string;
  animalId: string;
  weight: string;
  unit: string;
  recordedAt: string;
  recordedBy: string;
  notes: string;
}

class WeightTracker extends Component<WeightTrackerProps, WeightTrackerState> {
  constructor(props: WeightTrackerProps) {
    super(props);
    this.state = {
      showForm: false,
      animalFilter: "all",
      animalId: "",
      weight: "",
      unit: "lbs",
      recordedAt: "",
      recordedBy: "",
      notes: "",
    };
  }

  resetForm() {
    this.setState({
      showForm: false,
      animalId: "",
      weight: "",
      unit: "lbs",
      recordedAt: "",
      recordedBy: "",
      notes: "",
    });
  }

  filterRecords(records: WeightRecord[]): WeightRecord[] {
    if (this.state.animalFilter === "all") return records;
    return records.filter((r) => r.animalId === this.state.animalFilter);
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

  calculateWeightChange(records: WeightRecord[], animalId: string): string | null {
    const animalRecords = records.filter((r) => r.animalId === animalId);
    if (animalRecords.length < 2) return null;

    const latest = animalRecords[0];
    const previous = animalRecords[1];
    const diff = latest.weight - previous.weight;
    const sign = diff >= 0 ? "+" : "";
    return `${sign}${diff.toFixed(1)} ${latest.unit}`;
  }

  render() {
    const { shelterId } = this.props;

    return (
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-capriola text-xl">Weight Tracking</h2>
          <Button
            variant="salmon"
            size="sm"
            onClick={() => this.setState({ showForm: !this.state.showForm })}
          >
            {this.state.showForm ? "Cancel" : "+ Record Weight"}
          </Button>
        </div>

        {this.state.showForm && (
          <Mutation
            mutation={RECORD_WEIGHT}
            refetchQueries={[{ query: SHELTER_WEIGHT_RECORDS, variables: { shelterId } }]}
          >
            {(recordWeight: (opts: { variables: Record<string, string | number> }) => void) => (
              <Card className="bg-white mb-4">
                <CardContent className="pt-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!this.state.animalId || !this.state.weight) return;
                      recordWeight({
                        variables: {
                          animalId: this.state.animalId,
                          shelterId,
                          weight: parseFloat(this.state.weight),
                          unit: this.state.unit,
                          recordedAt: this.state.recordedAt,
                          recordedBy: this.state.recordedBy,
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
                        <label className="text-xs font-medium text-gray-600">Weight</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={this.state.weight}
                            onChange={(e) => this.setState({ weight: e.target.value })}
                            className="flex-1 border rounded px-2 py-1 text-sm"
                            placeholder="Weight"
                            required
                          />
                          <select
                            value={this.state.unit}
                            onChange={(e) => this.setState({ unit: e.target.value })}
                            className="w-16 border rounded px-2 py-1 text-sm"
                          >
                            <option value="lbs">lbs</option>
                            <option value="kg">kg</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600">Date</label>
                        <input
                          type="date"
                          value={this.state.recordedAt}
                          onChange={(e) => this.setState({ recordedAt: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Recorded By</label>
                        <input
                          type="text"
                          value={this.state.recordedBy}
                          onChange={(e) => this.setState({ recordedBy: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="Staff name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Notes</label>
                      <textarea
                        value={this.state.notes}
                        onChange={(e) => this.setState({ notes: e.target.value })}
                        className="w-full border rounded px-2 py-1 text-sm"
                        rows={2}
                        placeholder="Optional notes"
                      />
                    </div>
                    <Button type="submit" variant="salmon" size="sm">
                      Save Weight Record
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </Mutation>
        )}

        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => this.setState({ animalFilter: "all" })}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              this.state.animalFilter === "all"
                ? "bg-white text-gray-800 shadow"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            All Animals
          </button>
          {this.props.animals?.map((animal) => (
            <button
              key={animal._id}
              onClick={() => this.setState({ animalFilter: animal._id })}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                this.state.animalFilter === animal._id
                  ? "bg-white text-gray-800 shadow"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {animal.name}
            </button>
          ))}
        </div>

        <Query<ShelterWeightRecordsResponse>
          query={SHELTER_WEIGHT_RECORDS}
          variables={{ shelterId }}
        >
          {({ loading, error, data }) => {
            if (loading) return <p className="text-white animate-pulse">Loading weight records...</p>;
            if (error) return <p className="text-red-500">Error loading weight records</p>;

            const records = data?.shelterWeightRecords || [];
            const filtered = this.filterRecords(records);

            if (filtered.length === 0) {
              return (
                <Card className="bg-white">
                  <CardContent className="text-center py-6">
                    <p className="text-muted-foreground">No weight records found.</p>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-sky-blue font-capriola text-base">
                    Weight History ({filtered.length} records)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filtered.map((record) => {
                      const weightChange = this.calculateWeightChange(records, record.animalId);
                      return (
                        <div key={record._id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800">
                                {this.getAnimalName(record.animalId)}
                              </span>
                              <span className="text-lg font-bold text-blue-600">
                                {record.weight} {UNIT_LABELS[record.unit]}
                              </span>
                              {weightChange && records.indexOf(record) === 0 && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  weightChange.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {weightChange}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {this.formatDate(record.recordedAt)}
                              </span>
                              <Mutation
                                mutation={DELETE_WEIGHT_RECORD}
                                refetchQueries={[{ query: SHELTER_WEIGHT_RECORDS, variables: { shelterId } }]}
                              >
                                {(deleteRecord: (opts: { variables: { _id: string } }) => void) => (
                                  <button
                                    onClick={() => {
                                      if (window.confirm('Delete this weight record?')) {
                                        deleteRecord({ variables: { _id: record._id } });
                                      }
                                    }}
                                    className="text-xs text-red-500 hover:text-red-700"
                                  >
                                    Delete
                                  </button>
                                )}
                              </Mutation>
                            </div>
                          </div>
                          {record.recordedBy && (
                            <p className="text-xs text-muted-foreground">Recorded by: {record.recordedBy}</p>
                          )}
                          {record.notes && (
                            <p className="text-xs text-gray-600 mt-1 italic">{record.notes}</p>
                          )}
                        </div>
                      );
                    })}
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

export default WeightTracker;
