/**
 * Centralised API configuration.
 *
 * When the Express + MongoDB backend is ready:
 *   1. Set `useMockData` to `false`.
 *   2. Point `baseUrl` at the deployed API (or keep localhost:5000 for dev).
 *
 * Every service in `core/services` reads its endpoints from here, so no URL
 * ever needs to be hard-coded inside a component.
 */
export const API_CONFIG = {
  baseUrl: 'http://localhost:5000/api',

  /**
   * `true`  → the app serves the local mock data below (works offline).
   * `false` → real HttpClient requests are made against `baseUrl`.
   */
  useMockData: false,

  /** Milliseconds before a request is treated as failed. */
  requestTimeout: 12_000,

  /** Network latency used by the mock layer so loading states stay visible. */
  mockLatency: 450,

  endpoints: {
    settings: '/settings',
    skills: '/skills',
    projects: '/projects',
    experience: '/experience',
    education: '/education',
    contact: '/contact',
    auth: '/auth',
    upload: '/upload',
  },
} as const;

export type ApiEndpoints = typeof API_CONFIG.endpoints;
