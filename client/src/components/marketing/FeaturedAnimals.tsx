import React from "react";
import { useNavigate } from "react-router-dom";
import { Query } from "@apollo/client/react/components";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Queries from "@/graphql/queries";
import { FindAnimalsResponse } from "@/types";
import { ArrowRight, Heart } from "lucide-react";

const { FIND_ANIMALS } = Queries;

const FeaturedAnimals: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="section bg-warm-gray-50 dark:bg-warm-gray-900/50">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h2 className="font-capriola text-3xl md:text-4xl text-warm-gray-900 dark:text-white mb-2">
              Meet Our Animals
            </h2>
            <p className="text-warm-gray-600 dark:text-warm-gray-400">
              These adorable pets are looking for their forever homes
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/register")}
            className="group"
          >
            View All
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        <Query<FindAnimalsResponse>
          query={FIND_ANIMALS}
          variables={{ limit: 6, status: "available" }}
        >
          {({ loading, error, data }) => {
            if (loading) {
              return (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-64 w-full" />
                      <CardContent className="p-4">
                        <Skeleton className="h-6 w-24 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              );
            }

            if (error || !data?.findAnimals?.length) {
              return (
                <div className="text-center py-12">
                  <p className="text-warm-gray-500 dark:text-warm-gray-400">
                    Check back soon for adorable pets looking for homes!
                  </p>
                </div>
              );
            }

            return (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.findAnimals.map((animal, index) => (
                  <Card
                    key={animal._id}
                    variant="interactive"
                    className="overflow-hidden group animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => navigate(`/AnimalShow/${animal._id}`)}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={animal.image || `https://images.unsplash.com/photo-${animal.type === 'Dog' ? '1587300003388-59208cc962cb' : '1514888286974-6c03e2ca1dba'}?w=400&h=300&fit=crop`}
                        alt={animal.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-warm-gray-900/60 via-transparent to-transparent" />

                      {/* Status badge */}
                      <Badge
                        variant="success"
                        className="absolute top-4 left-4"
                      >
                        Available
                      </Badge>

                      {/* Favorite button */}
                      <button
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 dark:bg-warm-gray-800/90 flex items-center justify-center text-warm-gray-400 hover:text-salmon-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Favorite logic would go here
                        }}
                      >
                        <Heart className="h-5 w-5" />
                      </button>

                      {/* Name overlay */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="font-capriola text-2xl text-white mb-1">
                          {animal.name}
                        </h3>
                        <p className="text-white/80 text-sm">
                          {animal.breed} • {animal.type}
                        </p>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-warm-gray-500 dark:text-warm-gray-400">
                          {animal.age && (
                            <span>{animal.age} {animal.age === 1 ? 'year' : 'years'} old</span>
                          )}
                          {animal.sex && (
                            <span className="capitalize">{animal.sex}</span>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="text-sky-blue-500">
                          Learn More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          }}
        </Query>
      </div>
    </section>
  );
};

export default FeaturedAnimals;
