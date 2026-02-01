// Demo Adopter Experience - Pet browsing and adoption flow
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDemo } from "./DemoContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  PawPrint,
  Search,
  Heart,
  MapPin,
  Calendar,
  ArrowLeft,
  X,
  Sparkles,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Animal } from "../types";

const DemoAdopterExperience: React.FC = () => {
  const navigate = useNavigate();
  const { animals, shelter, currentDemoUser, exitDemoMode, addApplication } = useDemo();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  // Filter animals
  const filteredAnimals = animals.filter((animal) => {
    const matchesSearch =
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.breed?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || animal.type === typeFilter;
    const isAvailable = animal.status === "available";
    return matchesSearch && matchesType && isAvailable;
  });

  const handleApply = () => {
    if (selectedAnimal) {
      addApplication({
        animalId: selectedAnimal._id,
        applicationData: JSON.stringify({
          demoApplication: true,
          applicantName: currentDemoUser?.name || "Demo Adopter",
          submittedAt: new Date().toISOString(),
        }),
      });
      setShowApplicationDialog(false);
      setApplicationSubmitted(true);
      setTimeout(() => setApplicationSubmitted(false), 3000);
    }
  };

  const handleExit = () => {
    exitDemoMode();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background col-start-1 col-end-6 row-start-1 row-end-4 overflow-y-auto">
      {/* Demo Banner */}
      <div className="bg-sky-blue-500 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">
            Demo Mode: Browsing as {currentDemoUser?.displayName || "Adopter"}
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

      {/* Success Toast */}
      {applicationSubmitted && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right">
          <CheckCircle2 className="h-5 w-5" />
          Application submitted successfully!
        </div>
      )}

      {/* Header */}
      <header className="border-b bg-card">
        <div className="container-wide py-6">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/demo")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Demo
            </Button>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-capriola text-3xl text-foreground">
                Find Your Perfect Pet
              </h1>
              <p className="text-muted-foreground mt-1">
                Browse {filteredAnimals.length} adorable pets looking for homes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sky-blue-600">
                <MapPin className="h-3 w-3 mr-1" />
                {shelter.location}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="border-b bg-muted/30">
        <div className="container-wide py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or breed..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Animal Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Animals</SelectItem>
                <SelectItem value="Dogs">Dogs</SelectItem>
                <SelectItem value="Cats">Cats</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Animals Grid */}
      <main className="container-wide py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAnimals.map((animal) => (
            <Card
              key={animal._id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedAnimal(animal)}
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={animal.image}
                  alt={animal.name}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-3 right-3 bg-green-500">
                  Available
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{animal.name}</h3>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {animal.breed || animal.type} - {animal.sex}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {animal.age} {animal.age === 1 ? "year" : "years"} old
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAnimals.length === 0 && (
          <div className="text-center py-12">
            <PawPrint className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No pets found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search filters
            </p>
          </div>
        )}
      </main>

      {/* Animal Detail Dialog */}
      <Dialog
        open={selectedAnimal !== null && !showApplicationDialog}
        onOpenChange={(open) => !open && setSelectedAnimal(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedAnimal && (
            <>
              <div className="aspect-video relative overflow-hidden rounded-lg">
                <img
                  src={selectedAnimal.image}
                  alt={selectedAnimal.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl font-capriola">
                    {selectedAnimal.name}
                  </DialogTitle>
                  <Badge
                    className={
                      selectedAnimal.status === "available"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }
                  >
                    {selectedAnimal.status}
                  </Badge>
                </div>
                <DialogDescription className="text-base">
                  {selectedAnimal.breed} - {selectedAnimal.age}{" "}
                  {selectedAnimal.age === 1 ? "year" : "years"} old -{" "}
                  {selectedAnimal.sex}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">About {selectedAnimal.name}</h4>
                  <p className="text-muted-foreground">
                    {selectedAnimal.description}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Shelter Information</h4>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {shelter.name} - {shelter.location}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="skyBlue"
                    className="flex-1"
                    onClick={() => setShowApplicationDialog(true)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Start Application
                  </Button>
                  <Button variant="outline">
                    <Heart className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Application Dialog */}
      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply to Adopt {selectedAnimal?.name}</DialogTitle>
            <DialogDescription>
              In demo mode, this simulates the application process.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                In a real application, you would fill out:
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Personal information
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Housing details
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Pet experience
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  References
                </li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowApplicationDialog(false)}
              >
                Cancel
              </Button>
              <Button variant="skyBlue" className="flex-1" onClick={handleApply}>
                Submit Demo Application
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DemoAdopterExperience;
