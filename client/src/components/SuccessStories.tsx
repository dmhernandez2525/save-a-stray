import React, { Component, FormEvent } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { ApolloConsumer, ApolloClient } from "@apollo/client";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  SuccessStoriesResponse,
  SuccessStory,
  CreateSuccessStoryResponse,
  UserIdData,
} from "../types";

const { SUCCESS_STORIES, USER_ID } = Queries;
const { CREATE_SUCCESS_STORY } = Mutations;

interface SuccessStoriesState {
  showForm: boolean;
  title: string;
  animalName: string;
  animalType: string;
  story: string;
  image: string;
}

class SuccessStoriesPage extends Component<object, SuccessStoriesState> {
  constructor(props: object) {
    super(props);
    this.state = {
      showForm: false,
      title: "",
      animalName: "",
      animalType: "",
      story: "",
      image: "",
    };
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  renderStoryCard(story: SuccessStory) {
    return (
      <Card key={story._id} className="bg-white overflow-hidden">
        <div className={story.image ? "grid grid-cols-1 md:grid-cols-3" : ""}>
          {story.image && (
            <div className="md:col-span-1">
              <img
                src={story.image}
                alt={story.animalName}
                className="w-full h-48 md:h-full object-cover"
              />
            </div>
          )}
          <div className={story.image ? "md:col-span-2 p-5" : "p-5"}>
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {story.title}
            </h3>
            <p className="text-sm text-sky-blue font-semibold mb-2">
              {story.animalName} ({story.animalType})
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              {story.story}
            </p>
            <p className="text-xs text-muted-foreground">
              {this.formatDate(story.createdAt)}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  renderForm(userId: string) {
    if (!userId) return null;

    return (
      <Mutation<CreateSuccessStoryResponse>
        mutation={CREATE_SUCCESS_STORY}
        refetchQueries={[{ query: SUCCESS_STORIES }]}
        onCompleted={() => {
          this.setState({
            showForm: false,
            title: "",
            animalName: "",
            animalType: "",
            story: "",
            image: "",
          });
        }}
      >
        {(createStory, { loading, error }) => (
          <Card className="bg-white mb-6">
            <CardHeader>
              <CardTitle className="text-sky-blue font-capriola text-xl">
                Share Your Story
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <p className="text-red-500 text-sm mb-3">
                  Error submitting story. Please try again.
                </p>
              )}
              <form
                className="flex flex-col gap-3"
                onSubmit={(e: FormEvent) => {
                  e.preventDefault();
                  createStory({
                    variables: {
                      userId,
                      title: this.state.title,
                      animalName: this.state.animalName,
                      animalType: this.state.animalType,
                      story: this.state.story,
                      image: this.state.image || undefined,
                    },
                  });
                }}
              >
                <Input
                  value={this.state.title}
                  onChange={(e) => this.setState({ title: e.target.value })}
                  placeholder="Story Title"
                  className="bg-blue-50"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={this.state.animalName}
                    onChange={(e) =>
                      this.setState({ animalName: e.target.value })
                    }
                    placeholder="Pet's Name"
                    className="bg-blue-50"
                    required
                  />
                  <Input
                    value={this.state.animalType}
                    onChange={(e) =>
                      this.setState({ animalType: e.target.value })
                    }
                    placeholder="Pet Type (Dog, Cat, etc.)"
                    className="bg-blue-50"
                    required
                  />
                </div>
                <textarea
                  value={this.state.story}
                  onChange={(e) => this.setState({ story: e.target.value })}
                  placeholder="Tell us about your adoption experience..."
                  className="w-full min-h-[120px] p-3 rounded-md border bg-blue-50 text-sm resize-y"
                  required
                />
                <Input
                  value={this.state.image}
                  onChange={(e) => this.setState({ image: e.target.value })}
                  placeholder="Photo URL (optional)"
                  className="bg-blue-50"
                />
                <div className="flex gap-2">
                  <Button
                    variant="salmon"
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? "Submitting..." : "Submit Story"}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => this.setState({ showForm: false })}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </Mutation>
    );
  }

  render() {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-capriola text-white">
            Adoption Success Stories
          </h1>
          <ApolloConsumer>
            {(client: ApolloClient<object>) => {
              const data = client.readQuery<UserIdData>({ query: USER_ID });
              const userId = data?.userId || "";
              if (userId && !this.state.showForm) {
                return (
                  <Button
                    variant="salmon"
                    onClick={() => this.setState({ showForm: true })}
                  >
                    Share Your Story
                  </Button>
                );
              }
              return null;
            }}
          </ApolloConsumer>
        </div>

        <ApolloConsumer>
          {(client: ApolloClient<object>) => {
            const data = client.readQuery<UserIdData>({ query: USER_ID });
            const userId = data?.userId || "";
            if (this.state.showForm) {
              return this.renderForm(userId);
            }
            return null;
          }}
        </ApolloConsumer>

        <Query<SuccessStoriesResponse> query={SUCCESS_STORIES}>
          {({ loading, error, data }) => {
            if (loading) {
              return (
                <p className="text-white font-capriola animate-pulse">
                  Loading stories...
                </p>
              );
            }
            if (error) {
              return (
                <p className="text-red-500">Error loading stories</p>
              );
            }

            const stories = data?.successStories || [];

            if (stories.length === 0) {
              return (
                <Card className="bg-white">
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground text-lg">
                      No success stories yet. Be the first to share your
                      adoption story!
                    </p>
                  </CardContent>
                </Card>
              );
            }

            return (
              <div className="space-y-4">
                {stories.map((story) => this.renderStoryCard(story))}
              </div>
            );
          }}
        </Query>
      </div>
    );
  }
}

export default SuccessStoriesPage;
