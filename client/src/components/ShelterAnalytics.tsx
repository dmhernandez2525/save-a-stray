import React from "react";
import { Query } from "@apollo/client/react/components";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Queries from "../graphql/queries";
import { ShelterAnalyticsResponse } from "../types";

const { SHELTER_ANALYTICS } = Queries;

interface ShelterAnalyticsProps {
  shelterId: string;
}

const ShelterAnalytics: React.FC<ShelterAnalyticsProps> = ({ shelterId }) => {
  return (
    <Query<ShelterAnalyticsResponse>
      query={SHELTER_ANALYTICS}
      variables={{ shelterId }}
    >
      {({ loading, error, data }) => {
        if (loading) {
          return (
            <p className="text-white font-capriola animate-pulse text-sm">
              Loading analytics...
            </p>
          );
        }
        if (error) {
          return (
            <p className="text-red-400 text-sm">Unable to load analytics</p>
          );
        }

        const analytics = data?.shelterAnalytics;
        if (!analytics) return null;

        const adoptionRate = analytics.adoptionRate?.toFixed(1) || "0.0";

        return (
          <div className="space-y-4">
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sky-blue font-capriola text-lg">
                  Adoption Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-800">
                    {adoptionRate}%
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${Math.min(analytics.adoptionRate, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {analytics.adoptedAnimals} of {analytics.totalAnimals} animals adopted
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                label="Total Animals"
                value={analytics.totalAnimals}
                color="bg-sky-blue"
              />
              <StatCard
                label="Available"
                value={analytics.availableAnimals}
                color="bg-green-500"
              />
              <StatCard
                label="Pending"
                value={analytics.pendingAnimals}
                color="bg-yellow-500"
              />
              <StatCard
                label="Adopted"
                value={analytics.adoptedAnimals}
                color="bg-blue-500"
              />
            </div>

            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sky-blue font-capriola text-lg">
                  Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded bg-gray-50">
                    <p className="text-2xl font-bold text-gray-800">
                      {analytics.totalApplications}
                    </p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center p-2 rounded bg-gray-50">
                    <p className="text-2xl font-bold text-gray-800">
                      {analytics.recentApplications}
                    </p>
                    <p className="text-xs text-muted-foreground">Last 30 Days</p>
                  </div>
                  <div className="text-center p-2 rounded bg-gray-50">
                    <p className="text-2xl font-bold text-green-600">
                      {analytics.approvedApplications}
                    </p>
                    <p className="text-xs text-muted-foreground">Approved</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <StatusBar
                    label="Submitted"
                    value={analytics.submittedApplications}
                    total={analytics.totalApplications}
                    color="bg-gray-400"
                  />
                  <StatusBar
                    label="Under Review"
                    value={analytics.underReviewApplications}
                    total={analytics.totalApplications}
                    color="bg-yellow-500"
                  />
                  <StatusBar
                    label="Approved"
                    value={analytics.approvedApplications}
                    total={analytics.totalApplications}
                    color="bg-green-500"
                  />
                  <StatusBar
                    label="Rejected"
                    value={analytics.rejectedApplications}
                    total={analytics.totalApplications}
                    color="bg-red-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }}
    </Query>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => (
  <div className={`${color} rounded-lg p-3 text-center text-white`}>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-xs opacity-90">{label}</p>
  </div>
);

interface StatusBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ label, value, total, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-600 w-24">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-6 text-right">
        {value}
      </span>
    </div>
  );
};

export default ShelterAnalytics;
