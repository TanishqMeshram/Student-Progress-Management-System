import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

/**
 * Determines the preferred theme (dark/light) based on user or system settings.
 * @returns {string} - "dark" or "light"
 */
function getPreferredTheme() {
  if (typeof window === "undefined") return "light";
  if (localStorage.theme === "dark") return "dark";
  if (localStorage.theme === "light") return "light";
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

/**
 * ThemeProvider component to provide theme context and handle theme switching.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getPreferredTheme);

  // Apply theme to <html> and persist
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.theme = theme;
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const systemChange = () => {
      if (!("theme" in localStorage)) {
        setTheme(media.matches ? "dark" : "light");
      }
    };
    media.addEventListener("change", systemChange);
    return () => media.removeEventListener("change", systemChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to access theme context.
 */
export function useTheme() {
  return useContext(ThemeContext);
}