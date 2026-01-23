import React, { Component } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";
import { UserSavedSearchesResponse, SavedSearch, SavedSearchFilters } from "../types";

const { USER_SAVED_SEARCHES } = Queries;
const { CREATE_SAVED_SEARCH, DELETE_SAVED_SEARCH } = Mutations;

interface SavedSearchesProps {
  userId: string;
  onRunSearch?: (filters: SavedSearchFilters) => void;
}

interface SavedSearchesState {
  showForm: boolean;
  name: string;
  type: string;
  breed: string;
  sex: string;
  color: string;
  status: string;
  minAge: string;
  maxAge: string;
}

class SavedSearches extends Component<SavedSearchesProps, SavedSearchesState> {
  constructor(props: SavedSearchesProps) {
    super(props);
    this.state = {
      showForm: false,
      name: "",
      type: "",
      breed: "",
      sex: "",
      color: "",
      status: "",
      minAge: "",
      maxAge: ""
    };
  }

  resetForm() {
    this.setState({
      showForm: false,
      name: "",
      type: "",
      breed: "",
      sex: "",
      color: "",
      status: "",
      minAge: "",
      maxAge: ""
    });
  }

  formatFilters(filters: SavedSearchFilters): string {
    const parts: string[] = [];
    if (filters.type) parts.push(`Type: ${filters.type}`);
    if (filters.breed) parts.push(`Breed: ${filters.breed}`);
    if (filters.sex) parts.push(`Sex: ${filters.sex}`);
    if (filters.color) parts.push(`Color: ${filters.color}`);
    if (filters.status) parts.push(`Status: ${filters.status}`);
    if (filters.minAge !== undefined && filters.minAge !== null) parts.push(`Min Age: ${filters.minAge}`);
    if (filters.maxAge !== undefined && filters.maxAge !== null) parts.push(`Max Age: ${filters.maxAge}`);
    return parts.length > 0 ? parts.join(", ") : "No filters";
  }

  renderSearchCard(search: SavedSearch) {
    return (
      <div key={search._id} className="border rounded-lg p-3 mb-2 bg-white flex items-start justify-between">
        <div className="flex-1">
          <p className="font-semibold text-gray-800">{search.name}</p>
          <p className="text-xs text-gray-500 mt-1">{this.formatFilters(search.filters)}</p>
        </div>
        <div className="flex gap-2 ml-3">
          {this.props.onRunSearch && (
            <button
              className="px-3 py-1 text-xs bg-sky-500 text-white rounded hover:bg-sky-600"
              onClick={() => this.props.onRunSearch!(search.filters)}
            >
              Run
            </button>
          )}
          <Mutation
            mutation={DELETE_SAVED_SEARCH}
            refetchQueries={[{ query: USER_SAVED_SEARCHES, variables: { userId: this.props.userId } }]}
          >
            {(deleteSavedSearch: (options: { variables: { _id: string } }) => void) => (
              <button
                className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => deleteSavedSearch({ variables: { _id: search._id } })}
              >
                Delete
              </button>
            )}
          </Mutation>
        </div>
      </div>
    );
  }

  render() {
    const { userId } = this.props;
    const { showForm, name, type, breed, sex, color, status, minAge, maxAge } = this.state;

    return (
      <Card className="bg-white mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sky-blue font-capriola text-lg">Saved Searches</CardTitle>
            <button
              className="px-3 py-1 text-sm bg-sky-500 text-white rounded hover:bg-sky-600"
              onClick={() => this.setState({ showForm: !showForm })}
            >
              {showForm ? "Cancel" : "New Search"}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <Mutation
              mutation={CREATE_SAVED_SEARCH}
              refetchQueries={[{ query: USER_SAVED_SEARCHES, variables: { userId } }]}
              onCompleted={() => this.resetForm()}
            >
              {(createSearch: (options: { variables: Record<string, unknown> }) => void) => (
                <form
                  className="mb-4 p-4 border rounded-lg bg-gray-50 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!name) return;
                    const variables: Record<string, unknown> = { userId, name };
                    if (type) variables.type = type;
                    if (breed) variables.breed = breed;
                    if (sex) variables.sex = sex;
                    if (color) variables.color = color;
                    if (status) variables.status = status;
                    if (minAge) variables.minAge = parseInt(minAge, 10);
                    if (maxAge) variables.maxAge = parseInt(maxAge, 10);
                    createSearch({ variables });
                  }}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Name *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded text-gray-800"
                      value={name}
                      onChange={(e) => this.setState({ name: e.target.value })}
                      placeholder="e.g. Young dogs available"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Animal Type</label>
                      <select
                        className="w-full px-3 py-2 border rounded text-gray-800"
                        value={type}
                        onChange={(e) => this.setState({ type: e.target.value })}
                      >
                        <option value="">Any</option>
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Bird">Bird</option>
                        <option value="Rabbit">Rabbit</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded text-gray-800"
                        value={breed}
                        onChange={(e) => this.setState({ breed: e.target.value })}
                        placeholder="Any breed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
                      <select
                        className="w-full px-3 py-2 border rounded text-gray-800"
                        value={sex}
                        onChange={(e) => this.setState({ sex: e.target.value })}
                      >
                        <option value="">Any</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded text-gray-800"
                        value={color}
                        onChange={(e) => this.setState({ color: e.target.value })}
                        placeholder="Any color"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        className="w-full px-3 py-2 border rounded text-gray-800"
                        value={status}
                        onChange={(e) => this.setState({ status: e.target.value })}
                      >
                        <option value="">Any</option>
                        <option value="available">Available</option>
                        <option value="pending">Pending</option>
                        <option value="adopted">Adopted</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Age</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border rounded text-gray-800"
                          value={minAge}
                          onChange={(e) => this.setState({ minAge: e.target.value })}
                          min="0"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Age</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border rounded text-gray-800"
                          value={maxAge}
                          onChange={(e) => this.setState({ maxAge: e.target.value })}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600"
                  >
                    Save Search
                  </button>
                </form>
              )}
            </Mutation>
          )}

          <Query<UserSavedSearchesResponse> query={USER_SAVED_SEARCHES} variables={{ userId }}>
            {({ loading, error, data }) => {
              if (loading) return <p className="text-gray-500 animate-pulse">Loading saved searches...</p>;
              if (error) return <p className="text-red-500">Error loading saved searches</p>;

              const searches = data?.userSavedSearches || [];

              if (searches.length === 0) {
                return <p className="text-gray-500 text-sm">No saved searches yet. Create one to quickly find animals matching your criteria.</p>;
              }

              return (
                <div>
                  {searches.map((search) => this.renderSearchCard(search))}
                </div>
              );
            }}
          </Query>
        </CardContent>
      </Card>
    );
  }
}

export default SavedSearches;
