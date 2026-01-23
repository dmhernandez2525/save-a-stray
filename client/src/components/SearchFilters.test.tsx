import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SearchFilters from "./SearchFilters";
import { FindAnimalsVariables } from "../types";

describe("SearchFilters", () => {
  const defaultFilters: FindAnimalsVariables = {};
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders type buttons", () => {
    render(<SearchFilters filters={defaultFilters} onFiltersChange={mockOnChange} />);

    expect(screen.getByText("Dogs")).toBeInTheDocument();
    expect(screen.getByText("Cats")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
  });

  it("renders filter inputs", () => {
    render(<SearchFilters filters={defaultFilters} onFiltersChange={mockOnChange} />);

    expect(screen.getByPlaceholderText("Search by name...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Min age")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Max age")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Color...")).toBeInTheDocument();
  });

  it("renders sex filter dropdown", () => {
    render(<SearchFilters filters={defaultFilters} onFiltersChange={mockOnChange} />);

    const selects = screen.getAllByDisplayValue("Any");
    expect(selects[0]).toBeInTheDocument();
  });

  it("calls onFiltersChange when type button is clicked", () => {
    render(<SearchFilters filters={defaultFilters} onFiltersChange={mockOnChange} />);

    fireEvent.click(screen.getByText("Dogs"));
    expect(mockOnChange).toHaveBeenCalledWith({ type: "Dogs" });
  });

  it("toggles type off when same type button is clicked again", () => {
    render(<SearchFilters filters={{ type: "Dogs" }} onFiltersChange={mockOnChange} />);

    fireEvent.click(screen.getByText("Dogs"));
    expect(mockOnChange).toHaveBeenCalledWith({ type: undefined });
  });

  it("calls onFiltersChange when name input changes", () => {
    render(<SearchFilters filters={defaultFilters} onFiltersChange={mockOnChange} />);

    fireEvent.change(screen.getByPlaceholderText("Search by name..."), {
      target: { value: "Buddy" },
    });
    expect(mockOnChange).toHaveBeenCalledWith({ name: "Buddy" });
  });

  it("calls onFiltersChange with undefined when name is cleared", () => {
    render(<SearchFilters filters={{ name: "Buddy" }} onFiltersChange={mockOnChange} />);

    fireEvent.change(screen.getByPlaceholderText("Search by name..."), {
      target: { value: "" },
    });
    expect(mockOnChange).toHaveBeenCalledWith({ name: undefined });
  });

  it("calls onFiltersChange when sex is changed", () => {
    render(<SearchFilters filters={defaultFilters} onFiltersChange={mockOnChange} />);

    const selects = screen.getAllByDisplayValue("Any");
    fireEvent.change(selects[0], {
      target: { value: "Male" },
    });
    expect(mockOnChange).toHaveBeenCalledWith({ sex: "Male" });
  });

  it("calls onFiltersChange with undefined when sex is set to Any", () => {
    render(<SearchFilters filters={{ sex: "Male" }} onFiltersChange={mockOnChange} />);

    fireEvent.change(screen.getByDisplayValue("Male"), {
      target: { value: "Any" },
    });
    expect(mockOnChange).toHaveBeenCalledWith({ sex: undefined });
  });

  it("calls onFiltersChange when minAge is set", () => {
    render(<SearchFilters filters={defaultFilters} onFiltersChange={mockOnChange} />);

    fireEvent.change(screen.getByPlaceholderText("Min age"), {
      target: { value: "2" },
    });
    expect(mockOnChange).toHaveBeenCalledWith({ minAge: 2 });
  });

  it("calls onFiltersChange when maxAge is set", () => {
    render(<SearchFilters filters={defaultFilters} onFiltersChange={mockOnChange} />);

    fireEvent.change(screen.getByPlaceholderText("Max age"), {
      target: { value: "10" },
    });
    expect(mockOnChange).toHaveBeenCalledWith({ maxAge: 10 });
  });

  it("calls onFiltersChange when color is entered", () => {
    render(<SearchFilters filters={defaultFilters} onFiltersChange={mockOnChange} />);

    fireEvent.change(screen.getByPlaceholderText("Color..."), {
      target: { value: "Brown" },
    });
    expect(mockOnChange).toHaveBeenCalledWith({ color: "Brown" });
  });

  it("highlights active type button with salmon variant", () => {
    const { container } = render(
      <SearchFilters filters={{ type: "Dogs" }} onFiltersChange={mockOnChange} />
    );

    const dogsButton = screen.getByText("Dogs");
    expect(dogsButton.className).toContain("salmon");
  });

  it("renders status filter dropdown", () => {
    render(<SearchFilters filters={defaultFilters} onFiltersChange={mockOnChange} />);

    const selects = screen.getAllByDisplayValue("Any");
    expect(selects.length).toBe(2); // sex and status
  });

  it("calls onFiltersChange when status is changed", () => {
    render(<SearchFilters filters={defaultFilters} onFiltersChange={mockOnChange} />);

    const selects = screen.getAllByDisplayValue("Any");
    // Status is the second "Any" dropdown
    fireEvent.change(selects[1], { target: { value: "Available" } });
    expect(mockOnChange).toHaveBeenCalledWith({ status: "available" });
  });

  it("calls onFiltersChange with undefined when status is set to Any", () => {
    render(<SearchFilters filters={{ status: "available" }} onFiltersChange={mockOnChange} />);

    fireEvent.change(screen.getByDisplayValue("Available"), {
      target: { value: "Any" },
    });
    expect(mockOnChange).toHaveBeenCalledWith({ status: undefined });
  });

  it("renders breed filter input", () => {
    render(<SearchFilters filters={defaultFilters} onFiltersChange={mockOnChange} />);

    expect(screen.getByPlaceholderText("Breed...")).toBeInTheDocument();
  });

  it("calls onFiltersChange when breed is entered", () => {
    render(<SearchFilters filters={defaultFilters} onFiltersChange={mockOnChange} />);

    fireEvent.change(screen.getByPlaceholderText("Breed..."), {
      target: { value: "Labrador" },
    });
    expect(mockOnChange).toHaveBeenCalledWith({ breed: "Labrador" });
  });

  it("preserves existing filters when updating a single field", () => {
    const filters: FindAnimalsVariables = { type: "Dogs", sex: "Male" };
    render(<SearchFilters filters={filters} onFiltersChange={mockOnChange} />);

    fireEvent.change(screen.getByPlaceholderText("Search by name..."), {
      target: { value: "Rex" },
    });
    expect(mockOnChange).toHaveBeenCalledWith({ type: "Dogs", sex: "Male", name: "Rex" });
  });
});
