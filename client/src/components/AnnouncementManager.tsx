import React, { Component } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Announcement,
  AnnouncementCategory,
  ShelterAnnouncementsResponse
} from "../types";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";

const { SHELTER_ANNOUNCEMENTS } = Queries;
const { CREATE_ANNOUNCEMENT, TOGGLE_ANNOUNCEMENT_PIN, DELETE_ANNOUNCEMENT } = Mutations;

const CATEGORY_OPTIONS: { value: AnnouncementCategory; label: string }[] = [
  { value: "general", label: "General" },
  { value: "event", label: "Event" },
  { value: "urgent", label: "Urgent" },
  { value: "adoption", label: "Adoption" }
];

const CATEGORY_STYLES: Record<AnnouncementCategory, string> = {
  general: "bg-gray-100 text-gray-800",
  event: "bg-blue-100 text-blue-800",
  urgent: "bg-red-100 text-red-800",
  adoption: "bg-green-100 text-green-800"
};

interface AnnouncementManagerProps {
  shelterId: string;
}

interface AnnouncementManagerState {
  showForm: boolean;
  title: string;
  content: string;
  category: AnnouncementCategory;
  author: string;
  filterCategory: AnnouncementCategory | "all";
}

class AnnouncementManager extends Component<AnnouncementManagerProps, AnnouncementManagerState> {
  constructor(props: AnnouncementManagerProps) {
    super(props);
    this.state = {
      showForm: false,
      title: "",
      content: "",
      category: "general",
      author: "",
      filterCategory: "all"
    };
  }

  resetForm() {
    this.setState({
      showForm: false,
      title: "",
      content: "",
      category: "general",
      author: ""
    });
  }

  filterAnnouncements(announcements: Announcement[]): Announcement[] {
    if (this.state.filterCategory === "all") return announcements;
    return announcements.filter((a) => a.category === this.state.filterCategory);
  }

  renderForm() {
    if (!this.state.showForm) return null;

    return (
      <Mutation
        mutation={CREATE_ANNOUNCEMENT}
        refetchQueries={[{ query: SHELTER_ANNOUNCEMENTS, variables: { shelterId: this.props.shelterId } }]}
      >
        {(createAnnouncement: (opts: { variables: Record<string, string> }) => Promise<{ data?: { createAnnouncement?: Announcement } | null }>) => (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">Create Announcement</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                value={this.state.title}
                onChange={(e) => this.setState({ title: e.target.value })}
                placeholder="Announcement title"
                className="border rounded px-3 py-2 text-sm"
              />
              <select
                value={this.state.category}
                onChange={(e) => this.setState({ category: e.target.value as AnnouncementCategory })}
                className="border rounded px-3 py-2 text-sm"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={this.state.author}
                onChange={(e) => this.setState({ author: e.target.value })}
                placeholder="Author name"
                className="border rounded px-3 py-2 text-sm"
              />
            </div>
            <textarea
              value={this.state.content}
              onChange={(e) => this.setState({ content: e.target.value })}
              placeholder="Announcement content..."
              className="w-full border rounded px-3 py-2 text-sm mb-3 min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button
                variant="salmon"
                size="sm"
                onClick={() => {
                  if (this.state.title && this.state.content) {
                    createAnnouncement({
                      variables: {
                        shelterId: this.props.shelterId,
                        title: this.state.title,
                        content: this.state.content,
                        category: this.state.category,
                        author: this.state.author
                      }
                    }).then(() => this.resetForm());
                  }
                }}
              >
                Publish
              </Button>
              <Button variant="outline" size="sm" onClick={() => this.resetForm()}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Mutation>
    );
  }

  renderAnnouncementCard(announcement: Announcement) {
    const { shelterId } = this.props;

    return (
      <div key={announcement._id} className={`p-4 rounded-lg border ${announcement.pinned ? "border-yellow-300 bg-yellow-50" : ""}`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {announcement.pinned && (
                <span className="text-xs text-yellow-600 font-medium">Pinned</span>
              )}
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_STYLES[announcement.category as AnnouncementCategory]}`}>
                {announcement.category}
              </span>
            </div>
            <h4 className="font-semibold text-gray-800">{announcement.title}</h4>
          </div>
          <div className="flex items-center gap-1">
            <Mutation
              mutation={TOGGLE_ANNOUNCEMENT_PIN}
              refetchQueries={[{ query: SHELTER_ANNOUNCEMENTS, variables: { shelterId } }]}
            >
              {(togglePin: (opts: { variables: { _id: string; pinned: boolean } }) => void) => (
                <button
                  onClick={() => togglePin({ variables: { _id: announcement._id, pinned: !announcement.pinned } })}
                  className="text-xs text-blue-600 hover:text-blue-800 px-1"
                  title={announcement.pinned ? "Unpin" : "Pin"}
                >
                  {announcement.pinned ? "Unpin" : "Pin"}
                </button>
              )}
            </Mutation>
            <Mutation
              mutation={DELETE_ANNOUNCEMENT}
              refetchQueries={[{ query: SHELTER_ANNOUNCEMENTS, variables: { shelterId } }]}
            >
              {(deleteAnnouncement: (opts: { variables: { _id: string } }) => void) => (
                <button
                  onClick={() => deleteAnnouncement({ variables: { _id: announcement._id } })}
                  className="text-xs text-red-600 hover:text-red-800 px-1"
                >
                  Delete
                </button>
              )}
            </Mutation>
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-2">{announcement.content}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {announcement.author && <span>by {announcement.author}</span>}
          <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    );
  }

  render() {
    const { shelterId } = this.props;

    return (
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sky-blue font-capriola">Announcements</CardTitle>
            <Button
              variant="salmon"
              size="sm"
              onClick={() => this.setState({ showForm: !this.state.showForm })}
            >
              + New Announcement
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {this.renderForm()}

          <div className="flex items-center gap-2 mb-4">
            <select
              value={this.state.filterCategory}
              onChange={(e) => this.setState({ filterCategory: e.target.value as AnnouncementCategory | "all" })}
              className="text-xs border rounded px-2 py-1"
            >
              <option value="all">All Categories</option>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <Query<ShelterAnnouncementsResponse>
            query={SHELTER_ANNOUNCEMENTS}
            variables={{ shelterId }}
          >
            {({ loading, error, data }) => {
              if (loading) return <p className="text-gray-500 animate-pulse">Loading announcements...</p>;
              if (error) return <p className="text-red-500">Error loading announcements</p>;

              const announcements = data?.shelterAnnouncements || [];
              const filtered = this.filterAnnouncements(announcements);

              if (filtered.length === 0) {
                return (
                  <p className="text-muted-foreground text-center py-4">
                    No announcements yet. Create your first announcement!
                  </p>
                );
              }

              return (
                <div className="space-y-3">
                  {filtered.map((announcement) => this.renderAnnouncementCard(announcement))}
                </div>
              );
            }}
          </Query>
        </CardContent>
      </Card>
    );
  }
}

export default AnnouncementManager;
