import { useQuery, useMutation } from "@apollo/client";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";
import { UserIdData } from "../types";
import { Heart, Loader2 } from "lucide-react";

const { USER_ID, USER_FAVORITE_IDS } = Queries;
const { ADD_FAVORITE, REMOVE_FAVORITE } = Mutations;

// =============================================================================
// Types
// =============================================================================

interface FavoriteButtonProps {
  animalId: string;
  size?: "sm" | "md" | "lg";
}

interface UserFavoriteIdsResponse {
  user: {
    _id: string;
    favoriteIds: string[];
  } | null;
}

// =============================================================================
// Constants
// =============================================================================

const ICON_SIZES = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
} as const;

const BUTTON_SIZES = {
  sm: "p-1.5",
  md: "p-2",
  lg: "p-2.5",
} as const;

// =============================================================================
// Component
// =============================================================================

/**
 * Heart button to add/remove animals from user's favorites.
 * Only renders when user is logged in.
 */
export default function FavoriteButton({ animalId, size = "md" }: FavoriteButtonProps) {
  const { data: userIdData } = useQuery<UserIdData>(USER_ID);
  const userId = userIdData?.userId;

  const { data: favData } = useQuery<UserFavoriteIdsResponse>(USER_FAVORITE_IDS, {
    variables: { _id: userId },
    skip: !userId,
  });

  const [addFavorite, { loading: addLoading }] = useMutation(ADD_FAVORITE, {
    variables: { userId, animalId },
    optimisticResponse: {
      addFavorite: {
        __typename: "User",
        _id: userId,
        favoriteIds: [...(favData?.user?.favoriteIds || []), animalId],
      },
    },
    update(cache, { data }) {
      cache.writeQuery({
        query: USER_FAVORITE_IDS,
        variables: { _id: userId },
        data: { user: data?.addFavorite },
      });
    },
    onError: (error) => {
      console.error("Failed to add favorite:", error.message);
    },
  });

  const [removeFavorite, { loading: removeLoading }] = useMutation(REMOVE_FAVORITE, {
    variables: { userId, animalId },
    optimisticResponse: {
      removeFavorite: {
        __typename: "User",
        _id: userId,
        favoriteIds: (favData?.user?.favoriteIds || []).filter((id) => id !== animalId),
      },
    },
    update(cache, { data }) {
      cache.writeQuery({
        query: USER_FAVORITE_IDS,
        variables: { _id: userId },
        data: { user: data?.removeFavorite },
      });
    },
    onError: (error) => {
      console.error("Failed to remove favorite:", error.message);
    },
  });

  // Don't render if user is not logged in
  if (!userId) return null;

  const isFavorited = favData?.user?.favoriteIds?.includes(animalId) ?? false;
  const isLoading = addLoading || removeLoading;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isLoading) return;

    if (isFavorited) {
      removeFavorite();
    } else {
      addFavorite();
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      className={`${BUTTON_SIZES[size]} rounded-full bg-white/90 dark:bg-warm-gray-800/90 backdrop-blur-sm
        hover:bg-white dark:hover:bg-warm-gray-700 transition-all shadow-sm hover:shadow-md
        hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorited}
    >
      {isLoading ? (
        <Loader2 className={`${ICON_SIZES[size]} animate-spin text-warm-gray-400`} />
      ) : (
        <Heart
          className={`${ICON_SIZES[size]} transition-colors ${
            isFavorited
              ? "fill-salmon-500 text-salmon-500"
              : "text-warm-gray-400 hover:text-salmon-400"
          }`}
          aria-hidden="true"
        />
      )}
    </button>
  );
}
