import React from "react";
import { useQuery, useMutation } from "@apollo/client";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";
import { UserIdData } from "../types";
import { Heart } from "lucide-react";

const { USER_ID, USER_FAVORITE_IDS } = Queries;
const { ADD_FAVORITE, REMOVE_FAVORITE } = Mutations;

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

const SIZES = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const BUTTON_SIZES = {
  sm: "p-1.5",
  md: "p-2",
  lg: "p-2.5",
};

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ animalId, size = "md" }) => {
  const { data: userIdData } = useQuery<UserIdData>(USER_ID);
  const userId = userIdData?.userId;

  const { data: favData } = useQuery<UserFavoriteIdsResponse>(USER_FAVORITE_IDS, {
    variables: { _id: userId },
    skip: !userId,
  });

  const [addFavorite] = useMutation(ADD_FAVORITE, {
    refetchQueries: [{ query: USER_FAVORITE_IDS, variables: { _id: userId } }],
  });

  const [removeFavorite] = useMutation(REMOVE_FAVORITE, {
    refetchQueries: [{ query: USER_FAVORITE_IDS, variables: { _id: userId } }],
  });

  if (!userId) return null;

  const isFavorited = favData?.user?.favoriteIds?.includes(animalId) || false;

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorited) {
      removeFavorite({ variables: { userId, animalId } });
    } else {
      addFavorite({ variables: { userId, animalId } });
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`${BUTTON_SIZES[size]} rounded-full bg-white/90 dark:bg-warm-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-warm-gray-700 transition-all shadow-sm hover:shadow-md hover:scale-110 active:scale-95`}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`${SIZES[size]} transition-colors ${
          isFavorited
            ? "fill-salmon-500 text-salmon-500"
            : "text-warm-gray-400 hover:text-salmon-400"
        }`}
      />
    </button>
  );
};

export default FavoriteButton;
