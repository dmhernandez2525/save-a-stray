import React from "react";
import Hero from "./marketing/Hero";
import StatsCounter from "./marketing/StatsCounter";
import FeaturedAnimals from "./marketing/FeaturedAnimals";
import FeatureGrid from "./marketing/FeatureGrid";
import HowItWorks from "./marketing/HowItWorks";
import CTASection from "./marketing/CTASection";
import Footer from "./marketing/Footer";

const Slug: React.FC = () => {
  return (
    <div className="col-start-1 col-end-6 row-start-1 row-end-4 overflow-y-auto bg-background">
      {/* Hero Section */}
      <Hero />

      {/* Stats Counter */}
      <StatsCounter />

      {/* Featured Animals */}
      <FeaturedAnimals />

      {/* How It Works */}
      <HowItWorks />

      {/* Features Grid */}
      <FeatureGrid />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Slug;
