import React from "react";
import { Link } from "react-router-dom";
import { Query } from "@apollo/client/react/components";
import { withRouter, WithRouterProps } from "../util/withRouter";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import Queries from "../graphql/queries";
import { FindAnimalsResponse, PlatformStatsResponse, SuccessStoriesResponse } from "../types";

const { FIND_ANIMALS, PLATFORM_STATS, SUCCESS_STORIES } = Queries;

interface SlugProps extends WithRouterProps {}

const Slug: React.FC<SlugProps> = ({ history }) => {
  return (
    <div className="col-start-1 col-end-6 row-start-1 row-end-4 overflow-y-auto">
      {/* Hero Section */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-transparent to-black/20">
        <h1 className="text-sky-blue font-capriola text-5xl md:text-7xl text-center mb-6 animate-fade-in">
          Save Your Stray
        </h1>
        <p className="text-white/90 font-capriola text-xl md:text-2xl text-center max-w-3xl mb-8 leading-relaxed">
          Connecting loving homes with animals in need. Browse adoptable pets from local shelters and find your perfect companion.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            variant="salmon"
            size="lg"
            onClick={() => history.push("/register")}
            className="text-lg px-8 py-6"
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => history.push("/login")}
            className="text-lg px-8 py-6 border-white text-white hover:bg-white/10"
          >
            Sign In
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <Query<PlatformStatsResponse> query={PLATFORM_STATS}>
        {({ data }) => {
          const stats = data?.platformStats;
          if (!stats) return null;

          return (
            <section className="py-12 px-4 bg-black/30">
              <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-sky-blue font-capriola text-4xl md:text-5xl font-bold">
                    {stats.totalAnimals || 0}
                  </p>
                  <p className="text-white/80 font-capriola text-sm md:text-base mt-2">
                    Animals Listed
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-salmon font-capriola text-4xl md:text-5xl font-bold">
                    {stats.adoptedAnimals || 0}
                  </p>
                  <p className="text-white/80 font-capriola text-sm md:text-base mt-2">
                    Successful Adoptions
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sky-blue font-capriola text-4xl md:text-5xl font-bold">
                    {stats.totalShelters || 0}
                  </p>
                  <p className="text-white/80 font-capriola text-sm md:text-base mt-2">
                    Partner Shelters
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-salmon font-capriola text-4xl md:text-5xl font-bold">
                    {stats.totalUsers || 0}
                  </p>
                  <p className="text-white/80 font-capriola text-sm md:text-base mt-2">
                    Happy Users
                  </p>
                </div>
              </div>
            </section>
          );
        }}
      </Query>

      {/* Featured Animals Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-white font-capriola text-3xl md:text-4xl text-center mb-4">
            Meet Our Animals
          </h2>
          <p className="text-white/70 font-capriola text-center mb-10 max-w-2xl mx-auto">
            These adorable pets are looking for their forever homes. Could you be the one?
          </p>

          <Query<FindAnimalsResponse>
            query={FIND_ANIMALS}
            variables={{ limit: 6, status: "available" }}
          >
            {({ loading, error, data }) => {
              if (loading) {
                return (
                  <div className="flex justify-center">
                    <p className="text-white/70 font-capriola animate-pulse">Loading animals...</p>
                  </div>
                );
              }

              if (error || !data?.findAnimals?.length) {
                return (
                  <div className="text-center">
                    <p className="text-white/70 font-capriola">Check back soon for adoptable pets!</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.findAnimals.map((animal) => (
                    <Card
                      key={animal._id}
                      className="bg-white/10 border-none overflow-hidden hover:bg-white/20 transition-all cursor-pointer group"
                      onClick={() => history.push(`/AnimalShow/${animal._id}`)}
                    >
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={animal.image || "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400"}
                          alt={animal.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-white font-capriola text-xl mb-1">{animal.name}</h3>
                        <p className="text-white/70 font-capriola text-sm">
                          {animal.breed} • {animal.type}
                        </p>
                        {animal.age && (
                          <p className="text-white/60 font-capriola text-xs mt-1">
                            {animal.age} {animal.age === 1 ? 'year' : 'years'} old
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              );
            }}
          </Query>

          <div className="text-center mt-10">
            <Button
              variant="outline"
              size="lg"
              onClick={() => history.push("/register")}
              className="border-sky-blue text-sky-blue hover:bg-sky-blue/10"
            >
              View All Animals
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-black/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-white font-capriola text-3xl md:text-4xl text-center mb-12">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-sky-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-sky-blue text-3xl font-bold">1</span>
              </div>
              <h3 className="text-white font-capriola text-xl mb-3">Browse Pets</h3>
              <p className="text-white/70 font-capriola">
                Search through hundreds of dogs, cats, and other animals looking for homes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-salmon/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-salmon text-3xl font-bold">2</span>
              </div>
              <h3 className="text-white font-capriola text-xl mb-3">Apply to Adopt</h3>
              <p className="text-white/70 font-capriola">
                Found your match? Submit an adoption application directly to the shelter.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-sky-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-sky-blue text-3xl font-bold">3</span>
              </div>
              <h3 className="text-white font-capriola text-xl mb-3">Welcome Home</h3>
              <p className="text-white/70 font-capriola">
                Complete the adoption process and bring your new family member home!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <Query<SuccessStoriesResponse> query={SUCCESS_STORIES} variables={{ limit: 3 }}>
        {({ data }) => {
          const stories = data?.successStories;
          if (!stories?.length) return null;

          return (
            <section className="py-16 px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-white font-capriola text-3xl md:text-4xl text-center mb-4">
                  Happy Tails
                </h2>
                <p className="text-white/70 font-capriola text-center mb-10 max-w-2xl mx-auto">
                  Real stories from families who found their perfect companions.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stories.map((story) => (
                    <Card key={story._id} className="bg-white/10 border-none">
                      {story.image && (
                        <div className="aspect-video overflow-hidden rounded-t-lg">
                          <img
                            src={story.image}
                            alt={story.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h3 className="text-white font-capriola text-lg mb-2">{story.title}</h3>
                        <p className="text-white/70 font-capriola text-sm line-clamp-3">
                          {story.story}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="text-center mt-10">
                  <Link
                    to="/success-stories"
                    className="text-sky-blue font-capriola hover:text-salmon transition-colors"
                  >
                    Read More Stories →
                  </Link>
                </div>
              </div>
            </section>
          );
        }}
      </Query>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-transparent to-black/40">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-white font-capriola text-3xl md:text-4xl mb-4">
            Ready to Find Your New Best Friend?
          </h2>
          <p className="text-white/70 font-capriola text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of happy families who have found their perfect pet through Save Your Stray.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              variant="salmon"
              size="lg"
              onClick={() => history.push("/register")}
              className="text-lg px-8 py-6"
            >
              Create Free Account
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => history.push("/newShelter")}
              className="text-lg px-8 py-6 border-white text-white hover:bg-white/10"
            >
              Register Your Shelter
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/10 border-none">
            <CardContent className="p-8">
              <h2 className="text-white font-capriola text-2xl md:text-3xl text-center mb-6">
                About Save Your Stray
              </h2>
              <p className="text-white/80 font-capriola text-lg text-center leading-relaxed">
                Save Your Stray is a non-profit operation with the aim of making it
                easier to rescue and foster abandoned animals. We partner with local
                shelters in order to promote the adoption of animals without a home.
                Every animal deserves love, and every family deserves the joy that
                a pet can bring.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-black/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            <Link to="/privacy" className="text-white/70 font-capriola hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/tos" className="text-white/70 font-capriola hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/success-stories" className="text-white/70 font-capriola hover:text-white transition-colors">
              Success Stories
            </Link>
          </div>
          <p className="text-white/50 font-capriola text-sm text-center">
            © {new Date().getFullYear()} Save Your Stray. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default withRouter(Slug);
