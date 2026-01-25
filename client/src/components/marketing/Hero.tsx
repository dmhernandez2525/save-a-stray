import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, PawPrint, Sparkles } from "lucide-react";

const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-blue-50 via-white to-salmon-50 dark:from-warm-gray-900 dark:via-warm-gray-900 dark:to-warm-gray-800" />

      {/* Decorative floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-sky-blue-200/30 rounded-full blur-2xl animate-bounce-soft" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-salmon-200/30 rounded-full blur-2xl animate-bounce-soft" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gold-200/30 rounded-full blur-2xl animate-bounce-soft" style={{ animationDelay: '0.5s' }} />

      {/* Floating paw prints */}
      <div className="absolute top-1/4 right-1/4 text-sky-blue-200/40 dark:text-sky-blue-800/30 animate-float">
        <PawPrint className="h-12 w-12 rotate-12" />
      </div>
      <div className="absolute bottom-1/3 left-1/5 text-salmon-200/40 dark:text-salmon-800/30 animate-float" style={{ animationDelay: '0.7s' }}>
        <PawPrint className="h-8 w-8 -rotate-12" />
      </div>

      <div className="container-wide relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-sky-blue-100 dark:bg-sky-blue-900/30 text-sky-blue-700 dark:text-sky-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in-down">
              <Sparkles className="h-4 w-4" />
              <span>Find your perfect companion today</span>
            </div>

            <h1 className="font-capriola text-4xl md:text-5xl lg:text-6xl text-warm-gray-900 dark:text-white mb-6 animate-fade-in-up leading-tight">
              Every Pet Deserves a{" "}
              <span className="text-gradient">Loving Home</span>
            </h1>

            <p className="text-lg md:text-xl text-warm-gray-600 dark:text-warm-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
              Connect with local shelters and discover dogs, cats, and other wonderful animals waiting to become part of your family.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Button
                variant="skyBlue"
                size="xl"
                onClick={() => navigate("/register")}
                className="group"
              >
                Find Your Match
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={() => navigate("/newShelter")}
                className="border-warm-gray-300 dark:border-warm-gray-600"
              >
                I'm a Shelter
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center gap-6 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2 text-warm-gray-500 dark:text-warm-gray-400">
                <Heart className="h-5 w-5 text-salmon-400 fill-salmon-400" />
                <span className="text-sm">100% Free for Adopters</span>
              </div>
              <div className="flex items-center gap-2 text-warm-gray-500 dark:text-warm-gray-400">
                <PawPrint className="h-5 w-5 text-sky-blue-400" />
                <span className="text-sm">Verified Shelters Only</span>
              </div>
            </div>
          </div>

          {/* Image/Illustration Side */}
          <div className="relative hidden lg:block animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="relative">
              {/* Main image container */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=700&fit=crop"
                  alt="Happy dog looking for a home"
                  className="w-full h-[500px] object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-warm-gray-900/40 to-transparent" />
              </div>

              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-warm-gray-800 rounded-2xl shadow-card p-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-success-500 fill-success-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-warm-gray-900 dark:text-white">500+ Adoptions</p>
                    <p className="text-sm text-warm-gray-500">This month alone</p>
                  </div>
                </div>
              </div>

              {/* Another floating element */}
              <div className="absolute -top-4 -right-4 bg-white dark:bg-warm-gray-800 rounded-2xl shadow-card p-3 animate-fade-in-down" style={{ animationDelay: '0.7s' }}>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-sky-blue-400 flex items-center justify-center text-white text-xs font-bold">D</div>
                    <div className="w-8 h-8 rounded-full bg-salmon-400 flex items-center justify-center text-white text-xs font-bold">C</div>
                    <div className="w-8 h-8 rounded-full bg-gold-400 flex items-center justify-center text-white text-xs font-bold">B</div>
                  </div>
                  <span className="text-sm text-warm-gray-600 dark:text-warm-gray-300">1000+ pets</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
