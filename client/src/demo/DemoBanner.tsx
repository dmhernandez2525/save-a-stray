// Demo Banner - Shown at top of pages when in demo mode
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useDemo } from "./DemoContext";
import { Sparkles, X } from "lucide-react";

interface DemoBannerProps {
  variant?: "adopter" | "shelter";
}

const DemoBanner: React.FC<DemoBannerProps> = ({ variant = "adopter" }) => {
  const navigate = useNavigate();
  const { isDemo, currentDemoUser, exitDemoMode } = useDemo();

  if (!isDemo) {
    return null;
  }

  const handleExit = () => {
    exitDemoMode();
    navigate("/");
  };

  const bgColor = variant === "shelter" ? "bg-salmon-500" : "bg-sky-blue-500";

  return (
    <div className={`${bgColor} text-white px-4 py-2 flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-medium">
          Demo Mode: Browsing as {currentDemoUser?.displayName || (variant === "shelter" ? "Shelter Staff" : "Adopter")}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-white hover:text-white hover:bg-white/20"
        onClick={handleExit}
      >
        <X className="h-4 w-4 mr-1" />
        Exit Demo
      </Button>
    </div>
  );
};

export default DemoBanner;
