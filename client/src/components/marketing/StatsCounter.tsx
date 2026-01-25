import React from "react";
import { Query } from "@apollo/client/react/components";
import Queries from "@/graphql/queries";
import { PlatformStatsResponse } from "@/types";
import { Heart, Home, Users, PawPrint } from "lucide-react";

const { PLATFORM_STATS } = Queries;

interface StatItem {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}

const StatsCounter: React.FC = () => {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-sky-blue-600 to-sky-blue-700" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="container-wide relative z-10">
        <Query<PlatformStatsResponse> query={PLATFORM_STATS}>
          {({ data }) => {
            const stats = data?.platformStats;

            const statItems: StatItem[] = [
              {
                icon: <PawPrint className="h-8 w-8" />,
                value: stats?.totalAnimals || 1000,
                label: "Pets Available",
                color: "text-white",
              },
              {
                icon: <Heart className="h-8 w-8" />,
                value: stats?.adoptedAnimals || 500,
                label: "Happy Adoptions",
                color: "text-salmon-300",
              },
              {
                icon: <Home className="h-8 w-8" />,
                value: stats?.totalShelters || 50,
                label: "Partner Shelters",
                color: "text-white",
              },
              {
                icon: <Users className="h-8 w-8" />,
                value: stats?.totalUsers || 5000,
                label: "Community Members",
                color: "text-salmon-300",
              },
            ];

            return (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {statItems.map((stat, index) => (
                  <div
                    key={index}
                    className="text-center animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`inline-flex items-center justify-center mb-4 ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <div className="font-capriola text-4xl md:text-5xl text-white mb-2">
                      {stat.value.toLocaleString()}+
                    </div>
                    <div className="text-sky-blue-100 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            );
          }}
        </Query>
      </div>
    </section>
  );
};

export default StatsCounter;
