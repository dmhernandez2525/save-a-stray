import React from "react";
import { withRouter, WithRouterProps } from "../util/withRouter";
import { Button } from "./ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import FavoriteButton from "./FavoriteButton";
import { Animal, AnimalStatus } from "../types";
import { Calendar, PawPrint } from "lucide-react";

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

interface AnimalFeedItemProps extends WithRouterProps {
  animal: Animal;
}

const AnimalFeedItem: React.FC<AnimalFeedItemProps> = ({ animal, history }) => {
  const status = animal.status || "available";
  const statusConfig = STATUS_CONFIG[status];

  const handleClick = () => {
    history.push(`/AnimalShow/${animal._id}`);
  };

  return (
    <Card className="w-full sm:w-[300px] overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative">
        <div
          className="h-[220px] w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundImage: `url(${animal.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
          <FavoriteButton animalId={animal._id} />
        </div>
      </div>
      <CardHeader className="pb-2 pt-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sky-blue-600 dark:text-sky-blue-400 font-capriola text-xl">
            {animal.name}
          </CardTitle>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <PawPrint className="h-3.5 w-3.5" />
          <span>{animal.breed || animal.type}</span>
          <span className="text-warm-gray-300">|</span>
          <Calendar className="h-3.5 w-3.5" />
          <span>{animal.age} yrs</span>
          <span className="text-warm-gray-300">|</span>
          <span className="capitalize">{animal.sex}</span>
        </div>
      </CardHeader>
      <CardFooter className="pt-2 pb-4">
        <Button
          variant="salmon"
          className="w-full"
          onClick={handleClick}
        >
          See Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default withRouter(AnimalFeedItem);
