import React, { Component } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ShelterTerminalReadersResponse, TerminalReader } from "../types";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";

const { SHELTER_TERMINAL_READERS } = Queries;
const { REGISTER_TERMINAL_READER, DELETE_TERMINAL_READER, CREATE_TERMINAL_PAYMENT_INTENT } = Mutations;

interface TerminalReaderManagerProps {
  shelterId: string;
}

interface TerminalReaderManagerState {
  showRegisterForm: boolean;
  registrationCode: string;
  label: string;
  location: string;
  paymentReaderId: string;
  paymentAmount: string;
  paymentDescription: string;
  paymentStatus: string;
}

class TerminalReaderManager extends Component<TerminalReaderManagerProps, TerminalReaderManagerState> {
  constructor(props: TerminalReaderManagerProps) {
    super(props);
    this.state = {
      showRegisterForm: false,
      registrationCode: "",
      label: "",
      location: "",
      paymentReaderId: "",
      paymentAmount: "",
      paymentDescription: "",
      paymentStatus: ""
    };
  }

  resetForm() {
    this.setState({
      showRegisterForm: false,
      registrationCode: "",
      label: "",
      location: ""
    });
  }

  renderReaderCard(reader: TerminalReader) {
    const isOnline = reader.status === "online";
    return (
      <div key={reader._id} className="border rounded-lg p-4 bg-white flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
            <p className="font-semibold text-gray-800">{reader.label}</p>
          </div>
          <div className="text-xs text-gray-500 mt-1 space-y-0.5">
            <p>Device: {reader.deviceType} | Serial: {reader.serialNumber || "N/A"}</p>
            {reader.location && <p>Location: {reader.location}</p>}
            <p>Registered: {new Date(reader.registeredAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => this.setState({
              paymentReaderId: reader.stripeReaderId,
              paymentAmount: "",
              paymentDescription: "",
              paymentStatus: ""
            })}
          >
            Charge
          </Button>
          <Mutation
            mutation={DELETE_TERMINAL_READER}
            refetchQueries={[{ query: SHELTER_TERMINAL_READERS, variables: { shelterId: this.props.shelterId } }]}
          >
            {(deleteReader: (opts: { variables: { _id: string } }) => void) => (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700"
                onClick={() => deleteReader({ variables: { _id: reader._id } })}
              >
                Remove
              </Button>
            )}
          </Mutation>
        </div>
      </div>
    );
  }

  renderPaymentForm() {
    if (!this.state.paymentReaderId) return null;

    return (
      <Mutation mutation={CREATE_TERMINAL_PAYMENT_INTENT}>
        {(createPayment: (opts: { variables: Record<string, unknown> }) => Promise<{ data?: { createTerminalPaymentIntent: { id: string; status: string } } | null }>) => (
          <Card className="bg-blue-50 border-blue-200 mt-4">
            <CardHeader>
              <CardTitle className="text-sky-blue font-capriola text-base">Process Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="payment-amount">Amount (cents)</Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    value={this.state.paymentAmount}
                    onChange={(e) => this.setState({ paymentAmount: e.target.value })}
                    placeholder="e.g. 5000 for $50.00"
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="payment-description">Description</Label>
                  <Input
                    id="payment-description"
                    value={this.state.paymentDescription}
                    onChange={(e) => this.setState({ paymentDescription: e.target.value })}
                    placeholder="Adoption fee, donation, etc."
                    className="bg-white"
                  />
                </div>
              </div>
              {this.state.paymentStatus && (
                <p className="text-sm font-medium text-green-700">
                  Payment initiated: {this.state.paymentStatus}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="salmon"
                  disabled={!this.state.paymentAmount || parseInt(this.state.paymentAmount) <= 0}
                  onClick={async () => {
                    const result = await createPayment({
                      variables: {
                        shelterId: this.props.shelterId,
                        readerId: this.state.paymentReaderId,
                        amount: parseInt(this.state.paymentAmount),
                        currency: "usd",
                        description: this.state.paymentDescription || "Terminal payment"
                      }
                    });
                    if (result?.data?.createTerminalPaymentIntent) {
                      this.setState({
                        paymentStatus: `ID: ${result.data.createTerminalPaymentIntent.id} - ${result.data.createTerminalPaymentIntent.status}`
                      });
                    }
                  }}
                >
                  Process Payment
                </Button>
                <Button variant="outline" onClick={() => this.setState({ paymentReaderId: "", paymentStatus: "" })}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </Mutation>
    );
  }

  render() {
    const { shelterId } = this.props;

    return (
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sky-blue font-capriola text-lg">Terminal Readers</CardTitle>
          <Button
            variant="salmon"
            size="sm"
            onClick={() => this.setState({ showRegisterForm: !this.state.showRegisterForm })}
          >
            {this.state.showRegisterForm ? "Cancel" : "+ Register Reader"}
          </Button>
        </CardHeader>
        <CardContent>
          {this.state.showRegisterForm && (
            <Mutation
              mutation={REGISTER_TERMINAL_READER}
              refetchQueries={[{ query: SHELTER_TERMINAL_READERS, variables: { shelterId } }]}
              onCompleted={() => this.resetForm()}
            >
              {(registerReader: (opts: { variables: Record<string, string> }) => void) => (
                <div className="border rounded-lg p-4 mb-4 bg-gray-50 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="reader-code">Registration Code *</Label>
                      <Input
                        id="reader-code"
                        value={this.state.registrationCode}
                        onChange={(e) => this.setState({ registrationCode: e.target.value })}
                        placeholder="simulated-wpe"
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="reader-label">Label *</Label>
                      <Input
                        id="reader-label"
                        value={this.state.label}
                        onChange={(e) => this.setState({ label: e.target.value })}
                        placeholder="Front Desk Reader"
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="reader-location">Location</Label>
                      <Input
                        id="reader-location"
                        value={this.state.location}
                        onChange={(e) => this.setState({ location: e.target.value })}
                        placeholder="Main lobby"
                        className="bg-white"
                      />
                    </div>
                  </div>
                  <Button
                    variant="salmon"
                    disabled={!this.state.registrationCode || !this.state.label}
                    onClick={() => registerReader({
                      variables: {
                        shelterId,
                        registrationCode: this.state.registrationCode,
                        label: this.state.label,
                        location: this.state.location
                      }
                    })}
                  >
                    Register
                  </Button>
                </div>
              )}
            </Mutation>
          )}

          <Query<ShelterTerminalReadersResponse>
            query={SHELTER_TERMINAL_READERS}
            variables={{ shelterId }}
          >
            {({ loading, error, data }) => {
              if (loading) return <p className="text-gray-500 animate-pulse">Loading readers...</p>;
              if (error) return <p className="text-red-500">Error loading terminal readers</p>;

              const readers = data?.shelterTerminalReaders || [];

              if (readers.length === 0) {
                return (
                  <p className="text-muted-foreground text-center py-4 text-sm">
                    No terminal readers registered. Register a Stripe Terminal reader to accept in-person payments.
                  </p>
                );
              }

              return (
                <div className="space-y-3">
                  {readers.map((reader) => this.renderReaderCard(reader))}
                </div>
              );
            }}
          </Query>

          {this.renderPaymentForm()}
        </CardContent>
      </Card>
    );
  }
}

export default TerminalReaderManager;
