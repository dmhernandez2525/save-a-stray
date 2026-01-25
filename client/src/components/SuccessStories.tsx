import React, { useState, FormEvent } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { ApolloConsumer, ApolloClient } from "@apollo/client";
import { Link } from "react-router-dom";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import {
  SuccessStoriesResponse,
  SuccessStory,
  CreateSuccessStoryResponse,
  UserIdData,
} from "../types";
import { Heart, PenLine, ArrowLeft, Calendar, X, ImageIcon, Send } from "lucide-react";

const { SUCCESS_STORIES, USER_ID } = Queries;
const { CREATE_SUCCESS_STORY } = Mutations;

const SuccessStoriesPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [animalName, setAnimalName] = useState("");
  const [animalType, setAnimalType] = useState("");
  const [story, setStory] = useState("");
  const [image, setImage] = useState("");

  const resetForm = () => {
    setTitle("");
    setAnimalName("");
    setAnimalType("");
    setStory("");
    setImage("");
    setShowForm(false);
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderStoryCard = (storyItem: SuccessStory, index: number) => {
    return (
      <Card
        key={storyItem._id}
        className="overflow-hidden animate-fade-in-up"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className={storyItem.image ? "grid grid-cols-1 md:grid-cols-3" : ""}>
          {storyItem.image && (
            <div className="md:col-span-1 relative">
              <img
                src={storyItem.image}
                alt={storyItem.animalName}
                className="w-full h-48 md:h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:bg-gradient-to-r" />
            </div>
          )}
          <div className={storyItem.image ? "md:col-span-2 p-5 sm:p-6" : "p-5 sm:p-6"}>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1">
                  {storyItem.title}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {storyItem.animalType}
                  </Badge>
                  <span className="text-sky-blue-600 dark:text-sky-blue-400 font-medium text-sm">
                    {storyItem.animalName}
                  </span>
                </div>
              </div>
              <Heart className="h-5 w-5 text-salmon-400 fill-salmon-400 flex-shrink-0" />
            </div>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4">
              {storyItem.story}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDate(storyItem.createdAt)}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderForm = (userId: string) => {
    if (!userId) return null;

    return (
      <Mutation<CreateSuccessStoryResponse>
        mutation={CREATE_SUCCESS_STORY}
        refetchQueries={[{ query: SUCCESS_STORIES }]}
        onCompleted={resetForm}
      >
        {(createStory, { loading, error }) => (
          <Card className="mb-8 animate-fade-in-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-capriola flex items-center gap-2">
                    <PenLine className="h-5 w-5 text-sky-blue-500" />
                    Share Your Story
                  </CardTitle>
                  <CardDescription>
                    Tell us about your adoption experience
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 mb-4">
                  Error submitting story. Please try again.
                </div>
              )}
              <form
                className="space-y-4"
                onSubmit={(e: FormEvent) => {
                  e.preventDefault();
                  createStory({
                    variables: {
                      userId,
                      title,
                      animalName,
                      animalType,
                      story,
                      image: image || undefined,
                    },
                  });
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="title">Story Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your story a title"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="animalName">Pet's Name</Label>
                    <Input
                      id="animalName"
                      value={animalName}
                      onChange={(e) => setAnimalName(e.target.value)}
                      placeholder="Your pet's name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="animalType">Pet Type</Label>
                    <Input
                      id="animalType"
                      value={animalType}
                      onChange={(e) => setAnimalType(e.target.value)}
                      placeholder="Dog, Cat, etc."
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="story">Your Story</Label>
                  <Textarea
                    id="story"
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    placeholder="Tell us about your adoption experience..."
                    className="min-h-[120px]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Photo URL (optional)
                  </Label>
                  <Input
                    id="image"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    variant="skyBlue"
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? "Submitting..." : "Submit Story"}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowForm(false)}
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
  };

  return (
    <div className="min-h-screen bg-background col-start-1 col-end-6 row-start-1 row-end-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-salmon-300 to-salmon-400 text-white">
        <div className="container-wide py-8 md:py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-capriola text-3xl md:text-4xl mb-2">
                Success Stories
              </h1>
              <p className="text-white/90">
                Heartwarming tales from our adoption community
              </p>
            </div>
            <ApolloConsumer>
              {(client: ApolloClient<object>) => {
                const data = client.readQuery<UserIdData>({ query: USER_ID });
                const userId = data?.userId || "";
                if (userId && !showForm) {
                  return (
                    <Button
                      onClick={() => setShowForm(true)}
                      className="bg-white text-salmon-600 hover:bg-white/90"
                    >
                      <PenLine className="h-4 w-4 mr-2" />
                      Share Your Story
                    </Button>
                  );
                }
                return null;
              }}
            </ApolloConsumer>
          </div>
        </div>
      </div>

      <div className="container-wide py-8">
        <ApolloConsumer>
          {(client: ApolloClient<object>) => {
            const data = client.readQuery<UserIdData>({ query: USER_ID });
            const userId = data?.userId || "";
            if (showForm) {
              return renderForm(userId);
            }
            return null;
          }}
        </ApolloConsumer>

        <Query<SuccessStoriesResponse> query={SUCCESS_STORIES}>
          {({ loading, error, data }) => {
            if (loading) {
              return (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-3">
                        <Skeleton className="h-48 md:h-full" />
                        <div className="md:col-span-2 p-6 space-y-3">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-20 w-full" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              );
            }

            if (error) {
              return (
                <Card className="p-8 text-center">
                  <p className="text-destructive">
                    Error loading stories. Please try again later.
                  </p>
                </Card>
              );
            }

            const stories = data?.successStories || [];

            if (stories.length === 0) {
              return (
                <Card className="p-12 text-center">
                  <Heart className="h-12 w-12 mx-auto text-salmon-300 mb-4" />
                  <h2 className="font-capriola text-xl mb-2">No Stories Yet</h2>
                  <p className="text-muted-foreground mb-6">
                    Be the first to share your adoption story and inspire others!
                  </p>
                  <ApolloConsumer>
                    {(client: ApolloClient<object>) => {
                      const userData = client.readQuery<UserIdData>({ query: USER_ID });
                      if (userData?.userId) {
                        return (
                          <Button
                            variant="salmon"
                            onClick={() => setShowForm(true)}
                          >
                            Share Your Story
                          </Button>
                        );
                      }
                      return (
                        <Button variant="outline" asChild>
                          <Link to="/login">Sign in to share your story</Link>
                        </Button>
                      );
                    }}
                  </ApolloConsumer>
                </Card>
              );
            }

            return (
              <div className="space-y-6">
                {stories.map((storyItem, idx) => renderStoryCard(storyItem, idx))}
              </div>
            );
          }}
        </Query>
      </div>
    </div>
  );
};

export default SuccessStoriesPage;
