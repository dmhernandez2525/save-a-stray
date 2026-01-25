import React, { Component } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";
import { ShelterStaffResponse, ShelterStaffMember } from "../types";

const { SHELTER_STAFF } = Queries;
const { ADD_SHELTER_STAFF, REMOVE_SHELTER_STAFF } = Mutations;

interface StaffManagementProps {
  shelterId: string;
}

interface StaffManagementState {
  newStaffEmail: string;
  error: string;
  success: string;
}

class StaffManagement extends Component<StaffManagementProps, StaffManagementState> {
  constructor(props: StaffManagementProps) {
    super(props);
    this.state = { newStaffEmail: '', error: '', success: '' };
  }

  render() {
    const { shelterId } = this.props;

    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-sky-blue font-capriola text-lg">Staff Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Query<ShelterStaffResponse>
            query={SHELTER_STAFF}
            variables={{ shelterId }}
          >
            {({ loading, data }) => {
              if (loading) return <p className="text-sm text-muted-foreground">Loading staff...</p>;
              const staff = data?.shelterStaff || [];

              return (
                <div>
                  {staff.length === 0 ? (
                    <p className="text-sm text-muted-foreground mb-4">
                      No staff members yet. Add team members by their email address.
                    </p>
                  ) : (
                    <div className="space-y-2 mb-4">
                      {staff.map((member: ShelterStaffMember) => (
                        <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                          <Mutation
                            mutation={REMOVE_SHELTER_STAFF}
                            refetchQueries={[{ query: SHELTER_STAFF, variables: { shelterId } }]}
                          >
                            {(removeStaff: (opts: { variables: { shelterId: string; userId: string } }) => void) => (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => removeStaff({ variables: { shelterId, userId: member._id } })}
                              >
                                Remove
                              </Button>
                            )}
                          </Mutation>
                        </div>
                      ))}
                    </div>
                  )}

                  {this.state.error && (
                    <p className="text-red-600 text-sm mb-2">{this.state.error}</p>
                  )}
                  {this.state.success && (
                    <p className="text-green-600 text-sm mb-2">{this.state.success}</p>
                  )}

                  <Mutation
                    mutation={ADD_SHELTER_STAFF}
                    refetchQueries={[{ query: SHELTER_STAFF, variables: { shelterId } }]}
                    onCompleted={() => {
                      this.setState({ newStaffEmail: '', error: '', success: 'Staff member added successfully.' });
                      setTimeout(() => this.setState({ success: '' }), 3000);
                    }}
                    onError={(err: Error) => {
                      this.setState({ error: err.message.replace('GraphQL error: ', '') });
                    }}
                  >
                    {(addStaff: (opts: { variables: { shelterId: string; email: string } }) => void) => (
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          placeholder="Enter staff member's email"
                          value={this.state.newStaffEmail}
                          onChange={(e) => this.setState({ newStaffEmail: e.target.value, error: '' })}
                          className="bg-blue-50 flex-1"
                        />
                        <Button
                          variant="salmon"
                          size="sm"
                          disabled={!this.state.newStaffEmail.trim()}
                          onClick={() => {
                            if (this.state.newStaffEmail.trim()) {
                              addStaff({ variables: { shelterId, email: this.state.newStaffEmail.trim() } });
                            }
                          }}
                        >
                          Add Staff
                        </Button>
                      </div>
                    )}
                  </Mutation>
                </div>
              );
            }}
          </Query>
        </CardContent>
      </Card>
    );
  }
}

export default StaffManagement;
