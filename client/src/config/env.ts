// Environment configuration utilities
// Centralizes access to environment variables

/**
 * Check if demo mode is enabled via environment variable
 * Uses VITE_DEMO_MODE for Vite compatibility
 */
export const isDemoMode = (): boolean => {
  return import.meta.env.VITE_DEMO_MODE === 'true';
};

/**
 * Get API URL based on environment
 */
export const getApiUrl = (): string => {
  return import.meta.env.MODE === 'production'
    ? 'https://save-a-stray-api.onrender.com/graphql'
    : 'http://localhost:5000/graphql';
};

/**
 * Environment configuration object
 */
export const config = {
  isDemoMode: isDemoMode(),
  apiUrl: getApiUrl(),
  mode: import.meta.env.MODE,
} as const;

export default config;
