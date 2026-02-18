import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";

function ThemeConsumer(): React.ReactElement {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div>
      <p data-testid="theme">{theme}</p>
      <p data-testid="resolved-theme">{resolvedTheme}</p>
      <button type="button" onClick={() => setTheme("dark")}>
        Set Dark
      </button>
      <button type="button" onClick={() => setTheme("light")}>
        Set Light
      </button>
      <button type="button" onClick={() => setTheme("system")}>
        Set System
      </button>
    </div>
  );
}

describe("ThemeProvider", () => {
  it("loads persisted theme from localStorage", () => {
    window.localStorage.setItem("save-a-stray-theme", "dark");

    render(
      <ThemeProvider storageKey="save-a-stray-theme">
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("uses system preference when theme is set to system", () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: true,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <ThemeProvider storageKey="save-a-stray-theme" defaultTheme="system">
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("persists user preference updates", () => {
    render(
      <ThemeProvider storageKey="save-a-stray-theme">
        <ThemeConsumer />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText("Set Light"));
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "save-a-stray-theme",
      "light"
    );

    fireEvent.click(screen.getByText("Set Dark"));
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "save-a-stray-theme",
      "dark"
    );
  });
});
