import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client";
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
import { SuccessStoriesResponse, SuccessStory, UserIdData, CreateSuccessStoryResponse } from "../types";
import { Heart, PenLine, ArrowLeft, Calendar, X, ImageIcon, Send, AlertCircle } from "lucide-react";

const { SUCCESS_STORIES, USER_ID } = Queries;
const { CREATE_SUCCESS_STORY } = Mutations;

// =============================================================================
// Types
// =============================================================================

interface StoryFormData {
  title: string;
  animalName: string;
  animalType: string;
  story: string;
  image: string;
}

const INITIAL_FORM_STATE: StoryFormData = {
  title: "",
  animalName: "",
  animalType: "",
  story: "",
  image: "",
};

// =============================================================================
// Utilities
// =============================================================================

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function isValidImageUrl(url: string): boolean {
  if (!url) return true; // Empty is valid (optional field)
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// =============================================================================
// Subcomponents
// =============================================================================

const FALLBACK_IMAGE = "/images/placeholder-story.jpg";

interface StoryCardProps {
  story: SuccessStory;
  index: number;
}

function StoryCard({ story, index }: StoryCardProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  return (
    <Card
      className="overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={story.image ? "grid grid-cols-1 md:grid-cols-3" : ""}>
        {story.image && (
          <div className="md:col-span-1 relative">
            <img
              src={story.image}
              alt={`${story.animalName} - ${story.animalType}`}
              className="w-full h-48 md:h-full object-cover"
              onError={handleImageError}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:bg-gradient-to-r pointer-events-none" />
          </div>
        )}
        <div className={story.image ? "md:col-span-2 p-5 sm:p-6" : "p-5 sm:p-6"}>
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1">
                {story.title}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {story.animalType}
                </Badge>
                <span className="text-sky-blue-600 dark:text-sky-blue-400 font-medium text-sm">
                  {story.animalName}
                </span>
              </div>
            </div>
            <Heart className="h-5 w-5 text-salmon-400 fill-salmon-400 flex-shrink-0" aria-hidden="true" />
          </div>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4">
            {story.story}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" aria-hidden="true" />
            <time dateTime={story.createdAt}>{formatDate(story.createdAt)}</time>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface StoryFormProps {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function StoryForm({ userId, onClose, onSuccess }: StoryFormProps) {
  const [form, setForm] = useState<StoryFormData>(INITIAL_FORM_STATE);
  const [validationError, setValidationError] = useState("");

  const [createStory, { loading, error }] = useMutation<CreateSuccessStoryResponse>(CREATE_SUCCESS_STORY, {
    refetchQueries: [{ query: SUCCESS_STORIES }],
    onCompleted: () => {
      setForm(INITIAL_FORM_STATE);
      onSuccess();
    },
  });

  const handleChange = useCallback((field: keyof StoryFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setValidationError("");
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    // Validate image URL if provided
    if (form.image && !isValidImageUrl(form.image)) {
      setValidationError("Please enter a valid image URL (https://...)");
      return;
    }

    createStory({
      variables: {
        userId,
        title: form.title.trim(),
        animalName: form.animalName.trim(),
        animalType: form.animalType.trim(),
        story: form.story.trim(),
        image: form.image.trim() || undefined,
      },
    });
  }, [form, userId, createStory]);

  const displayError = validationError || (error ? "Error submitting story. Please try again." : "");

  return (
    <Card className="mb-8 animate-fade-in-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-capriola flex items-center gap-2">
              <PenLine className="h-5 w-5 text-sky-blue-500" aria-hidden="true" />
              Share Your Story
            </CardTitle>
            <CardDescription>Tell us about your adoption experience</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close form">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {displayError && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 mb-4 flex items-center gap-2" role="alert">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {displayError}
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="title">Story Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Give your story a title"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="animalName">Pet's Name *</Label>
              <Input
                id="animalName"
                value={form.animalName}
                onChange={(e) => handleChange("animalName", e.target.value)}
                placeholder="Your pet's name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="animalType">Pet Type *</Label>
              <Input
                id="animalType"
                value={form.animalType}
                onChange={(e) => handleChange("animalType", e.target.value)}
                placeholder="Dog, Cat, etc."
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="story">Your Story *</Label>
            <Textarea
              id="story"
              value={form.story}
              onChange={(e) => handleChange("story", e.target.value)}
              placeholder="Tell us about your adoption experience..."
              className="min-h-[120px]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" aria-hidden="true" />
              Photo URL (optional)
            </Label>
            <Input
              id="image"
              type="url"
              value={form.image}
              onChange={(e) => handleChange("image", e.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button variant="skyBlue" type="submit" disabled={loading} className="flex-1">
              <Send className="h-4 w-4 mr-2" aria-hidden="true" />
              {loading ? "Submitting..." : "Submit Story"}
            </Button>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading stories">
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

interface EmptyStateProps {
  isLoggedIn: boolean;
  onShowForm: () => void;
}

function EmptyState({ isLoggedIn, onShowForm }: EmptyStateProps) {
  return (
    <Card className="p-12 text-center">
      <Heart className="h-12 w-12 mx-auto text-salmon-300 mb-4" aria-hidden="true" />
      <h2 className="font-capriola text-xl mb-2">No Stories Yet</h2>
      <p className="text-muted-foreground mb-6">
        Be the first to share your adoption story and inspire others!
      </p>
      {isLoggedIn ? (
        <Button variant="salmon" onClick={onShowForm}>
          Share Your Story
        </Button>
      ) : (
        <Button variant="outline" asChild>
          <Link to="/login">Sign in to share your story</Link>
        </Button>
      )}
    </Card>
  );
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * Displays success stories from adopters and allows logged-in users to submit their own.
 */
export default function SuccessStories() {
  const [showForm, setShowForm] = useState(false);

  const { data: userData } = useQuery<UserIdData>(USER_ID);
  const userId = userData?.userId || "";

  const { data, loading, error } = useQuery<SuccessStoriesResponse>(SUCCESS_STORIES);
  const stories = data?.successStories || [];

  const handleFormClose = useCallback(() => setShowForm(false), []);

  return (
    <div className="min-h-screen bg-background col-start-1 col-end-6 row-start-1 row-end-4 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-gradient-to-r from-salmon-300 to-salmon-400 text-white">
        <div className="container-wide py-8 md:py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-capriola text-3xl md:text-4xl mb-2">Success Stories</h1>
              <p className="text-white/90">Heartwarming tales from our adoption community</p>
            </div>
            {userId && !showForm && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-white text-salmon-600 hover:bg-white/90"
              >
                <PenLine className="h-4 w-4 mr-2" aria-hidden="true" />
                Share Your Story
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container-wide py-8">
        {/* Story Form */}
        {showForm && userId && (
          <StoryForm userId={userId} onClose={handleFormClose} onSuccess={handleFormClose} />
        )}

        {/* Stories List */}
        {loading && <LoadingSkeleton />}

        {error && (
          <Card className="p-4 sm:p-8 text-center" role="alert">
            <AlertCircle className="h-8 w-8 mx-auto text-destructive mb-4" />
            <p className="text-destructive">Error loading stories. Please try again later.</p>
          </Card>
        )}

        {!loading && !error && stories.length === 0 && (
          <EmptyState isLoggedIn={!!userId} onShowForm={() => setShowForm(true)} />
        )}

        {!loading && !error && stories.length > 0 && (
          <div className="space-y-6">
            {stories.map((story, idx) => (
              <StoryCard key={story._id} story={story} index={idx} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
