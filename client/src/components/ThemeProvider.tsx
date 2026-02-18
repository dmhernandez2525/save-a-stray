import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "dark" | "light" | "system";
type ResolvedTheme = "dark" | "light";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
}

const THEME_VALUES: Theme[] = ["dark", "light", "system"];

function isTheme(value: string | null): value is Theme {
  if (!value) return false;
  return THEME_VALUES.includes(value as Theme);
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(resolvedTheme: ResolvedTheme): void {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
  root.style.colorScheme = resolvedTheme;
}

function getInitialTheme(storageKey: string, defaultTheme: Theme): Theme {
  if (typeof window === "undefined") return defaultTheme;
  const stored = window.localStorage.getItem(storageKey);
  return isTheme(stored) ? stored : defaultTheme;
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "save-a-stray-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() =>
    getInitialTheme(storageKey, defaultTheme)
  );
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (theme === "system" && typeof window !== "undefined") {
      return getSystemTheme();
    }

    return theme === "system" ? "light" : theme;
  });

  useEffect(() => {
    const nextResolvedTheme = theme === "system" ? getSystemTheme() : theme;
    applyTheme(nextResolvedTheme);
    setResolvedTheme(nextResolvedTheme);
    window.localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  useEffect(() => {
    if (theme !== "system") return undefined;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const nextResolvedTheme = getSystemTheme();
      applyTheme(nextResolvedTheme);
      setResolvedTheme(nextResolvedTheme);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent): void => {
      if (event.key !== storageKey) return;
      const nextTheme = isTheme(event.newValue) ? event.newValue : defaultTheme;
      setTheme(nextTheme);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [defaultTheme, storageKey]);

  const value = useMemo<ThemeProviderState>(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
    }),
    [theme, resolvedTheme]
  );

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme(): ThemeProviderState {
  const context = useContext(ThemeProviderContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
