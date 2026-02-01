import React, { useState, useEffect, useCallback } from "react";
import { Query } from "@apollo/client/react/components";
import Queries from "../graphql/queries";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import FavoriteButton from "./FavoriteButton";
import SavedSearches from "./SavedSearches";
import { FindAnimalsResponse, FindAnimalsVariables, Animal, UserIdData, AnimalStatus } from "../types";
import {
  Search, SlidersHorizontal, Grid3X3, List,
  Dog, Cat, Rabbit, X, ChevronRight, Sparkles
} from "lucide-react";
import { useDemo } from "../demo/DemoContext";
import DemoBanner from "../demo/DemoBanner";

const { FIND_ANIMALS, USER_ID } = Queries;

const PAGE_SIZE = 12;
const DEBOUNCE_MS = 300;

const ANIMAL_TYPES = [
  { value: "Dogs", label: "Dogs", icon: Dog },
  { value: "Cats", label: "Cats", icon: Cat },
  { value: "Other", label: "Other", icon: Rabbit },
];

const SEX_OPTIONS = [
  { value: "any", label: "Any Sex" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

const STATUS_OPTIONS = [
  { value: "any", label: "Any Status" },
  { value: "available", label: "Available" },
  { value: "pending", label: "Pending" },
  { value: "adopted", label: "Adopted" },
];

const STATUS_STYLES: Record<AnimalStatus, { bg: string; text: string }> = {
  available: { bg: "bg-success-100 dark:bg-success-900/30", text: "text-success-700 dark:text-success-400" },
  pending: { bg: "bg-warning-100 dark:bg-warning-900/30", text: "text-warning-700 dark:text-warning-400" },
  adopted: { bg: "bg-sky-blue-100 dark:bg-sky-blue-900/30", text: "text-sky-blue-700 dark:text-sky-blue-400" },
};

interface UserLandingProps {
  splash?: string;
}

const UserLanding: React.FC<UserLandingProps> = ({ splash }) => {
  const navigate = useNavigate();
  const { isDemo, animals: demoAnimals, filterAnimals: filterDemoAnimals } = useDemo();
  const [filters, setFilters] = useState<FindAnimalsVariables>({});
  const [queryFilters, setQueryFilters] = useState<FindAnimalsVariables>({});
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Debounce timer ref
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [debounceTimer]);

  // Redirect if splash mode
  useEffect(() => {
    if (splash === "splash") {
      navigate("/login");
    }
  }, [splash, navigate]);

  const updateFilter = useCallback((key: keyof FindAnimalsVariables, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const textKeys = ["name", "breed", "color"];
    const numericKeys = ["minAge", "maxAge"];
    const shouldDebounce = textKeys.includes(key) || numericKeys.includes(key);

    if (shouldDebounce) {
      if (debounceTimer) clearTimeout(debounceTimer);
      const timer = setTimeout(() => {
        setQueryFilters(newFilters);
        setHasMore(true);
      }, DEBOUNCE_MS);
      setDebounceTimer(timer);
    } else {
      if (debounceTimer) clearTimeout(debounceTimer);
      setQueryFilters(newFilters);
      setHasMore(true);
    }
  }, [filters, debounceTimer]);

  const clearFilters = () => {
    setFilters({});
    setQueryFilters({});
    setHasMore(true);
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== "").length;

  if (splash === "splash") return null;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Animal Type */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Animal Type</Label>
        <div className="grid grid-cols-3 gap-2">
          {ANIMAL_TYPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => updateFilter("type", filters.type === value ? undefined : value)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                filters.type === value
                  ? "border-sky-blue-500 bg-sky-blue-50 dark:bg-sky-blue-950"
                  : "border-border hover:border-sky-blue-300"
              }`}
            >
              <Icon className={`h-5 w-5 ${filters.type === value ? "text-sky-blue-500" : "text-muted-foreground"}`} />
              <span className={`text-xs font-medium ${filters.type === value ? "text-sky-blue-700 dark:text-sky-blue-300" : "text-muted-foreground"}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Sex */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Sex</Label>
        <Select
          value={filters.sex || "any"}
          onValueChange={(value) => updateFilter("sex", value === "any" ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any Sex" />
          </SelectTrigger>
          <SelectContent>
            {SEX_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Status</Label>
        <Select
          value={filters.status || "any"}
          onValueChange={(value) => updateFilter("status", value === "any" ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Breed */}
      <div>
        <Label htmlFor="breed" className="text-sm font-medium mb-3 block">Breed</Label>
        <Input
          id="breed"
          placeholder="Any breed..."
          value={filters.breed || ""}
          onChange={(e) => updateFilter("breed", e.target.value || undefined)}
        />
      </div>

      {/* Color */}
      <div>
        <Label htmlFor="color" className="text-sm font-medium mb-3 block">Color</Label>
        <Input
          id="color"
          placeholder="Any color..."
          value={filters.color || ""}
          onChange={(e) => updateFilter("color", e.target.value || undefined)}
        />
      </div>

      <Separator />

      {/* Age Range */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Age (years)</Label>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            placeholder="Min"
            min={0}
            max={30}
            value={filters.minAge ?? ""}
            onChange={(e) => updateFilter("minAge", e.target.value ? Number(e.target.value) : undefined)}
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="number"
            placeholder="Max"
            min={0}
            max={30}
            value={filters.maxAge ?? ""}
            onChange={(e) => updateFilter("maxAge", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>

      {activeFilterCount > 0 && (
        <>
          <Separator />
          <Button variant="outline" className="w-full" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        </>
      )}
    </div>
  );

  // Demo mode: filter and display demo animals
  const filteredDemoAnimals = isDemo
    ? filterDemoAnimals({
        type: queryFilters.type,
        status: queryFilters.status || "available",
        sex: queryFilters.sex,
        minAge: queryFilters.minAge,
        maxAge: queryFilters.maxAge,
        breed: queryFilters.breed,
        name: queryFilters.name,
      })
    : [];

  return (
    <div className="min-h-screen bg-background col-start-1 col-end-6 row-start-1 row-end-4">
      {/* Demo Banner */}
      {isDemo && <DemoBanner variant="adopter" />}

      {/* Header */}
      <div className="bg-gradient-to-r from-sky-blue-500 to-sky-blue-600 text-white">
        <div className="container-wide py-8 md:py-12">
          <h1 className="font-capriola text-3xl md:text-4xl mb-2">Find Your New Best Friend</h1>
          <p className="text-white/90 text-lg max-w-2xl">
            Browse through our adorable pets waiting for their forever homes
          </p>
        </div>
      </div>

      <div className="container-wide py-6">
        {/* Saved Searches - only show when not in demo mode */}
        {!isDemo && (
          <Query<UserIdData> query={USER_ID}>
            {({ data: userIdData }) => {
              const currentUserId = userIdData?.userId;
              if (!currentUserId) return null;
              return (
                <div className="mb-6">
                  <SavedSearches
                    userId={currentUserId}
                    onRunSearch={(savedFilters) => {
                      const newFilters: FindAnimalsVariables = {};
                      if (savedFilters.type) newFilters.type = savedFilters.type as string;
                      if (savedFilters.breed) newFilters.breed = savedFilters.breed as string;
                      if (savedFilters.sex) newFilters.sex = savedFilters.sex as string;
                      if (savedFilters.color) newFilters.color = savedFilters.color as string;
                      if (savedFilters.status) newFilters.status = savedFilters.status as string;
                      if (savedFilters.minAge !== undefined && savedFilters.minAge !== null) newFilters.minAge = savedFilters.minAge as number;
                      if (savedFilters.maxAge !== undefined && savedFilters.maxAge !== null) newFilters.maxAge = savedFilters.maxAge as number;
                      setFilters(newFilters);
                      setQueryFilters(newFilters);
                      setHasMore(true);
                    }}
                  />
                </div>
              );
            }}
          </Query>
        )}

        <div className="flex gap-6">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-lg">Filters</h2>
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary">{activeFilterCount} active</Badge>
                  )}
                </div>
                <FilterContent />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search Bar & Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={filters.name || ""}
                  onChange={(e) => updateFilter("name", e.target.value || undefined)}
                  className="pl-11"
                />
              </div>
              <div className="flex gap-2">
                {/* Mobile Filter Button */}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-2">{activeFilterCount}</Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* View Toggle */}
                <div className="flex border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2.5 transition-colors ${viewMode === "grid" ? "bg-sky-blue-500 text-white" : "bg-background hover:bg-muted"}`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2.5 transition-colors ${viewMode === "list" ? "bg-sky-blue-500 text-white" : "bg-background hover:bg-muted"}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Pills */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.type && (
                  <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
                    {filters.type}
                    <button onClick={() => updateFilter("type", undefined)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.sex && (
                  <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
                    {filters.sex}
                    <button onClick={() => updateFilter("sex", undefined)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.status && (
                  <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
                    {filters.status}
                    <button onClick={() => updateFilter("status", undefined)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.breed && (
                  <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
                    {filters.breed}
                    <button onClick={() => updateFilter("breed", undefined)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.color && (
                  <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
                    {filters.color}
                    <button onClick={() => updateFilter("color", undefined)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {(filters.minAge !== undefined || filters.maxAge !== undefined) && (
                  <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
                    Age: {filters.minAge ?? 0} - {filters.maxAge ?? "∞"}
                    <button onClick={() => { updateFilter("minAge", undefined); updateFilter("maxAge", undefined); }}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Results - Demo Mode */}
            {isDemo ? (
              <>
                {filteredDemoAnimals.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-capriola text-xl mb-2">No animals found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters or check back soon for new arrivals!
                    </p>
                    {activeFilterCount > 0 && (
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    )}
                  </Card>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      Showing {filteredDemoAnimals.length} pet{filteredDemoAnimals.length !== 1 ? "s" : ""}
                    </p>

                    {viewMode === "grid" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredDemoAnimals.map((animal, index) => (
                          <AnimalCard key={animal._id} animal={animal} index={index} isDemo />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredDemoAnimals.map((animal, index) => (
                          <AnimalListItem key={animal._id} animal={animal} index={index} isDemo />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              /* Results - Real Mode */
              <Query<FindAnimalsResponse, FindAnimalsVariables>
                query={FIND_ANIMALS}
                variables={{ ...queryFilters, limit: PAGE_SIZE, offset: 0 }}
                onCompleted={(data) => {
                  const animals = data?.findAnimals || [];
                  if (animals.length < PAGE_SIZE && hasMore) {
                    setHasMore(false);
                  }
                }}
              >
                {({ loading, error, data, fetchMore }) => {
                  if (loading && (!data || !data.findAnimals)) {
                    return (
                      <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
                        {[...Array(6)].map((_, i) => (
                          <Card key={i} className="overflow-hidden">
                            <Skeleton className="h-48 w-full" />
                            <CardContent className="p-4">
                              <Skeleton className="h-6 w-32 mb-2" />
                              <Skeleton className="h-4 w-24" />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    );
                  }

                  if (error) {
                    return (
                      <Card className="p-12 text-center">
                        <p className="text-destructive font-medium">Error loading animals. Please try again.</p>
                      </Card>
                    );
                  }

                  const animals = data?.findAnimals || [];

                  if (animals.length === 0) {
                    return (
                      <Card className="p-12 text-center">
                        <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-capriola text-xl mb-2">No animals found</h3>
                        <p className="text-muted-foreground mb-4">
                          Try adjusting your filters or check back soon for new arrivals!
                        </p>
                        {activeFilterCount > 0 && (
                          <Button variant="outline" onClick={clearFilters}>
                            Clear Filters
                          </Button>
                        )}
                      </Card>
                    );
                  }

                  return (
                    <>
                      <p className="text-sm text-muted-foreground mb-4">
                        Showing {animals.length} pet{animals.length !== 1 ? "s" : ""}
                      </p>

                      {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                          {animals.map((animal, index) => (
                            <AnimalCard key={animal._id} animal={animal} index={index} />
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {animals.map((animal, index) => (
                            <AnimalListItem key={animal._id} animal={animal} index={index} />
                          ))}
                        </div>
                      )}

                      {hasMore && animals.length >= PAGE_SIZE && (
                        <div className="flex justify-center mt-8">
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => {
                              fetchMore({
                                variables: { offset: animals.length },
                                updateQuery: (prev, { fetchMoreResult }) => {
                                  if (!fetchMoreResult) return prev;
                                  const newAnimals = fetchMoreResult.findAnimals;
                                  if (newAnimals.length < PAGE_SIZE) {
                                    setHasMore(false);
                                  }
                                  return {
                                    findAnimals: [...prev.findAnimals, ...newAnimals],
                                  };
                                },
                              });
                            }}
                          >
                            Load More Pets
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      )}
                    </>
                  );
                }}
              </Query>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Animal Card Component (Grid View)
const AnimalCard: React.FC<{ animal: Animal; index: number; isDemo?: boolean }> = ({ animal, index, isDemo }) => {
  const navigate = useNavigate();
  const status = (animal.status || "available") as AnimalStatus;
  const statusStyle = STATUS_STYLES[status];

  const handleClick = () => {
    // In demo mode, don't navigate to real animal pages (which won't have data)
    if (!isDemo) {
      navigate(`/AnimalShow/${animal._id}`);
    }
  };

  return (
    <Card
      variant="interactive"
      className="overflow-hidden group animate-fade-in-up"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={handleClick}
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={animal.image || `https://images.unsplash.com/photo-${animal.type === 'Dog' ? '1587300003388-59208cc962cb' : '1514888286974-6c03e2ca1dba'}?w=400&h=300&fit=crop`}
          alt={animal.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-warm-gray-900/60 via-transparent to-transparent" />

        {/* Status Badge */}
        <Badge className={`absolute top-3 left-3 ${statusStyle.bg} ${statusStyle.text} border-0`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>

        {/* Favorite Button - only show when not in demo mode */}
        {!isDemo && (
          <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
            <FavoriteButton animalId={animal._id} />
          </div>
        )}

        {/* Name Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-capriola text-2xl text-white">{animal.name}</h3>
          <p className="text-white/80 text-sm">
            {animal.breed || animal.type} {animal.age && `• ${animal.age} yr${animal.age !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {animal.sex && <span className="capitalize">{animal.sex}</span>}
            {animal.color && <span>{animal.color}</span>}
          </div>
          <Button variant="ghost" size="sm" className="text-sky-blue-500 -mr-2">
            {isDemo ? "Demo" : "View"} <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Animal List Item Component (List View)
const AnimalListItem: React.FC<{ animal: Animal; index: number; isDemo?: boolean }> = ({ animal, index, isDemo }) => {
  const navigate = useNavigate();
  const status = (animal.status || "available") as AnimalStatus;
  const statusStyle = STATUS_STYLES[status];

  const handleClick = () => {
    // In demo mode, don't navigate to real animal pages (which won't have data)
    if (!isDemo) {
      navigate(`/AnimalShow/${animal._id}`);
    }
  };

  return (
    <Card
      variant="interactive"
      className="overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={handleClick}
    >
      <div className="flex">
        <div className="relative w-40 h-40 flex-shrink-0 overflow-hidden">
          <img
            src={animal.image || `https://images.unsplash.com/photo-${animal.type === 'Dog' ? '1587300003388-59208cc962cb' : '1514888286974-6c03e2ca1dba'}?w=200&h=200&fit=crop`}
            alt={animal.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-capriola text-xl text-foreground">{animal.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {animal.breed || animal.type} {animal.age && `• ${animal.age} yr${animal.age !== 1 ? "s" : ""}`}
                </p>
              </div>
              <Badge className={`${statusStyle.bg} ${statusStyle.text} border-0`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
            {animal.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{animal.description}</p>
            )}
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {animal.sex && <span className="capitalize">{animal.sex}</span>}
              {animal.color && <span>{animal.color}</span>}
            </div>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {!isDemo && <FavoriteButton animalId={animal._id} />}
              <Button variant="skyBlue" size="sm">
                {isDemo ? "Demo View" : "View Details"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserLanding;
