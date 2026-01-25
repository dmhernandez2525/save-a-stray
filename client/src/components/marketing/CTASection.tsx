import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PawPrint, ArrowRight } from "lucide-react";

const CTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="section bg-white dark:bg-warm-gray-900">
      <div className="container-tight">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-salmon-400 to-salmon-500 p-8 md:p-12 lg:p-16">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/4" />

          {/* Floating paw prints */}
          <PawPrint className="absolute top-8 right-8 h-12 w-12 text-white/20 rotate-12" />
          <PawPrint className="absolute bottom-8 left-8 h-8 w-8 text-white/20 -rotate-12" />

          <div className="relative z-10 text-center">
            <h2 className="font-capriola text-3xl md:text-4xl lg:text-5xl text-white mb-4">
              Ready to Find Your New Best Friend?
            </h2>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Thousands of loving animals are waiting to meet you. Start your adoption journey today and change a life forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="xl"
                onClick={() => navigate("/register")}
                className="bg-white text-salmon-600 hover:bg-warm-gray-100 font-semibold group"
              >
                Start Browsing
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={() => navigate("/quiz")}
                className="border-white text-white hover:bg-white/10"
              >
                Take the Match Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
