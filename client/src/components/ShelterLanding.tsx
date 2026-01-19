import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Shelter } from "../types";

interface ShelterLandingProps {
  shelterInfo?: Shelter;
}

class ShelterLanding extends Component<ShelterLandingProps> {
  render() {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <Card className="w-full max-w-md bg-white">
          <CardHeader>
            <CardTitle className="text-sky-blue font-capriola text-2xl text-center">
              Let us help you find owners for your animals!
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="salmon" size="lg" asChild>
              <Link to="/newAnimal">Add New Animal</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default ShelterLanding;
