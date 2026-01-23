import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { FindAnimalsVariables } from "../types";

interface SearchFiltersProps {
  filters: FindAnimalsVariables;
  onFiltersChange: (filters: FindAnimalsVariables) => void;
}

const ANIMAL_TYPES = ["Dogs", "Cats", "Other"];
const SEX_OPTIONS = ["Any", "Male", "Female"];

const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onFiltersChange }) => {
  const updateFilter = (key: keyof FindAnimalsVariables, value: string | number | undefined) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div className="flex gap-3 justify-center flex-wrap">
        {ANIMAL_TYPES.map((type) => (
          <Button
            key={type}
            variant={filters.type === type ? "salmon" : "skyBlue"}
            size="lg"
            onClick={() => updateFilter("type", filters.type === type ? undefined : type)}
            className="min-w-[120px]"
          >
            {type}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <Input
            placeholder="Search by name..."
            value={filters.name || ""}
            onChange={(e) => updateFilter("name", e.target.value || undefined)}
            className="bg-white/90"
          />
        </div>

        <div>
          <select
            value={filters.sex || "Any"}
            onChange={(e) => updateFilter("sex", e.target.value === "Any" ? undefined : e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-white/90 px-3 py-2 text-sm"
          >
            {SEX_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder="Min age"
            min={0}
            value={filters.minAge ?? ""}
            onChange={(e) => updateFilter("minAge", e.target.value ? Number(e.target.value) : undefined)}
            className="bg-white/90"
          />
          <span className="text-white text-sm">-</span>
          <Input
            type="number"
            placeholder="Max age"
            min={0}
            value={filters.maxAge ?? ""}
            onChange={(e) => updateFilter("maxAge", e.target.value ? Number(e.target.value) : undefined)}
            className="bg-white/90"
          />
        </div>

        <div>
          <Input
            placeholder="Color..."
            value={filters.color || ""}
            onChange={(e) => updateFilter("color", e.target.value || undefined)}
            className="bg-white/90"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
