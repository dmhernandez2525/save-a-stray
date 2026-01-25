import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Search, FileCheck, Heart, Shield, Users, Sparkles } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "skyBlue" | "salmon" | "gold" | "success";
}

const features: Feature[] = [
  {
    icon: <Search className="h-6 w-6" />,
    title: "Smart Search",
    description: "Find your perfect match with filters for breed, age, size, and personality traits.",
    color: "skyBlue",
  },
  {
    icon: <FileCheck className="h-6 w-6" />,
    title: "Easy Applications",
    description: "Simple online applications that go directly to shelters. Track your status in real-time.",
    color: "salmon",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Verified Shelters",
    description: "All partner shelters are vetted to ensure the best care for every animal.",
    color: "success",
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Success Stories",
    description: "Join thousands of happy families who found their companions through our platform.",
    color: "salmon",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Community Support",
    description: "Connect with other pet parents, share tips, and celebrate adoption milestones.",
    color: "skyBlue",
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "Perfect Match Quiz",
    description: "Take our compatibility quiz to find animals that match your lifestyle.",
    color: "gold",
  },
];

const colorClasses = {
  skyBlue: {
    bg: "bg-sky-blue-100 dark:bg-sky-blue-900/30",
    text: "text-sky-blue-600 dark:text-sky-blue-400",
  },
  salmon: {
    bg: "bg-salmon-100 dark:bg-salmon-900/30",
    text: "text-salmon-600 dark:text-salmon-400",
  },
  gold: {
    bg: "bg-gold-100 dark:bg-gold-900/30",
    text: "text-gold-600 dark:text-gold-400",
  },
  success: {
    bg: "bg-success-100 dark:bg-success-900/30",
    text: "text-success-600 dark:text-success-400",
  },
};

const FeatureGrid: React.FC = () => {
  return (
    <section className="section bg-warm-gray-50 dark:bg-warm-gray-900/50">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h2 className="font-capriola text-3xl md:text-4xl text-warm-gray-900 dark:text-white mb-4">
            Why Choose Save Your Stray?
          </h2>
          <p className="text-lg text-warm-gray-600 dark:text-warm-gray-400 max-w-2xl mx-auto">
            We make the adoption journey simple, transparent, and joyful for both families and shelters.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              variant="elevated"
              className="group hover:scale-[1.02] transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div
                  className={`w-12 h-12 rounded-xl ${colorClasses[feature.color].bg} ${colorClasses[feature.color].text} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="font-capriola text-xl text-warm-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-warm-gray-600 dark:text-warm-gray-400">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
