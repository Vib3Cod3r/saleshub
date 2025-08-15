// Environment variable validation
const requiredEnvVars = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
} as const;

// Validate required environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.warn(`Warning: ${key} is not set. Using default value.`);
  }
});

// Environment configuration
export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8089',
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;

// Type-safe environment access
export type Env = typeof env;
