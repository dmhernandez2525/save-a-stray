import React, { Component } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Vaccination, VaccinationStatus, ShelterVaccinationsResponse } from "../types";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";

const { SHELTER_VACCINATIONS } = Queries;
const { ADD_VACCINATION, UPDATE_VACCINATION_STATUS } = Mutations;

const STATUS_STYLES: Record<VaccinationStatus, string> = {
  current: "bg-green-500",
  expired: "bg-red-500",
  due: "bg-yellow-500",
};

const STATUS_LABELS: Record<VaccinationStatus, string> = {
  current: "Current",
  expired: "Expired",
  due: "Due",
};

interface VaccinationManagerProps {
  shelterId: string;
  animals?: { _id: string; name: string }[];
}

interface VaccinationManagerState {
  showForm: boolean;
  statusFilter: VaccinationStatus | "all";
  animalFilter: string;
  vaccineName: string;
  animalId: string;
  batchNumber: string;
  administeredBy: string;
  administeredDate: string;
  expirationDate: string;
  notes: string;
}

class VaccinationManager extends Component<VaccinationManagerProps, VaccinationManagerState> {
  constructor(props: VaccinationManagerProps) {
    super(props);
    this.state = {
      showForm: false,
      statusFilter: "all",
      animalFilter: "all",
      vaccineName: "",
      animalId: "",
      batchNumber: "",
      administeredBy: "",
      administeredDate: "",
      expirationDate: "",
      notes: "",
    };
  }

  resetForm() {
    this.setState({
      showForm: false,
      vaccineName: "",
      animalId: "",
      batchNumber: "",
      administeredBy: "",
      administeredDate: "",
      expirationDate: "",
      notes: "",
    });
  }

  filterVaccinations(vaccinations: Vaccination[]): Vaccination[] {
    let filtered = vaccinations;
    if (this.state.statusFilter !== "all") {
      filtered = filtered.filter((v) => v.status === this.state.statusFilter);
    }
    if (this.state.animalFilter !== "all") {
      filtered = filtered.filter((v) => v.animalId === this.state.animalFilter);
    }
    return filtered;
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
          <h2 className="text-white font-capriola text-xl">Vaccination Records</h2>
          <Button
            variant="salmon"
            size="sm"
            onClick={() => this.setState({ showForm: !this.state.showForm })}
          >
            {this.state.showForm ? "Cancel" : "+ Add Vaccination"}
          </Button>
        </div>

        {this.state.showForm && (
          <Mutation
            mutation={ADD_VACCINATION}
            refetchQueries={[{ query: SHELTER_VACCINATIONS, variables: { shelterId } }]}
          >
            {(addVaccination: (opts: { variables: Record<string, string> }) => void) => (
              <Card className="bg-white mb-4">
                <CardContent className="pt-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!this.state.vaccineName || !this.state.animalId) return;
                      addVaccination({
                        variables: {
                          animalId: this.state.animalId,
                          shelterId,
                          vaccineName: this.state.vaccineName,
                          batchNumber: this.state.batchNumber,
                          administeredBy: this.state.administeredBy,
                          administeredDate: this.state.administeredDate,
                          expirationDate: this.state.expirationDate,
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
                        <label className="text-xs font-medium text-gray-600">Vaccine Name</label>
                        <input
                          type="text"
                          value={this.state.vaccineName}
                          onChange={(e) => this.setState({ vaccineName: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="e.g. Rabies"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600">Batch Number</label>
                        <input
                          type="text"
                          value={this.state.batchNumber}
                          onChange={(e) => this.setState({ batchNumber: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Administered By</label>
                        <input
                          type="text"
                          value={this.state.administeredBy}
                          onChange={(e) => this.setState({ administeredBy: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="e.g. Dr. Smith"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600">Administered Date</label>
                        <input
                          type="date"
                          value={this.state.administeredDate}
                          onChange={(e) => this.setState({ administeredDate: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Expiration Date</label>
                        <input
                          type="date"
                          value={this.state.expirationDate}
                          onChange={(e) => this.setState({ expirationDate: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
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
                      Save Vaccination
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </Mutation>
        )}

        <div className="flex gap-2 mb-4 flex-wrap">
          {(["all", "current", "due", "expired"] as const).map((filter) => (
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
          {this.props.animals && this.props.animals.length > 0 && (
            <select
              value={this.state.animalFilter}
              onChange={(e) => this.setState({ animalFilter: e.target.value })}
              className="text-xs px-2 py-1 rounded border ml-auto"
            >
              <option value="all">All Animals</option>
              {this.props.animals.map((a) => (
                <option key={a._id} value={a._id}>{a.name}</option>
              ))}
            </select>
          )}
        </div>

        <Query<ShelterVaccinationsResponse>
          query={SHELTER_VACCINATIONS}
          variables={{ shelterId }}
        >
          {({ loading, error, data }) => {
            if (loading) return <p className="text-white animate-pulse">Loading vaccinations...</p>;
            if (error) return <p className="text-red-500">Error loading vaccinations</p>;

            const vaccinations = data?.shelterVaccinations || [];
            const filtered = this.filterVaccinations(vaccinations);

            if (filtered.length === 0) {
              return (
                <Card className="bg-white">
                  <CardContent className="text-center py-6">
                    <p className="text-muted-foreground">No vaccination records found.</p>
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
                    {filtered.map((vaccination) => (
                      <div key={vaccination._id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">{vaccination.vaccineName}</span>
                            <span className={`text-xs text-white px-2 py-0.5 rounded-full ${STATUS_STYLES[vaccination.status]}`}>
                              {STATUS_LABELS[vaccination.status]}
                            </span>
                          </div>
                          <Mutation
                            mutation={UPDATE_VACCINATION_STATUS}
                            refetchQueries={[{ query: SHELTER_VACCINATIONS, variables: { shelterId } }]}
                          >
                            {(updateStatus: (opts: { variables: { _id: string; status: string } }) => void) => (
                              <select
                                value={vaccination.status}
                                onChange={(e) => updateStatus({ variables: { _id: vaccination._id, status: e.target.value } })}
                                className="text-xs border rounded px-1 py-0.5"
                              >
                                <option value="current">Current</option>
                                <option value="expired">Expired</option>
                                <option value="due">Due</option>
                              </select>
                            )}
                          </Mutation>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {this.getAnimalName(vaccination.animalId)}
                          {vaccination.administeredBy && ` - by ${vaccination.administeredBy}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Administered: {this.formatDate(vaccination.administeredDate || vaccination.dateAdministered)}
                          {vaccination.expirationDate && ` | Expires: ${this.formatDate(vaccination.expirationDate)}`}
                        </p>
                        {vaccination.batchNumber && (
                          <p className="text-xs text-muted-foreground">Batch: {vaccination.batchNumber}</p>
                        )}
                        {vaccination.notes && (
                          <p className="text-xs text-gray-600 mt-1 italic">{vaccination.notes}</p>
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

export default VaccinationManager;
