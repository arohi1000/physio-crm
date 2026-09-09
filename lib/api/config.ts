/**
 * `NEXT_PUBLIC_` variables are inlined at build time, so they must be read as a
 * full property access rather than destructured from `process.env`.
 */
const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiBaseUrl = (configuredBaseUrl ?? "http://localhost:4000").replace(/\/+$/, "");

export const isApiMockingEnabled = process.env.NEXT_PUBLIC_API_MOCKING === "enabled";
