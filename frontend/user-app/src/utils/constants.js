// Use VITE_API_URL in production (set in Vercel/Render env). Falls back to localhost for dev.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

