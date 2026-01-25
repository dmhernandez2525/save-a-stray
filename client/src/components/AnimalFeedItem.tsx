import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import FavoriteButton from "./FavoriteButton";
import { Animal, AnimalStatus } from "../types";
import { Calendar, PawPrint } from "lucide-react";

/** Status badge configuration for visual consistency */
const STATUS_CONFIG: Record<AnimalStatus, { label: string; className: string }> = {
  available: {
    label: "Available",
    className: "bg-green-500 hover:bg-green-600 text-white border-0",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-500 hover:bg-amber-600 text-white border-0",
  },
  adopted: {
    label: "Adopted",
    className: "bg-sky-blue-500 hover:bg-sky-blue-600 text-white border-0",
  },
};

/** Fallback image when animal image is missing or fails to load */
const FALLBACK_IMAGE = "/images/placeholder-animal.jpg";

interface AnimalFeedItemProps {
  animal: Animal;
}

/**
 * Displays an animal card in the feed with image, status, and basic info.
 * Used in animal listings and search results.
 */
const AnimalFeedItem: React.FC<AnimalFeedItemProps> = ({ animal }) => {
  const navigate = useNavigate();
  const status = animal.status || "available";
  const statusConfig = STATUS_CONFIG[status];

  const handleViewDetails = () => {
    navigate(`/AnimalShow/${animal._id}`);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  const animalDescription = `${animal.breed || animal.type}, ${animal.age} years old, ${animal.sex}`;

  return (
    <Card className="w-full sm:w-[300px] overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Image Container */}
      <div className="relative h-[220px] overflow-hidden">
        <img
          src={animal.image || FALLBACK_IMAGE}
          alt={`${animal.name} - ${animalDescription}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={handleImageError}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
          <FavoriteButton animalId={animal._id} />
        </div>
      </div>

      {/* Content */}
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-sky-blue-600 dark:text-sky-blue-400 font-capriola text-xl">
          {animal.name}
        </CardTitle>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <PawPrint className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{animal.breed || animal.type}</span>
          <span className="text-warm-gray-300" aria-hidden="true">|</span>
          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{animal.age} yrs</span>
          <span className="text-warm-gray-300" aria-hidden="true">|</span>
          <span className="capitalize">{animal.sex}</span>
        </div>
      </CardHeader>

      <CardFooter className="pt-2 pb-4">
        <Button
          variant="salmon"
          className="w-full"
          onClick={handleViewDetails}
          aria-label={`View details for ${animal.name}`}
        >
          See Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AnimalFeedItem;
