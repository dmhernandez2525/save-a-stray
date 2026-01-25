import React, { Component } from "react";
import { Query } from "@apollo/client/react/components";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Queries from "../graphql/queries";
import { PlatformStatsResponse } from "../types";

const { PLATFORM_STATS } = Queries;

interface AdminPanelProps {}

interface AdminPanelState {}

class AdminPanel extends Component<AdminPanelProps, AdminPanelState> {
  renderStatCard(label: string, value: number, color: string) {
    return (
      <div className={`p-4 rounded-lg ${color}`}>
        <p className="text-xs uppercase font-medium opacity-80">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    );
  }

  render() {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-white font-capriola text-3xl mb-6">Admin Dashboard</h1>

        <Query<PlatformStatsResponse> query={PLATFORM_STATS}>
          {({ loading, error, data }) => {
            if (loading) {
              return <p className="text-white font-capriola animate-pulse">Loading stats...</p>;
            }
            if (error) {
              return <p className="text-red-500">Error loading platform stats</p>;
            }

            const stats = data?.platformStats;
            if (!stats) return null;

            return (
              <>
                <Card className="bg-white mb-6">
                  <CardHeader>
                    <CardTitle className="text-sky-blue font-capriola text-lg">Platform Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {this.renderStatCard('Total Users', stats.totalUsers, 'bg-blue-50 text-blue-800')}
                      {this.renderStatCard('Shelters', stats.totalShelters, 'bg-purple-50 text-purple-800')}
                      {this.renderStatCard('Animals', stats.totalAnimals, 'bg-green-50 text-green-800')}
                      {this.renderStatCard('Applications', stats.totalApplications, 'bg-yellow-50 text-yellow-800')}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white mb-6">
                  <CardHeader>
                    <CardTitle className="text-sky-blue font-capriola text-lg">Animal Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {this.renderStatCard('Available', stats.availableAnimals, 'bg-green-50 text-green-800')}
                      {this.renderStatCard('Adopted', stats.adoptedAnimals, 'bg-blue-50 text-blue-800')}
                      {this.renderStatCard('Donations', stats.totalDonations, 'bg-pink-50 text-pink-800')}
                    </div>
                  </CardContent>
                </Card>
              </>
            );
          }}
        </Query>
      </div>
    );
  }
}

export default AdminPanel;
