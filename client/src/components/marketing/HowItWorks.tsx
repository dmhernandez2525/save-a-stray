import React from "react";
import { Search, Heart, Home } from "lucide-react";

interface Step {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: <Search className="h-8 w-8" />,
    title: "Browse & Search",
    description: "Explore hundreds of adorable pets from verified local shelters. Filter by species, breed, age, and more to find your ideal companion.",
  },
  {
    number: 2,
    icon: <Heart className="h-8 w-8" />,
    title: "Connect & Apply",
    description: "Found a pet you love? Submit your adoption application directly through our platform. We'll notify the shelter right away.",
  },
  {
    number: 3,
    icon: <Home className="h-8 w-8" />,
    title: "Welcome Home",
    description: "Once approved, visit the shelter to meet your new family member and complete the adoption. Then enjoy your new life together!",
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="section bg-white dark:bg-warm-gray-900">
      <div className="container-wide">
        <div className="text-center mb-16">
          <h2 className="font-capriola text-3xl md:text-4xl text-warm-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-warm-gray-600 dark:text-warm-gray-400 max-w-2xl mx-auto">
            Your journey to finding a furry friend is just three simple steps away.
          </p>
        </div>

        <div className="relative">
          {/* Connection line (desktop only) */}
          <div className="hidden lg:block absolute top-1/2 left-1/4 right-1/4 h-1 bg-gradient-to-r from-sky-blue-300 via-salmon-300 to-success-300 transform -translate-y-1/2 rounded-full" />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Step number circle */}
                <div className="relative mb-6">
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${
                      index === 0
                        ? "bg-gradient-to-br from-sky-blue-400 to-sky-blue-600 text-white"
                        : index === 1
                        ? "bg-gradient-to-br from-salmon-300 to-salmon-500 text-white"
                        : "bg-gradient-to-br from-success-400 to-success-600 text-white"
                    }`}
                  >
                    {step.icon}
                  </div>
                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-warm-gray-800 rounded-full shadow-md flex items-center justify-center">
                    <span className="font-capriola text-warm-gray-900 dark:text-white font-bold">
                      {step.number}
                    </span>
                  </div>
                </div>

                <h3 className="font-capriola text-xl text-warm-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-warm-gray-600 dark:text-warm-gray-400 max-w-xs">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
