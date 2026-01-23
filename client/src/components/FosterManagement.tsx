import React, { Component } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";
import { ShelterFostersResponse, Foster } from "../types";

const { SHELTER_FOSTERS } = Queries;
const { CREATE_FOSTER, UPDATE_FOSTER_STATUS } = Mutations;

interface FosterManagementProps {
  shelterId: string;
}

interface FosterManagementState {
  animalId: string;
  fosterName: string;
  fosterEmail: string;
  startDate: string;
  notes: string;
  showForm: boolean;
}

class FosterManagement extends Component<FosterManagementProps, FosterManagementState> {
  constructor(props: FosterManagementProps) {
    super(props);
    this.state = {
      animalId: "",
      fosterName: "",
      fosterEmail: "",
      startDate: new Date().toISOString().split("T")[0],
      notes: "",
      showForm: false
    };
  }

  resetForm() {
    this.setState({
      animalId: "",
      fosterName: "",
      fosterEmail: "",
      startDate: new Date().toISOString().split("T")[0],
      notes: "",
      showForm: false
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  renderFosterCard(foster: Foster) {
    return (
      <div key={foster._id} className="border rounded-lg p-4 mb-3 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-semibold text-gray-800">{foster.fosterName}</p>
            {foster.fosterEmail && (
              <p className="text-sm text-gray-500">{foster.fosterEmail}</p>
            )}
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${this.getStatusColor(foster.status)}`}>
            {foster.status}
          </span>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Animal ID: {foster.animalId}</p>
          <p>Start: {this.formatDate(foster.startDate)}</p>
          {foster.endDate && <p>End: {this.formatDate(foster.endDate)}</p>}
          {foster.notes && <p className="italic">"{foster.notes}"</p>}
        </div>
        {foster.status === "active" && (
          <div className="mt-3 flex gap-2">
            <Mutation
              mutation={UPDATE_FOSTER_STATUS}
              refetchQueries={[{ query: SHELTER_FOSTERS, variables: { shelterId: this.props.shelterId } }]}
            >
              {(updateFoster: (options: { variables: { _id: string; status: string; endDate: string } }) => void) => (
                <button
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() =>
                    updateFoster({
                      variables: {
                        _id: foster._id,
                        status: "completed",
                        endDate: new Date().toISOString()
                      }
                    })
                  }
                >
                  Mark Completed
                </button>
              )}
            </Mutation>
            <Mutation
              mutation={UPDATE_FOSTER_STATUS}
              refetchQueries={[{ query: SHELTER_FOSTERS, variables: { shelterId: this.props.shelterId } }]}
            >
              {(updateFoster: (options: { variables: { _id: string; status: string; endDate: string } }) => void) => (
                <button
                  className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() =>
                    updateFoster({
                      variables: {
                        _id: foster._id,
                        status: "cancelled",
                        endDate: new Date().toISOString()
                      }
                    })
                  }
                >
                  Cancel
                </button>
              )}
            </Mutation>
          </div>
        )}
      </div>
    );
  }

  render() {
    const { shelterId } = this.props;
    const { animalId, fosterName, fosterEmail, startDate, notes, showForm } = this.state;

    return (
      <Card className="bg-white mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sky-blue font-capriola text-lg">Foster Management</CardTitle>
            <button
              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
              onClick={() => this.setState({ showForm: !showForm })}
            >
              {showForm ? "Cancel" : "New Foster"}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <Mutation
              mutation={CREATE_FOSTER}
              refetchQueries={[{ query: SHELTER_FOSTERS, variables: { shelterId } }]}
              onCompleted={() => this.resetForm()}
            >
              {(createFoster: (options: { variables: { shelterId: string; animalId: string; fosterName: string; fosterEmail: string; startDate: string; notes: string } }) => void) => (
                <form
                  className="mb-4 p-4 border rounded-lg bg-gray-50 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!animalId || !fosterName || !startDate) return;
                    createFoster({
                      variables: {
                        shelterId,
                        animalId,
                        fosterName,
                        fosterEmail,
                        startDate,
                        notes
                      }
                    });
                  }}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Animal ID *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded text-gray-800"
                      value={animalId}
                      onChange={(e) => this.setState({ animalId: e.target.value })}
                      placeholder="Enter animal ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Foster Parent Name *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded text-gray-800"
                      value={fosterName}
                      onChange={(e) => this.setState({ fosterName: e.target.value })}
                      placeholder="Enter foster parent name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Foster Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border rounded text-gray-800"
                      value={fosterEmail}
                      onChange={(e) => this.setState({ fosterEmail: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border rounded text-gray-800"
                      value={startDate}
                      onChange={(e) => this.setState({ startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      className="w-full px-3 py-2 border rounded text-gray-800"
                      value={notes}
                      onChange={(e) => this.setState({ notes: e.target.value })}
                      placeholder="Additional notes..."
                      rows={2}
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Create Foster Record
                  </button>
                </form>
              )}
            </Mutation>
          )}

          <Query<ShelterFostersResponse> query={SHELTER_FOSTERS} variables={{ shelterId }}>
            {({ loading, error, data }) => {
              if (loading) return <p className="text-gray-500 animate-pulse">Loading fosters...</p>;
              if (error) return <p className="text-red-500">Error loading foster records</p>;

              const fosters = data?.shelterFosters || [];
              const activeFosters = fosters.filter((f) => f.status === "active");
              const pastFosters = fosters.filter((f) => f.status !== "active");

              if (fosters.length === 0) {
                return <p className="text-gray-500 text-sm">No foster records yet.</p>;
              }

              return (
                <div>
                  <div className="flex gap-4 mb-4 text-sm">
                    <span className="text-green-700 font-medium">Active: {activeFosters.length}</span>
                    <span className="text-gray-500">Total: {fosters.length}</span>
                  </div>
                  {activeFosters.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Active Fosters</h4>
                      {activeFosters.map((foster) => this.renderFosterCard(foster))}
                    </div>
                  )}
                  {pastFosters.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Past Fosters</h4>
                      {pastFosters.map((foster) => this.renderFosterCard(foster))}
                    </div>
                  )}
                </div>
              );
            }}
          </Query>
        </CardContent>
      </Card>
    );
  }
}

export default FosterManagement;
