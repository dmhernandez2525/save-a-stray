import React, { Component } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Microchip,
  MicrochipStatus,
  ShelterMicrochipsResponse
} from "../types";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";

const { SHELTER_MICROCHIPS } = Queries;
const { REGISTER_MICROCHIP, UPDATE_MICROCHIP_STATUS } = Mutations;

const STATUS_STYLES: Record<MicrochipStatus, string> = {
  registered: "bg-green-100 text-green-800",
  unregistered: "bg-gray-100 text-gray-800",
  transferred: "bg-blue-100 text-blue-800"
};

const STATUS_OPTIONS: { value: MicrochipStatus; label: string }[] = [
  { value: "registered", label: "Registered" },
  { value: "unregistered", label: "Unregistered" },
  { value: "transferred", label: "Transferred" }
];

interface MicrochipManagerProps {
  shelterId: string;
  animals: { _id: string; name: string }[];
}

interface MicrochipManagerState {
  showForm: boolean;
  animalId: string;
  chipNumber: string;
  chipBrand: string;
  registeredBy: string;
  ownerName: string;
  ownerPhone: string;
  filterStatus: MicrochipStatus | "all";
}

class MicrochipManager extends Component<MicrochipManagerProps, MicrochipManagerState> {
  constructor(props: MicrochipManagerProps) {
    super(props);
    this.state = {
      showForm: false,
      animalId: "",
      chipNumber: "",
      chipBrand: "",
      registeredBy: "",
      ownerName: "",
      ownerPhone: "",
      filterStatus: "all"
    };
  }

  resetForm() {
    this.setState({
      showForm: false,
      animalId: "",
      chipNumber: "",
      chipBrand: "",
      registeredBy: "",
      ownerName: "",
      ownerPhone: ""
    });
  }

  getAnimalName(animalId: string): string {
    const animal = this.props.animals.find((a) => a._id === animalId);
    return animal ? animal.name : "Unknown";
  }

  filterMicrochips(microchips: Microchip[]): Microchip[] {
    if (this.state.filterStatus === "all") return microchips;
    return microchips.filter((m) => m.status === this.state.filterStatus);
  }

  renderForm() {
    if (!this.state.showForm) return null;

    return (
      <Mutation
        mutation={REGISTER_MICROCHIP}
        refetchQueries={[{ query: SHELTER_MICROCHIPS, variables: { shelterId: this.props.shelterId } }]}
      >
        {(registerChip: (opts: { variables: Record<string, string> }) => Promise<{ data?: { registerMicrochip?: Microchip } | null }>) => (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">Register Microchip</h3>
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
              <input
                type="text"
                value={this.state.chipNumber}
                onChange={(e) => this.setState({ chipNumber: e.target.value })}
                placeholder="Chip number"
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={this.state.chipBrand}
                onChange={(e) => this.setState({ chipBrand: e.target.value })}
                placeholder="Chip brand (optional)"
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={this.state.registeredBy}
                onChange={(e) => this.setState({ registeredBy: e.target.value })}
                placeholder="Registered by"
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={this.state.ownerName}
                onChange={(e) => this.setState({ ownerName: e.target.value })}
                placeholder="Owner name"
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={this.state.ownerPhone}
                onChange={(e) => this.setState({ ownerPhone: e.target.value })}
                placeholder="Owner phone"
                className="border rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="salmon"
                size="sm"
                onClick={() => {
                  if (this.state.animalId && this.state.chipNumber) {
                    registerChip({
                      variables: {
                        animalId: this.state.animalId,
                        shelterId: this.props.shelterId,
                        chipNumber: this.state.chipNumber,
                        chipBrand: this.state.chipBrand,
                        registeredBy: this.state.registeredBy,
                        ownerName: this.state.ownerName,
                        ownerPhone: this.state.ownerPhone
                      }
                    }).then(() => this.resetForm());
                  }
                }}
              >
                Register
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

  renderChipCard(chip: Microchip) {
    return (
      <div key={chip._id} className="p-3 rounded-lg border flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-800 text-sm">{this.getAnimalName(chip.animalId)}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[chip.status as MicrochipStatus]}`}>
              {chip.status}
            </span>
          </div>
          <p className="text-xs text-gray-600 font-mono">{chip.chipNumber}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            {chip.chipBrand && <span>{chip.chipBrand}</span>}
            {chip.ownerName && <span>Owner: {chip.ownerName}</span>}
            {chip.registeredDate && <span>Reg: {new Date(chip.registeredDate).toLocaleDateString()}</span>}
          </div>
        </div>
        <Mutation
          mutation={UPDATE_MICROCHIP_STATUS}
          refetchQueries={[{ query: SHELTER_MICROCHIPS, variables: { shelterId: this.props.shelterId } }]}
        >
          {(updateStatus: (opts: { variables: { _id: string; status: string } }) => void) => (
            <select
              value={chip.status}
              onChange={(e) => updateStatus({ variables: { _id: chip._id, status: e.target.value } })}
              className="text-xs border rounded px-1 py-0.5"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
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
            <CardTitle className="text-sky-blue font-capriola">Microchip Registry</CardTitle>
            <Button
              variant="salmon"
              size="sm"
              onClick={() => this.setState({ showForm: !this.state.showForm })}
            >
              + Register Chip
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {this.renderForm()}

          <div className="flex items-center gap-2 mb-4">
            <select
              value={this.state.filterStatus}
              onChange={(e) => this.setState({ filterStatus: e.target.value as MicrochipStatus | "all" })}
              className="text-xs border rounded px-2 py-1"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <Query<ShelterMicrochipsResponse>
            query={SHELTER_MICROCHIPS}
            variables={{ shelterId }}
          >
            {({ loading, error, data }) => {
              if (loading) return <p className="text-gray-500 animate-pulse">Loading microchips...</p>;
              if (error) return <p className="text-red-500">Error loading microchips</p>;

              const microchips = data?.shelterMicrochips || [];
              const filtered = this.filterMicrochips(microchips);

              if (filtered.length === 0) {
                return (
                  <p className="text-muted-foreground text-center py-4">
                    No microchips registered yet.
                  </p>
                );
              }

              return (
                <div className="space-y-2">
                  {filtered.map((chip) => this.renderChipCard(chip))}
                </div>
              );
            }}
          </Query>
        </CardContent>
      </Card>
    );
  }
}

export default MicrochipManager;
