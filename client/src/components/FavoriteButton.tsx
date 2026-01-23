import React from "react";
import { useQuery, useMutation } from "@apollo/client";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";
import { UserIdData } from "../types";

const { USER_ID, USER_FAVORITE_IDS } = Queries;
const { ADD_FAVORITE, REMOVE_FAVORITE } = Mutations;

interface FavoriteButtonProps {
  animalId: string;
}

interface UserFavoriteIdsResponse {
  user: {
    _id: string;
    favoriteIds: string[];
  } | null;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ animalId }) => {
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
      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isFavorited ? "#ef4444" : "none"}
        stroke={isFavorited ? "#ef4444" : "#9ca3af"}
        strokeWidth={2}
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
};

export default FavoriteButton;
