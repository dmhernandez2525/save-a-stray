import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Query } from "@apollo/client/react/components";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  FetchUserResponse,
  UserApplicationsResponse,
  Application,
  ApplicationStatus,
  Animal,
} from "../types";
import Queries from "../graphql/queries";

const { FETCH_USER, USER_APPLICATIONS, USER_FAVORITES } = Queries;

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  submitted: "bg-gray-500",
  under_review: "bg-yellow-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
};

type TabType = "favorites" | "applications";

interface UserProfileProps {
  userId: string;
}

interface UserProfileState {
  activeTab: TabType;
}

class UserProfile extends Component<UserProfileProps, UserProfileState> {
  constructor(props: UserProfileProps) {
    super(props);
    this.state = { activeTab: "favorites" };
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  renderFavorites() {
    return (
      <Query<{ userFavorites: Animal[] }>
        query={USER_FAVORITES}
        variables={{ userId: this.props.userId }}
      >
        {({ loading, error, data }) => {
          if (loading) return <p className="text-muted-foreground animate-pulse">Loading favorites...</p>;
          if (error) return <p className="text-red-500">Error loading favorites</p>;

          const favorites = data?.userFavorites || [];

          if (favorites.length === 0) {
            return (
              <p className="text-muted-foreground text-center py-4">
                No favorites yet. Browse animals to add some!
              </p>
            );
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {favorites.map((animal) => (
                <Link
                  key={animal._id}
                  to={`/AnimalShow/${animal._id}`}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors no-underline"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <img src={animal.image} alt={animal.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{animal.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {animal.breed && `${animal.breed} · `}{animal.type} · {animal.age} yrs
                    </p>
                  </div>
                  {animal.status && (
                    <span className={`text-xs text-white font-semibold px-2 py-0.5 rounded-full ${
                      animal.status === "available" ? "bg-green-500" :
                      animal.status === "pending" ? "bg-yellow-500" : "bg-blue-500"
                    }`}>
                      {animal.status.charAt(0).toUpperCase() + animal.status.slice(1)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          );
        }}
      </Query>
    );
  }

  renderApplications() {
    return (
      <Query<UserApplicationsResponse>
        query={USER_APPLICATIONS}
        variables={{ userId: this.props.userId }}
      >
        {({ loading, error, data }) => {
          if (loading) return <p className="text-muted-foreground animate-pulse">Loading applications...</p>;
          if (error) return <p className="text-red-500">Error loading applications</p>;

          const applications = data?.userApplications || [];

          if (applications.length === 0) {
            return (
              <p className="text-muted-foreground text-center py-4">
                No applications submitted yet.
              </p>
            );
          }

          return (
            <div className="space-y-2">
              {applications.map((app: Application) => {
                const status = (app.status || "submitted") as ApplicationStatus;
                return (
                  <div key={app._id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    {app.animal?.image && (
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <img src={app.animal.image} alt={app.animal?.name || "Animal"} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {app.animal?.name || "Unknown Animal"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {app.animal?.breed && `${app.animal.breed} · `}
                        {app.animal?.type || ""} · Submitted {this.formatDate(app.submittedAt)}
                      </p>
                    </div>
                    <span className={`text-xs text-white font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[status]}`}>
                      {STATUS_LABELS[status]}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        }}
      </Query>
    );
  }

  render() {
    const { userId } = this.props;
    const { activeTab } = this.state;

    return (
      <div className="max-w-3xl mx-auto p-4 pt-6">
        <Query<FetchUserResponse>
          query={FETCH_USER}
          variables={{ _id: userId }}
        >
          {({ loading, error, data }) => {
            if (loading) return <p className="text-white font-capriola animate-pulse">Loading profile...</p>;
            if (error) return <p className="text-red-500 font-capriola">Error loading profile</p>;

            const user = data?.user;

            return (
              <>
                <Card className="bg-card mb-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-sky-blue flex items-center justify-center text-white text-2xl font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-foreground">{user?.name || "User"}</h1>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                        <p className="text-xs text-muted-foreground capitalize mt-1">
                          {user?.userRole === "endUser" ? "Adopter" : "Shelter Staff"}
                          {user?.shelter && ` · ${user.shelter.name}`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-2 mb-4">
                  {(["favorites", "applications"] as TabType[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => this.setState({ activeTab: tab })}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                        activeTab === tab
                          ? "bg-card text-foreground shadow-md"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {tab === "favorites" ? "Favorites" : "My Applications"}
                    </button>
                  ))}
                </div>

                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-sky-blue font-capriola">
                      {activeTab === "favorites" ? "Favorites" : "My Applications"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activeTab === "favorites" ? this.renderFavorites() : this.renderApplications()}
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

export default UserProfile;
