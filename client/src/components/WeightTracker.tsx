import React, { Component } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  WeightRecord,
  WeightUnit,
  ShelterWeightRecordsResponse
} from "../types";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";

const { SHELTER_WEIGHT_RECORDS } = Queries;
const { ADD_WEIGHT_RECORD, DELETE_WEIGHT_RECORD } = Mutations;

interface WeightTrackerProps {
  shelterId: string;
  animals: { _id: string; name: string }[];
}

interface WeightTrackerState {
  showForm: boolean;
  animalId: string;
  weight: string;
  unit: WeightUnit;
  recordedBy: string;
  notes: string;
  selectedAnimalFilter: string;
}

class WeightTracker extends Component<WeightTrackerProps, WeightTrackerState> {
  constructor(props: WeightTrackerProps) {
    super(props);
    this.state = {
      showForm: false,
      animalId: "",
      weight: "",
      unit: "lbs",
      recordedBy: "",
      notes: "",
      selectedAnimalFilter: "all"
    };
  }

  resetForm() {
    this.setState({
      showForm: false,
      animalId: "",
      weight: "",
      unit: "lbs",
      recordedBy: "",
      notes: ""
    });
  }

  getAnimalName(animalId: string): string {
    const animal = this.props.animals.find((a) => a._id === animalId);
    return animal ? animal.name : "Unknown";
  }

  filterRecords(records: WeightRecord[]): WeightRecord[] {
    if (this.state.selectedAnimalFilter === "all") return records;
    return records.filter((r) => r.animalId === this.state.selectedAnimalFilter);
  }

  getWeightChange(records: WeightRecord[], currentIndex: number): string | null {
    if (currentIndex >= records.length - 1) return null;
    const current = records[currentIndex];
    const previous = records[currentIndex + 1];
    if (current.animalId !== previous.animalId) return null;
    const diff = current.weight - previous.weight;
    if (diff === 0) return null;
    return diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
  }

  renderForm() {
    if (!this.state.showForm) return null;

    return (
      <Mutation
        mutation={ADD_WEIGHT_RECORD}
        refetchQueries={[{ query: SHELTER_WEIGHT_RECORDS, variables: { shelterId: this.props.shelterId } }]}
      >
        {(addRecord: (opts: { variables: { animalId: string; shelterId: string; weight: number; unit: string; recordedBy: string; notes: string } }) => Promise<{ data?: { addWeightRecord?: WeightRecord } | null }>) => (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">Record Weight</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <select
                value={this.state.animalId}
                onChange={(e) => this.setState({ animalId: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              >
                <option value="">Select Animal</option>
                {this.props.animals.map((animal) => (
                  <option key={animal._id} value={animal._id}>{animal.name}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={this.state.weight}
                  onChange={(e) => this.setState({ weight: e.target.value })}
                  placeholder="Weight"
                  step="0.1"
                  className="border rounded px-3 py-2 text-sm flex-1"
                />
                <select
                  value={this.state.unit}
                  onChange={(e) => this.setState({ unit: e.target.value as WeightUnit })}
                  className="border rounded px-3 py-2 text-sm w-20"
                >
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                </select>
              </div>
              <input
                type="text"
                value={this.state.recordedBy}
                onChange={(e) => this.setState({ recordedBy: e.target.value })}
                placeholder="Recorded by"
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={this.state.notes}
                onChange={(e) => this.setState({ notes: e.target.value })}
                placeholder="Notes (optional)"
                className="border rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="salmon"
                size="sm"
                onClick={() => {
                  const weightNum = parseFloat(this.state.weight);
                  if (this.state.animalId && !isNaN(weightNum) && weightNum > 0) {
                    addRecord({
                      variables: {
                        animalId: this.state.animalId,
                        shelterId: this.props.shelterId,
                        weight: weightNum,
                        unit: this.state.unit,
                        recordedBy: this.state.recordedBy,
                        notes: this.state.notes
                      }
                    }).then(() => this.resetForm());
                  }
                }}
              >
                Save Record
              </Button>
              <Button variant="outline" size="sm" onClick={() => this.resetForm()}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Mutation>
    );
  }

  renderRecordRow(record: WeightRecord, index: number, allRecords: WeightRecord[]) {
    const change = this.getWeightChange(allRecords, index);

    return (
      <div key={record._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 text-sm">{this.getAnimalName(record.animalId)}</span>
            <span className="text-lg font-bold text-gray-900">
              {record.weight} {record.unit}
            </span>
            {change && (
              <span className={`text-xs font-medium ${parseFloat(change) > 0 ? "text-green-600" : "text-red-600"}`}>
                {change} {record.unit}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {record.recordedBy && <span>by {record.recordedBy}</span>}
            <span>{new Date(record.recordedAt).toLocaleDateString()}</span>
            {record.notes && <span>- {record.notes}</span>}
          </div>
        </div>
        <Mutation
          mutation={DELETE_WEIGHT_RECORD}
          refetchQueries={[{ query: SHELTER_WEIGHT_RECORDS, variables: { shelterId: this.props.shelterId } }]}
        >
          {(deleteRecord: (opts: { variables: { _id: string } }) => void) => (
            <button
              onClick={() => deleteRecord({ variables: { _id: record._id } })}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          )}
        </Mutation>
      </div>
    );
  }

  render() {
    const { shelterId } = this.props;

    return (
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sky-blue font-capriola">Weight Tracker</CardTitle>
            <Button
              variant="salmon"
              size="sm"
              onClick={() => this.setState({ showForm: !this.state.showForm })}
            >
              + Record Weight
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {this.renderForm()}

          <div className="flex items-center gap-2 mb-4">
            <select
              value={this.state.selectedAnimalFilter}
              onChange={(e) => this.setState({ selectedAnimalFilter: e.target.value })}
              className="text-xs border rounded px-2 py-1"
            >
              <option value="all">All Animals</option>
              {this.props.animals.map((animal) => (
                <option key={animal._id} value={animal._id}>{animal.name}</option>
              ))}
            </select>
          </div>

          <Query<ShelterWeightRecordsResponse>
            query={SHELTER_WEIGHT_RECORDS}
            variables={{ shelterId }}
          >
            {({ loading, error, data }) => {
              if (loading) return <p className="text-gray-500 animate-pulse">Loading weight records...</p>;
              if (error) return <p className="text-red-500">Error loading weight records</p>;

              const records = data?.shelterWeightRecords || [];
              const filtered = this.filterRecords(records);

              if (filtered.length === 0) {
                return (
                  <p className="text-muted-foreground text-center py-4">
                    No weight records yet. Record your first weight measurement!
                  </p>
                );
              }

              return (
                <div className="space-y-2">
                  {filtered.map((record, index) => this.renderRecordRow(record, index, filtered))}
                </div>
              );
            }}
          </Query>
        </CardContent>
      </Card>
    );
  }
}

export default WeightTracker;
