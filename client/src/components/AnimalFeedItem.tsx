import React, { Component } from "react";
import { withRouter, WithRouterProps } from "../util/withRouter";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Animal } from "../types";

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

    return (
      <Card className="w-[280px] overflow-hidden bg-white hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sky-blue font-capriola text-xl">
              {animal.name}
            </CardTitle>
            <span className="text-muted-foreground text-sm">
              {animal.age} yrs | {animal.sex}
            </span>
          </div>
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
