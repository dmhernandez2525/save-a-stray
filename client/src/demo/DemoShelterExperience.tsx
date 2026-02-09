// Demo Shelter Experience - Dashboard and management view
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDemo } from "./DemoContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  PawPrint,
  ClipboardList,
  Users,
  BarChart3,
  DollarSign,
  Calendar,
  ArrowLeft,
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  TrendingUp,
  Heart,
} from "lucide-react";
import { Animal, Application, ApplicationStatus } from "../types";

const DemoShelterExperience: React.FC = () => {
  const navigate = useNavigate();
  const {
    animals,
    applications,
    shelter,
    analytics,
    donations,
    volunteers,
    events,
    activityLog,
    currentDemoUser,
    exitDemoMode,
    updateAnimalStatus,
    updateApplicationStatus,
  } = useDemo();

  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [statusUpdated, setStatusUpdated] = useState(false);

  const handleExit = () => {
    exitDemoMode();
    navigate("/");
  };

  const handleUpdateApplicationStatus = (status: ApplicationStatus) => {
    if (selectedApplication) {
      updateApplicationStatus(selectedApplication._id, status);
      setSelectedApplication(null);
      setStatusUpdated(true);
      setTimeout(() => setStatusUpdated(false), 3000);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const configs: Record<ApplicationStatus, { color: string; icon: React.ReactNode }> = {
      submitted: { color: "bg-blue-500", icon: <Clock className="h-3 w-3" /> },
      under_review: { color: "bg-yellow-500", icon: <ClipboardList className="h-3 w-3" /> },
      approved: { color: "bg-green-500", icon: <CheckCircle2 className="h-3 w-3" /> },
      rejected: { color: "bg-red-500", icon: <XCircle className="h-3 w-3" /> },
    };
    const config = configs[status];
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const isAdmin = currentDemoUser?.demoRole === "shelter_admin";

  return (
    <div className="min-h-screen bg-background col-start-1 col-end-6 row-start-1 row-end-4 overflow-y-auto pb-20 md:pb-0">
      {/* Demo Banner */}
      <div className="bg-salmon-500 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">
            Demo Mode: {currentDemoUser?.displayName || "Shelter Staff"}
          </span>
          {isAdmin && (
            <Badge variant="outline" className="border-white/50 text-white text-xs">
              Admin
            </Badge>
          )}
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
      {statusUpdated && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right">
          <CheckCircle2 className="h-5 w-5" />
          Status updated successfully!
        </div>
      )}

      {/* Header */}
      <header className="border-b bg-card">
        <div className="container-wide py-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-salmon-100 dark:bg-salmon-900/30 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-salmon-600" />
            </div>
            <div>
              <h1 className="font-capriola text-2xl text-foreground">
                {shelter.name}
              </h1>
              <p className="text-muted-foreground">{shelter.location}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="border-b bg-muted/30">
        <div className="container-wide py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-blue-100 dark:bg-sky-blue-900/30 flex items-center justify-center">
                  <PawPrint className="h-5 w-5 text-sky-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.totalAnimals}</p>
                  <p className="text-xs text-muted-foreground">Total Animals</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.adoptedAnimals}</p>
                  <p className="text-xs text-muted-foreground">Adopted</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.totalApplications}</p>
                  <p className="text-xs text-muted-foreground">Applications</p>
                </div>
              </CardContent>
            </Card>
            {isAdmin && (
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-gold-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">${analytics.donationTotal}</p>
                    <p className="text-xs text-muted-foreground">Donations</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container-wide py-8">
        <Tabs defaultValue="animals">
          <TabsList className="mb-6">
            <TabsTrigger value="animals">
              <PawPrint className="h-4 w-4 mr-2" />
              Animals
            </TabsTrigger>
            <TabsTrigger value="applications">
              <ClipboardList className="h-4 w-4 mr-2" />
              Applications
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="team">
                  <Users className="h-4 w-4 mr-2" />
                  Team
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Animals Tab */}
          <TabsContent value="animals">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {animals.map((animal) => (
                <Card key={animal._id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={animal.image}
                        alt={animal.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold">{animal.name}</h3>
                          <Badge
                            className={
                              animal.status === "available"
                                ? "bg-green-500"
                                : animal.status === "pending"
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                            }
                          >
                            {animal.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {animal.breed} - {animal.age}y
                        </p>
                        <Select
                          value={animal.status}
                          onValueChange={(value) =>
                            updateAnimalStatus(animal._id, value as Animal["status"])
                          }
                        >
                          <SelectTrigger className="h-8 mt-2 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="adopted">Adopted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <div className="space-y-4">
              {applications.map((app) => (
                <Card
                  key={app._id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedApplication(app)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={app.animal?.image || ""}
                          alt={app.animal?.name || ""}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="font-semibold">
                            Application for {app.animal?.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Submitted {new Date(app.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab (Admin Only) */}
          {isAdmin && (
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Adoption Rate</CardTitle>
                    <CardDescription>Monthly adoption trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <span className="text-2xl font-bold">
                        {analytics.adoptionRate}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      {analytics.monthlyAdoptions.map((month) => (
                        <div key={month.month} className="flex items-center gap-2">
                          <span className="w-8 text-xs text-muted-foreground">
                            {month.month}
                          </span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(month.count / 15) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium w-6">
                            {month.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Donations</CardTitle>
                    <CardDescription>Last 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {donations.slice(0, 4).map((donation) => (
                        <div
                          key={donation._id}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {donation.donorName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {donation.message}
                            </p>
                          </div>
                          <span className="font-semibold text-green-600">
                            ${donation.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Team Tab (Admin Only) */}
          {isAdmin && (
            <TabsContent value="team">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Volunteers</CardTitle>
                    <CardDescription>
                      {volunteers.length} active volunteers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {volunteers.map((vol) => (
                        <div
                          key={vol._id}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-sm">{vol.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {vol.skills.join(", ")}
                            </p>
                          </div>
                          <Badge variant="outline">{vol.totalHours}h</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Upcoming Events</CardTitle>
                    <CardDescription>Scheduled activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {events.map((event) => (
                        <div key={event._id} className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-sky-blue-100 dark:bg-sky-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-5 w-5 text-sky-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* Application Detail Dialog */}
      <Dialog
        open={selectedApplication !== null}
        onOpenChange={(open) => !open && setSelectedApplication(null)}
      >
        <DialogContent>
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Application for {selectedApplication.animal?.name}
                </DialogTitle>
                <DialogDescription>
                  Review and update the application status
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedApplication.animal?.image || ""}
                    alt={selectedApplication.animal?.name || ""}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">
                      {selectedApplication.animal?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedApplication.animal?.breed}
                    </p>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Current Status</p>
                  {getStatusBadge(selectedApplication.status)}
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                      onClick={() => handleUpdateApplicationStatus("under_review")}
                    >
                      Under Review
                    </Button>
                    <Button
                      variant="outline"
                      className="border-green-300 text-green-600 hover:bg-green-50"
                      onClick={() => handleUpdateApplicationStatus("approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => handleUpdateApplicationStatus("rejected")}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedApplication(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DemoShelterExperience;
