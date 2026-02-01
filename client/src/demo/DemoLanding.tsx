// Demo Landing Page - Entry point for demo mode
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  PawPrint,
  Building2,
  Heart,
  ClipboardList,
  Users,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const DemoLanding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background col-start-1 col-end-6 row-start-1 row-end-4 overflow-y-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-blue-50 via-white to-salmon-50 dark:from-warm-gray-900 dark:via-warm-gray-900 dark:to-warm-gray-800" />

        <div className="container-wide relative z-10 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-sky-blue-100 dark:bg-sky-blue-900/30 text-sky-blue-700 dark:text-sky-blue-300 border-0">
              <Sparkles className="h-3 w-3 mr-1" />
              Demo Mode
            </Badge>

            <h1 className="font-capriola text-4xl md:text-5xl text-warm-gray-900 dark:text-white mb-6">
              Experience Save Your Stray
            </h1>

            <p className="text-lg text-warm-gray-600 dark:text-warm-gray-300 mb-8 max-w-2xl mx-auto">
              Explore our platform without creating an account. See how easy it is to find your perfect pet or manage your shelter's operations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="skyBlue"
                size="xl"
                onClick={() => navigate("/demo/adopter")}
                className="group"
              >
                <Heart className="h-5 w-5 mr-2" />
                Browse as an Adopter
                <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="salmon"
                size="xl"
                onClick={() => navigate("/demo/shelter")}
                className="group"
              >
                <Building2 className="h-5 w-5 mr-2" />
                View as a Shelter
                <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-16 bg-warm-gray-50 dark:bg-warm-gray-900/50">
        <div className="container-wide">
          <h2 className="font-capriola text-3xl text-center text-warm-gray-900 dark:text-white mb-12">
            What You Can Explore
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Adopter Features */}
            <Card className="overflow-hidden border-2 border-sky-blue-200 dark:border-sky-blue-800">
              <CardHeader className="bg-sky-blue-50 dark:bg-sky-blue-900/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-sky-blue-100 dark:bg-sky-blue-900/50 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-sky-blue-600 dark:text-sky-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-sky-blue-700 dark:text-sky-blue-300">
                      Adopter Experience
                    </CardTitle>
                    <CardDescription>Find your perfect companion</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  <FeatureItem icon={PawPrint} text="Browse 8 adorable pets looking for homes" />
                  <FeatureItem icon={ClipboardList} text="See the adoption application process" />
                  <FeatureItem icon={Heart} text="View detailed pet profiles with photos" />
                  <FeatureItem icon={Building2} text="Learn about the shelter and contact info" />
                </ul>
                <Button
                  variant="outline"
                  className="w-full mt-6 border-sky-blue-300 text-sky-blue-600 hover:bg-sky-blue-50"
                  onClick={() => navigate("/demo/adopter")}
                >
                  Try Adopter View
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Shelter Features */}
            <Card className="overflow-hidden border-2 border-salmon-200 dark:border-salmon-800">
              <CardHeader className="bg-salmon-50 dark:bg-salmon-900/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-salmon-100 dark:bg-salmon-900/50 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-salmon-600 dark:text-salmon-400" />
                  </div>
                  <div>
                    <CardTitle className="text-salmon-700 dark:text-salmon-300">
                      Shelter Dashboard
                    </CardTitle>
                    <CardDescription>Manage your rescue operations</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  <FeatureItem icon={PawPrint} text="Manage animal listings and statuses" />
                  <FeatureItem icon={ClipboardList} text="Review and process applications" />
                  <FeatureItem icon={Users} text="Track volunteers, fosters, and staff" />
                  <FeatureItem icon={BarChart3} text="View analytics and activity feed" />
                </ul>
                <Button
                  variant="outline"
                  className="w-full mt-6 border-salmon-300 text-salmon-600 hover:bg-salmon-50"
                  onClick={() => navigate("/demo/shelter")}
                >
                  Try Shelter View
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Data Info */}
      <section className="py-16">
        <div className="container-wide">
          <Card className="bg-gradient-to-r from-gold-50 to-gold-100 dark:from-gold-900/20 dark:to-gold-800/20 border-gold-200 dark:border-gold-800">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-gold-200 dark:bg-gold-800 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-8 w-8 text-gold-600 dark:text-gold-400" />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="font-capriola text-xl text-warm-gray-900 dark:text-white mb-2">
                    Sample Data Included
                  </h3>
                  <p className="text-warm-gray-600 dark:text-warm-gray-300">
                    This demo includes realistic sample data featuring pets, applications, donations, and more.
                    All data is stored locally in your browser and resets when you refresh. No account needed!
                  </p>
                </div>
                <Button
                  variant="default"
                  className="bg-gold-500 hover:bg-gold-600 text-white flex-shrink-0"
                  onClick={() => navigate("/demo/adopter")}
                >
                  Start Exploring
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-sky-blue-500 to-sky-blue-600">
        <div className="container-wide text-center">
          <h2 className="font-capriola text-3xl text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            After exploring the demo, create an account to find your new best friend or register your shelter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              size="lg"
              className="bg-white text-sky-blue-600 border-white hover:bg-white/90"
              onClick={() => navigate("/register")}
            >
              Create Account
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

// Feature Item component
interface FeatureItemProps {
  icon: React.FC<{ className?: string }>;
  text: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon: Icon, text }) => (
  <li className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-warm-gray-100 dark:bg-warm-gray-800 flex items-center justify-center flex-shrink-0">
      <Icon className="h-4 w-4 text-warm-gray-600 dark:text-warm-gray-400" />
    </div>
    <span className="text-warm-gray-700 dark:text-warm-gray-300">{text}</span>
  </li>
);

export default DemoLanding;
