import React, { Component } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Application, ApplicationStatus, ShelterApplicationsResponse } from "../types";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";

const { SHELTER_APPLICATIONS } = Queries;
const { UPDATE_APPLICATION_STATUS } = Mutations;

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

const STATUS_OPTIONS: ApplicationStatus[] = ["submitted", "under_review", "approved", "rejected"];

interface ShelterApplicationsProps {
  shelterId: string;
}

interface ShelterApplicationsState {
  statusFilter: ApplicationStatus | "all";
}

class ShelterApplications extends Component<ShelterApplicationsProps, ShelterApplicationsState> {
  constructor(props: ShelterApplicationsProps) {
    super(props);
    this.state = { statusFilter: "all" };
  }

  filterApplications(applications: Application[]): Application[] {
    if (this.state.statusFilter === "all") return applications;
    return applications.filter((app) => app.status === this.state.statusFilter);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  parseApplicationData(data: string): Record<string, string> {
    try {
      return JSON.parse(data);
    } catch {
      return { message: data };
    }
  }

  renderApplicationRow(app: Application) {
    const status = (app.status || "submitted") as ApplicationStatus;
    const parsed = this.parseApplicationData(app.applicationData);
    const applicantName = parsed.firstName && parsed.lastName
      ? `${parsed.firstName} ${parsed.lastName}`
      : parsed.email || app.userId;

    return (
      <div key={app._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
        {app.animal?.image && (
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <img src={app.animal.image} alt={app.animal?.name || "Animal"} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 truncate">
            {applicantName}
          </p>
          <p className="text-xs text-muted-foreground">
            For: {app.animal?.name || "Unknown"} · {this.formatDate(app.submittedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs text-white font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[status]}`}>
            {STATUS_LABELS[status]}
          </span>
          <Mutation
            mutation={UPDATE_APPLICATION_STATUS}
            refetchQueries={[{ query: SHELTER_APPLICATIONS, variables: { shelterId: this.props.shelterId } }]}
          >
            {(updateStatus: (opts: { variables: { _id: string; status: string } }) => void) => (
              <select
                value={status}
                onChange={(e) => updateStatus({ variables: { _id: app._id, status: e.target.value } })}
                className="text-xs border rounded px-1 py-0.5"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{STATUS_LABELS[opt]}</option>
                ))}
              </select>
            )}
          </Mutation>
        </div>
      </div>
    );
  }

  render() {
    const { shelterId } = this.props;

    return (
      <Query<ShelterApplicationsResponse>
        query={SHELTER_APPLICATIONS}
        variables={{ shelterId }}
      >
        {({ loading, error, data }) => {
          if (loading) return <p className="text-white font-capriola animate-pulse">Loading applications...</p>;
          if (error) return <p className="text-red-500 font-capriola">Error loading applications</p>;

          const applications = data?.shelterApplications || [];
          const filtered = this.filterApplications(applications);

          const counts = {
            all: applications.length,
            submitted: applications.filter((a) => a.status === "submitted").length,
            under_review: applications.filter((a) => a.status === "under_review").length,
            approved: applications.filter((a) => a.status === "approved").length,
            rejected: applications.filter((a) => a.status === "rejected").length,
          };

          return (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                {(["all", ...STATUS_OPTIONS] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => this.setState({ statusFilter: filter })}
                    className={`p-2 rounded-lg text-center transition-colors text-sm ${
                      this.state.statusFilter === filter
                        ? "bg-white text-gray-800 shadow-md"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    <p className="text-lg font-bold">{counts[filter]}</p>
                    <p className="text-xs uppercase">{filter === "all" ? "All" : STATUS_LABELS[filter]}</p>
                  </button>
                ))}
              </div>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-sky-blue font-capriola">
                    Applications ({filtered.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filtered.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No applications found.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filtered.map((app) => this.renderApplicationRow(app))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          );
        }}
      </Query>
    );
  }
}

export default ShelterApplications;
