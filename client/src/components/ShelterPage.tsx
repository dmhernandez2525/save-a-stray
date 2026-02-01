// ShelterPage - Wrapper component that shows either real ShelterLanding or DemoShelterExperience
import React from "react";
import { useDemo } from "../demo/DemoContext";
import ShelterLanding from "./ShelterLanding";
import DemoShelterExperience from "../demo/DemoShelterExperience";

const ShelterPage: React.FC = () => {
  const { isDemo } = useDemo();

  // In demo mode, show the demo shelter experience
  if (isDemo) {
    return <DemoShelterExperience />;
  }

  // In normal mode, show the real shelter landing
  return <ShelterLanding />;
};

export default ShelterPage;
