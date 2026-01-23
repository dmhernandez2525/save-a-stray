import React, { Component } from "react";
import { Query } from "@apollo/client/react/components";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Queries from "../graphql/queries";
import { ShelterActivityLogResponse, ActivityLogEntry, ActivityEntityType } from "../types";

const { SHELTER_ACTIVITY_LOG } = Queries;

const ENTITY_ICONS: Record<ActivityEntityType, string> = {
  animal: "🐾",
  application: "📋",
  user: "👤",
  shelter: "🏠",
  event: "📅",
  donation: "💝"
};

const ENTITY_COLORS: Record<ActivityEntityType, string> = {
  animal: "bg-green-50 border-green-200",
  application: "bg-blue-50 border-blue-200",
  user: "bg-purple-50 border-purple-200",
  shelter: "bg-yellow-50 border-yellow-200",
  event: "bg-orange-50 border-orange-200",
  donation: "bg-pink-50 border-pink-200"
};

interface ActivityFeedProps {
  shelterId: string;
}

class ActivityFeed extends Component<ActivityFeedProps> {
  formatTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  renderActivityItem(entry: ActivityLogEntry) {
    const icon = ENTITY_ICONS[entry.entityType] || "📌";
    const colorClass = ENTITY_COLORS[entry.entityType] || "bg-gray-50 border-gray-200";

    return (
      <div key={entry._id} className={`border rounded-lg p-3 mb-2 ${colorClass}`}>
        <div className="flex items-start gap-3">
          <span className="text-lg flex-shrink-0">{icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800">{entry.action}</p>
            <p className="text-xs text-gray-600 mt-0.5">{entry.description}</p>
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {this.formatTimeAgo(entry.createdAt)}
          </span>
        </div>
      </div>
    );
  }

  render() {
    const { shelterId } = this.props;

    return (
      <Card className="bg-white mb-6">
        <CardHeader>
          <CardTitle className="text-sky-blue font-capriola text-lg">Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <Query<ShelterActivityLogResponse> query={SHELTER_ACTIVITY_LOG} variables={{ shelterId, limit: 20 }}>
            {({ loading, error, data }) => {
              if (loading) return <p className="text-gray-500 animate-pulse">Loading activity...</p>;
              if (error) return <p className="text-red-500">Error loading activity feed</p>;

              const entries = data?.shelterActivityLog || [];

              if (entries.length === 0) {
                return <p className="text-gray-500 text-sm">No activity recorded yet.</p>;
              }

              return (
                <div>
                  {entries.map((entry) => this.renderActivityItem(entry))}
                </div>
              );
            }}
          </Query>
        </CardContent>
      </Card>
    );
  }
}

export default ActivityFeed;
