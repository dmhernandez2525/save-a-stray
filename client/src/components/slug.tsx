import React from "react";
import { Link } from "react-router-dom";
import { withRouter, WithRouterProps } from "../util/withRouter";
import { Card, CardContent } from "./ui/card";

interface SlugProps extends WithRouterProps {}

const Slug: React.FC<SlugProps> = () => {
  return (
    <div className="col-start-2 col-end-5 row-start-2 flex flex-col items-center justify-center p-8">
      <Link to="/" className="no-underline mb-8">
        <h1 className="text-sky-blue font-capriola text-5xl md:text-7xl hover:text-salmon transition-colors">
          Save Your Stray
        </h1>
      </Link>
      <Card className="bg-white/10 border-none max-w-2xl">
        <CardContent className="p-6">
          <p className="text-white font-capriola text-lg md:text-xl text-center leading-relaxed">
            Save Your Stray is a non-profit operation with the aim of making it
            easier to rescue and foster abandoned animals. We partner with local
            shelters in order to promote the adoption of animals without a home.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default withRouter(Slug);
