import React, { Component } from "react";
import { withRouter, WithRouterProps } from "../util/withRouter";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Animal, AnimalStatus } from "../types";

const STATUS_STYLES: Record<AnimalStatus, string> = {
  available: "bg-green-500 text-white",
  pending: "bg-yellow-500 text-white",
  adopted: "bg-blue-500 text-white",
};

const STATUS_LABELS: Record<AnimalStatus, string> = {
  available: "Available",
  pending: "Pending",
  adopted: "Adopted",
};

interface AnimalFeedItemProps extends WithRouterProps {
  animal: Animal;
}

class AnimalFeedItem extends Component<AnimalFeedItemProps> {
  constructor(props: AnimalFeedItemProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(id: string) {
    this.props.history.push(`/AnimalShow/${id}`);
  }

  render() {
    const { animal } = this.props;
    const status = animal.status || "available";

    return (
      <Card className="w-[280px] overflow-hidden bg-white hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sky-blue font-capriola text-xl">
              {animal.name}
            </CardTitle>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[status]}`}>
              {STATUS_LABELS[status]}
            </span>
          </div>
          <span className="text-muted-foreground text-sm">
            {animal.breed && `${animal.breed} · `}{animal.age} yrs · {animal.sex}
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div
            className="h-[200px] w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${animal.image})` }}
          />
        </CardContent>
        <CardFooter className="pt-4">
          <Button
            variant="salmon"
            className="w-full"
            onClick={() => this.handleClick(animal._id)}
          >
            See Details
          </Button>
        </CardFooter>
      </Card>
    );
  }
}

export default withRouter(AnimalFeedItem);
