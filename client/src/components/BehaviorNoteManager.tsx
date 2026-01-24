import React, { Component } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  BehaviorNote,
  BehaviorNoteType as NoteType,
  BehaviorNoteSeverity,
  ShelterBehaviorNotesResponse
} from "../types";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";

const { SHELTER_BEHAVIOR_NOTES } = Queries;
const { ADD_BEHAVIOR_NOTE, RESOLVE_BEHAVIOR_NOTE } = Mutations;

const NOTE_TYPE_OPTIONS: { value: NoteType; label: string }[] = [
  { value: "behavior", label: "Behavior" },
  { value: "training", label: "Training" },
  { value: "health", label: "Health" },
  { value: "general", label: "General" }
];

const SEVERITY_OPTIONS: { value: BehaviorNoteSeverity; label: string }[] = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "critical", label: "Critical" }
];

const SEVERITY_STYLES: Record<BehaviorNoteSeverity, string> = {
  info: "bg-blue-100 text-blue-800",
  warning: "bg-yellow-100 text-yellow-800",
  critical: "bg-red-100 text-red-800"
};

const NOTE_TYPE_STYLES: Record<NoteType, string> = {
  behavior: "bg-purple-100 text-purple-800",
  training: "bg-green-100 text-green-800",
  health: "bg-orange-100 text-orange-800",
  general: "bg-gray-100 text-gray-800"
};

interface BehaviorNoteManagerProps {
  shelterId: string;
  animals: { _id: string; name: string }[];
}

interface BehaviorNoteManagerState {
  showForm: boolean;
  animalId: string;
  noteType: NoteType;
  content: string;
  author: string;
  severity: BehaviorNoteSeverity;
  filterType: NoteType | "all";
  filterSeverity: BehaviorNoteSeverity | "all";
  showResolved: boolean;
}

class BehaviorNoteManager extends Component<BehaviorNoteManagerProps, BehaviorNoteManagerState> {
  constructor(props: BehaviorNoteManagerProps) {
    super(props);
    this.state = {
      showForm: false,
      animalId: "",
      noteType: "general",
      content: "",
      author: "",
      severity: "info",
      filterType: "all",
      filterSeverity: "all",
      showResolved: false
    };
  }

  resetForm() {
    this.setState({
      showForm: false,
      animalId: "",
      noteType: "general",
      content: "",
      author: "",
      severity: "info"
    });
  }

  filterNotes(notes: BehaviorNote[]): BehaviorNote[] {
    return notes.filter((note) => {
      if (!this.state.showResolved && note.resolved) return false;
      if (this.state.filterType !== "all" && note.noteType !== this.state.filterType) return false;
      if (this.state.filterSeverity !== "all" && note.severity !== this.state.filterSeverity) return false;
      return true;
    });
  }

  getAnimalName(animalId: string): string {
    const animal = this.props.animals.find((a) => a._id === animalId);
    return animal ? animal.name : "Unknown";
  }

  renderForm() {
    if (!this.state.showForm) return null;

    return (
      <Mutation
        mutation={ADD_BEHAVIOR_NOTE}
        refetchQueries={[{ query: SHELTER_BEHAVIOR_NOTES, variables: { shelterId: this.props.shelterId } }]}
      >
        {(addNote: (opts: { variables: Record<string, string> }) => Promise<{ data?: { addBehaviorNote?: BehaviorNote } | null }>) => (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">Add Behavior Note</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <select
                value={this.state.animalId}
                onChange={(e) => this.setState({ animalId: e.target.value })}
                className="border rounded px-3 py-2 text-sm"
              >
                <option value="">Select Animal</option>
                {this.props.animals.map((animal) => (
                  <option key={animal._id} value={animal._id}>{animal.name}</option>
                ))}
              </select>
              <select
                value={this.state.noteType}
                onChange={(e) => this.setState({ noteType: e.target.value as NoteType })}
                className="border rounded px-3 py-2 text-sm"
              >
                {NOTE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <select
                value={this.state.severity}
                onChange={(e) => this.setState({ severity: e.target.value as BehaviorNoteSeverity })}
                className="border rounded px-3 py-2 text-sm"
              >
                {SEVERITY_OPTIONS.map((opt) => (
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
              placeholder="Note content..."
              className="w-full border rounded px-3 py-2 text-sm mb-3 min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button
                variant="salmon"
                size="sm"
                onClick={() => {
                  if (this.state.animalId && this.state.content) {
                    addNote({
                      variables: {
                        animalId: this.state.animalId,
                        shelterId: this.props.shelterId,
                        noteType: this.state.noteType,
                        content: this.state.content,
                        author: this.state.author,
                        severity: this.state.severity
                      }
                    }).then(() => this.resetForm());
                  }
                }}
              >
                Save Note
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

  renderNoteCard(note: BehaviorNote) {
    return (
      <div key={note._id} className={`p-3 rounded-lg border ${note.resolved ? "opacity-60" : ""}`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${NOTE_TYPE_STYLES[note.noteType as NoteType]}`}>
              {note.noteType}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SEVERITY_STYLES[note.severity as BehaviorNoteSeverity]}`}>
              {note.severity}
            </span>
            {note.resolved && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                Resolved
              </span>
            )}
          </div>
          <Mutation
            mutation={RESOLVE_BEHAVIOR_NOTE}
            refetchQueries={[{ query: SHELTER_BEHAVIOR_NOTES, variables: { shelterId: this.props.shelterId } }]}
          >
            {(resolveNote: (opts: { variables: { _id: string; resolved: boolean } }) => void) => (
              <button
                onClick={() => resolveNote({ variables: { _id: note._id, resolved: !note.resolved } })}
                className="text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap"
              >
                {note.resolved ? "Reopen" : "Resolve"}
              </button>
            )}
          </Mutation>
        </div>
        <p className="text-sm text-gray-800 mb-1">{note.content}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{this.getAnimalName(note.animalId)}</span>
          {note.author && <span>by {note.author}</span>}
          <span>{new Date(note.createdAt).toLocaleDateString()}</span>
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
            <CardTitle className="text-sky-blue font-capriola">Behavior Notes</CardTitle>
            <Button
              variant="salmon"
              size="sm"
              onClick={() => this.setState({ showForm: !this.state.showForm })}
            >
              + Add Note
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {this.renderForm()}

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <select
              value={this.state.filterType}
              onChange={(e) => this.setState({ filterType: e.target.value as NoteType | "all" })}
              className="text-xs border rounded px-2 py-1"
            >
              <option value="all">All Types</option>
              {NOTE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={this.state.filterSeverity}
              onChange={(e) => this.setState({ filterSeverity: e.target.value as BehaviorNoteSeverity | "all" })}
              className="text-xs border rounded px-2 py-1"
            >
              <option value="all">All Severities</option>
              {SEVERITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <label className="flex items-center gap-1 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={this.state.showResolved}
                onChange={(e) => this.setState({ showResolved: e.target.checked })}
              />
              Show Resolved
            </label>
          </div>

          <Query<ShelterBehaviorNotesResponse>
            query={SHELTER_BEHAVIOR_NOTES}
            variables={{ shelterId }}
          >
            {({ loading, error, data }) => {
              if (loading) return <p className="text-gray-500 animate-pulse">Loading notes...</p>;
              if (error) return <p className="text-red-500">Error loading notes</p>;

              const notes = data?.shelterBehaviorNotes || [];
              const filtered = this.filterNotes(notes);

              if (filtered.length === 0) {
                return (
                  <p className="text-muted-foreground text-center py-4">
                    No behavior notes found.
                  </p>
                );
              }

              return (
                <div className="space-y-3">
                  {filtered.map((note) => this.renderNoteCard(note))}
                </div>
              );
            }}
          </Query>
        </CardContent>
      </Card>
    );
  }
}

export default BehaviorNoteManager;
