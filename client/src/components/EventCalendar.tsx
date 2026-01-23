import React, { Component } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";
import { ShelterEventsResponse, ShelterEvent, ShelterEventType } from "../types";

const { SHELTER_EVENTS } = Queries;
const { CREATE_EVENT, DELETE_EVENT } = Mutations;

const EVENT_TYPE_LABELS: Record<ShelterEventType, string> = {
  adoption_day: "Adoption Day",
  fundraiser: "Fundraiser",
  volunteer: "Volunteer",
  education: "Education",
  other: "Other"
};

const EVENT_TYPE_COLORS: Record<ShelterEventType, string> = {
  adoption_day: "bg-green-100 text-green-800",
  fundraiser: "bg-purple-100 text-purple-800",
  volunteer: "bg-blue-100 text-blue-800",
  education: "bg-yellow-100 text-yellow-800",
  other: "bg-gray-100 text-gray-800"
};

interface EventCalendarProps {
  shelterId: string;
}

interface EventFormState {
  title: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  eventType: ShelterEventType;
}

interface EventCalendarState {
  showForm: boolean;
  form: EventFormState;
}

class EventCalendar extends Component<EventCalendarProps, EventCalendarState> {
  constructor(props: EventCalendarProps) {
    super(props);
    this.state = {
      showForm: false,
      form: { title: '', description: '', date: '', endDate: '', location: '', eventType: 'other' }
    };
  }

  updateForm(field: keyof EventFormState, value: string) {
    this.setState((prev) => ({
      form: { ...prev.form, [field]: value }
    }));
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  render() {
    const { shelterId } = this.props;

    return (
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sky-blue font-capriola text-lg">Events</CardTitle>
          <Button
            variant="salmon"
            size="sm"
            onClick={() => this.setState({ showForm: !this.state.showForm })}
          >
            {this.state.showForm ? 'Cancel' : '+ New Event'}
          </Button>
        </CardHeader>
        <CardContent>
          {this.state.showForm && (
            <Mutation
              mutation={CREATE_EVENT}
              refetchQueries={[{ query: SHELTER_EVENTS, variables: { shelterId } }]}
              onCompleted={() => this.setState({
                showForm: false,
                form: { title: '', description: '', date: '', endDate: '', location: '', eventType: 'other' }
              })}
            >
              {(createEvent: (opts: { variables: Record<string, string> }) => void) => (
                <div className="border rounded-lg p-4 mb-4 bg-gray-50 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="event-title">Title</Label>
                      <Input id="event-title" value={this.state.form.title}
                        onChange={(e) => this.updateForm('title', e.target.value)}
                        placeholder="Event name" className="bg-white" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="event-type">Type</Label>
                      <select id="event-type" value={this.state.form.eventType}
                        onChange={(e) => this.updateForm('eventType', e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm bg-white">
                        {(Object.keys(EVENT_TYPE_LABELS) as ShelterEventType[]).map(t => (
                          <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="event-date">Start Date & Time</Label>
                      <Input id="event-date" type="datetime-local" value={this.state.form.date}
                        onChange={(e) => this.updateForm('date', e.target.value)}
                        className="bg-white" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="event-end">End Date & Time</Label>
                      <Input id="event-end" type="datetime-local" value={this.state.form.endDate}
                        onChange={(e) => this.updateForm('endDate', e.target.value)}
                        className="bg-white" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="event-location">Location</Label>
                      <Input id="event-location" value={this.state.form.location}
                        onChange={(e) => this.updateForm('location', e.target.value)}
                        placeholder="Event location" className="bg-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="event-description">Description</Label>
                    <Input id="event-description" value={this.state.form.description}
                      onChange={(e) => this.updateForm('description', e.target.value)}
                      placeholder="Brief description" className="bg-white" />
                  </div>
                  <Button
                    variant="salmon"
                    size="sm"
                    disabled={!this.state.form.title || !this.state.form.date}
                    onClick={() => createEvent({
                      variables: {
                        shelterId,
                        title: this.state.form.title,
                        description: this.state.form.description,
                        date: new Date(this.state.form.date).toISOString(),
                        endDate: this.state.form.endDate ? new Date(this.state.form.endDate).toISOString() : '',
                        location: this.state.form.location,
                        eventType: this.state.form.eventType
                      }
                    })}
                  >
                    Create Event
                  </Button>
                </div>
              )}
            </Mutation>
          )}

          <Query<ShelterEventsResponse>
            query={SHELTER_EVENTS}
            variables={{ shelterId }}
          >
            {({ loading, data }) => {
              if (loading) return <p className="text-sm text-muted-foreground">Loading events...</p>;
              const events = data?.shelterEvents || [];

              if (events.length === 0) {
                return (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No events scheduled. Create your first event to engage with the community.
                  </p>
                );
              }

              return (
                <div className="space-y-3">
                  {events.map((event: ShelterEvent) => {
                    const eventType = (event.eventType || 'other') as ShelterEventType;
                    return (
                      <div key={event._id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0 text-center bg-sky-blue text-white rounded-lg p-2 min-w-[50px]">
                          <p className="text-xs font-bold">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                          <p className="text-lg font-bold leading-tight">{new Date(event.date).getDate()}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-800 text-sm truncate">{event.title}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${EVENT_TYPE_COLORS[eventType]}`}>
                              {EVENT_TYPE_LABELS[eventType]}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {this.formatDate(event.date)} at {this.formatTime(event.date)}
                            {event.endDate && ` - ${this.formatTime(event.endDate)}`}
                          </p>
                          {event.location && (
                            <p className="text-xs text-muted-foreground mt-0.5">{event.location}</p>
                          )}
                          {event.description && (
                            <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                          )}
                        </div>
                        <Mutation
                          mutation={DELETE_EVENT}
                          refetchQueries={[{ query: SHELTER_EVENTS, variables: { shelterId } }]}
                        >
                          {(deleteEvent: (opts: { variables: { _id: string } }) => void) => (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 flex-shrink-0"
                              onClick={() => deleteEvent({ variables: { _id: event._id } })}
                            >
                              Delete
                            </Button>
                          )}
                        </Mutation>
                      </div>
                    );
                  })}
                </div>
              );
            }}
          </Query>
        </CardContent>
      </Card>
    );
  }
}

export default EventCalendar;
