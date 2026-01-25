import React, { Component } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { AdoptionFee, AdoptionFeeStatus, ShelterAdoptionFeesResponse } from "../types";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";

const { SHELTER_ADOPTION_FEES } = Queries;
const { SET_ADOPTION_FEE, UPDATE_ADOPTION_FEE_STATUS, WAIVE_ADOPTION_FEE } = Mutations;

const STATUS_STYLES: Record<AdoptionFeeStatus, string> = {
  pending: "bg-yellow-500",
  paid: "bg-green-500",
  waived: "bg-blue-500",
  refunded: "bg-gray-500",
};

const STATUS_LABELS: Record<AdoptionFeeStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  waived: "Waived",
  refunded: "Refunded",
};

interface AdoptionFeeManagerProps {
  shelterId: string;
  animals?: { _id: string; name: string }[];
}

interface AdoptionFeeManagerState {
  showForm: boolean;
  statusFilter: AdoptionFeeStatus | "all";
  animalId: string;
  amount: string;
  currency: string;
  description: string;
  waiveId: string;
  waivedReason: string;
  markPaidId: string;
  paidBy: string;
}

class AdoptionFeeManager extends Component<AdoptionFeeManagerProps, AdoptionFeeManagerState> {
  constructor(props: AdoptionFeeManagerProps) {
    super(props);
    this.state = {
      showForm: false,
      statusFilter: "all",
      animalId: "",
      amount: "",
      currency: "USD",
      description: "",
      waiveId: "",
      waivedReason: "",
      markPaidId: "",
      paidBy: "",
    };
  }

  resetForm() {
    this.setState({
      showForm: false,
      animalId: "",
      amount: "",
      currency: "USD",
      description: "",
    });
  }

  filterFees(fees: AdoptionFee[]): AdoptionFee[] {
    if (this.state.statusFilter === "all") return fees;
    return fees.filter((f) => f.status === this.state.statusFilter);
  }

  getAnimalName(animalId: string): string {
    const animal = this.props.animals?.find((a) => a._id === animalId);
    return animal?.name || "Unknown";
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);
  }

  render() {
    const { shelterId } = this.props;

    return (
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-capriola text-xl">Adoption Fees</h2>
          <Button
            variant="salmon"
            size="sm"
            onClick={() => this.setState({ showForm: !this.state.showForm })}
          >
            {this.state.showForm ? "Cancel" : "+ Set Fee"}
          </Button>
        </div>

        {this.state.showForm && (
          <Mutation
            mutation={SET_ADOPTION_FEE}
            refetchQueries={[{ query: SHELTER_ADOPTION_FEES, variables: { shelterId } }]}
          >
            {(setFee: (opts: { variables: Record<string, string | number> }) => void) => (
              <Card className="bg-white mb-4">
                <CardContent className="pt-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!this.state.animalId || !this.state.amount) return;
                      setFee({
                        variables: {
                          animalId: this.state.animalId,
                          shelterId,
                          amount: parseFloat(this.state.amount),
                          currency: this.state.currency,
                          description: this.state.description,
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
                        <label className="text-xs font-medium text-gray-600">Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={this.state.amount}
                          onChange={(e) => this.setState({ amount: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600">Currency</label>
                        <select
                          value={this.state.currency}
                          onChange={(e) => this.setState({ currency: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="CAD">CAD</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Description</label>
                        <input
                          type="text"
                          value={this.state.description}
                          onChange={(e) => this.setState({ description: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="Optional description"
                        />
                      </div>
                    </div>
                    <Button type="submit" variant="salmon" size="sm">
                      Save Fee
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </Mutation>
        )}

        <div className="flex gap-2 mb-4 flex-wrap">
          {(["all", "pending", "paid", "waived", "refunded"] as const).map((filter) => (
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

        <Query<ShelterAdoptionFeesResponse>
          query={SHELTER_ADOPTION_FEES}
          variables={{ shelterId }}
        >
          {({ loading, error, data }) => {
            if (loading) return <p className="text-white animate-pulse">Loading fees...</p>;
            if (error) return <p className="text-red-500">Error loading fees</p>;

            const fees = data?.shelterAdoptionFees || [];
            const filtered = this.filterFees(fees);

            if (filtered.length === 0) {
              return (
                <Card className="bg-white">
                  <CardContent className="text-center py-6">
                    <p className="text-muted-foreground">No adoption fees found.</p>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-sky-blue font-capriola text-base">
                    Fees ({filtered.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filtered.map((fee) => (
                      <div key={fee._id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">
                              {fee.animalId ? this.getAnimalName(fee.animalId) : fee.animalType}
                            </span>
                            <span className="font-bold text-green-700">
                              {this.formatCurrency(fee.amount || fee.baseFee, fee.currency || "USD")}
                            </span>
                            <span className={`text-xs text-white px-2 py-0.5 rounded-full ${fee.status ? STATUS_STYLES[fee.status] : "bg-gray-500"}`}>
                              {fee.status ? STATUS_LABELS[fee.status] : "N/A"}
                            </span>
                          </div>
                        </div>
                        {fee.description && (
                          <p className="text-xs text-gray-600">{fee.description}</p>
                        )}
                        {fee.waived && fee.waivedReason && (
                          <p className="text-xs text-blue-600">Waived: {fee.waivedReason}</p>
                        )}
                        {fee.paidBy && (
                          <p className="text-xs text-green-600">Paid by: {fee.paidBy}</p>
                        )}
                        {fee.status === 'pending' && (
                          <div className="flex gap-2 mt-2">
                            <Mutation
                              mutation={UPDATE_ADOPTION_FEE_STATUS}
                              refetchQueries={[{ query: SHELTER_ADOPTION_FEES, variables: { shelterId } }]}
                            >
                              {(updateStatus: (opts: { variables: { _id: string; status: string; paidBy: string } }) => void) => (
                                <>
                                  {this.state.markPaidId === fee._id ? (
                                    <div className="flex gap-1 items-center">
                                      <input
                                        type="text"
                                        value={this.state.paidBy}
                                        onChange={(e) => this.setState({ paidBy: e.target.value })}
                                        placeholder="Paid by"
                                        className="text-xs border rounded px-1 py-0.5 w-24"
                                      />
                                      <button
                                        onClick={() => {
                                          updateStatus({ variables: { _id: fee._id, status: 'paid', paidBy: this.state.paidBy } });
                                          this.setState({ markPaidId: '', paidBy: '' });
                                        }}
                                        className="text-xs bg-green-500 text-white px-2 py-0.5 rounded"
                                      >
                                        Confirm
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => this.setState({ markPaidId: fee._id })}
                                      className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded"
                                    >
                                      Mark Paid
                                    </button>
                                  )}
                                </>
                              )}
                            </Mutation>
                            <Mutation
                              mutation={WAIVE_ADOPTION_FEE}
                              refetchQueries={[{ query: SHELTER_ADOPTION_FEES, variables: { shelterId } }]}
                            >
                              {(waiveFee: (opts: { variables: { _id: string; waivedReason: string } }) => void) => (
                                <>
                                  {this.state.waiveId === fee._id ? (
                                    <div className="flex gap-1 items-center">
                                      <input
                                        type="text"
                                        value={this.state.waivedReason}
                                        onChange={(e) => this.setState({ waivedReason: e.target.value })}
                                        placeholder="Reason"
                                        className="text-xs border rounded px-1 py-0.5 w-24"
                                      />
                                      <button
                                        onClick={() => {
                                          waiveFee({ variables: { _id: fee._id, waivedReason: this.state.waivedReason } });
                                          this.setState({ waiveId: '', waivedReason: '' });
                                        }}
                                        className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded"
                                      >
                                        Confirm
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => this.setState({ waiveId: fee._id })}
                                      className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
                                    >
                                      Waive
                                    </button>
                                  )}
                                </>
                              )}
                            </Mutation>
                          </div>
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

export default AdoptionFeeManager;
