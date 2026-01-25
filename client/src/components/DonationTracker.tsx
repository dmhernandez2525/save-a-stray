import React, { Component } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";
import { ShelterDonationsResponse, Donation } from "../types";

const { SHELTER_DONATIONS } = Queries;
const { CREATE_DONATION } = Mutations;

interface DonationTrackerProps {
  shelterId: string;
}

interface DonationFormState {
  donorName: string;
  amount: string;
  message: string;
}

interface DonationTrackerState {
  showForm: boolean;
  form: DonationFormState;
}

class DonationTracker extends Component<DonationTrackerProps, DonationTrackerState> {
  constructor(props: DonationTrackerProps) {
    super(props);
    this.state = {
      showForm: false,
      form: { donorName: '', amount: '', message: '' }
    };
  }

  updateForm(field: keyof DonationFormState, value: string) {
    this.setState((prev) => ({
      form: { ...prev.form, [field]: value }
    }));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  render() {
    const { shelterId } = this.props;

    return (
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sky-blue font-capriola text-lg">Donations</CardTitle>
          <Button
            variant="salmon"
            size="sm"
            onClick={() => this.setState({ showForm: !this.state.showForm })}
          >
            {this.state.showForm ? 'Cancel' : '+ Record Donation'}
          </Button>
        </CardHeader>
        <CardContent>
          {this.state.showForm && (
            <Mutation
              mutation={CREATE_DONATION}
              refetchQueries={[{ query: SHELTER_DONATIONS, variables: { shelterId } }]}
              onCompleted={() => this.setState({
                showForm: false,
                form: { donorName: '', amount: '', message: '' }
              })}
            >
              {(createDonation: (opts: { variables: Record<string, string | number> }) => void) => (
                <div className="border rounded-lg p-4 mb-4 bg-gray-50 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="donor-name">Donor Name</Label>
                      <Input id="donor-name" value={this.state.form.donorName}
                        onChange={(e) => this.updateForm('donorName', e.target.value)}
                        placeholder="Name" className="bg-white" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="donation-amount">Amount ($)</Label>
                      <Input id="donation-amount" type="number" min="1" step="0.01"
                        value={this.state.form.amount}
                        onChange={(e) => this.updateForm('amount', e.target.value)}
                        placeholder="0.00" className="bg-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="donation-message">Message (optional)</Label>
                    <Input id="donation-message" value={this.state.form.message}
                      onChange={(e) => this.updateForm('message', e.target.value)}
                      placeholder="Thank you note or dedication" className="bg-white" />
                  </div>
                  <Button
                    variant="salmon"
                    size="sm"
                    disabled={!this.state.form.donorName || !this.state.form.amount || parseFloat(this.state.form.amount) <= 0}
                    onClick={() => createDonation({
                      variables: {
                        shelterId,
                        donorName: this.state.form.donorName,
                        amount: parseFloat(this.state.form.amount),
                        message: this.state.form.message
                      }
                    })}
                  >
                    Record Donation
                  </Button>
                </div>
              )}
            </Mutation>
          )}

          <Query<ShelterDonationsResponse>
            query={SHELTER_DONATIONS}
            variables={{ shelterId }}
          >
            {({ loading, data }) => {
              if (loading) return <p className="text-sm text-muted-foreground">Loading donations...</p>;
              const donations = data?.shelterDonations || [];
              const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

              if (donations.length === 0) {
                return (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No donations recorded yet.
                  </p>
                );
              }

              return (
                <div>
                  <div className="flex items-center justify-between mb-4 p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Total Donations</p>
                      <p className="text-2xl font-bold text-green-700">{this.formatCurrency(totalAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase">Count</p>
                      <p className="text-2xl font-bold text-green-700">{donations.length}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {donations.map((donation: Donation) => (
                      <div key={donation._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{donation.donorName}</p>
                          {donation.message && (
                            <p className="text-xs text-muted-foreground italic">{donation.message}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-bold text-green-700">{this.formatCurrency(donation.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }}
          </Query>
        </CardContent>
      </Card>
    );
  }
}

export default DonationTracker;
