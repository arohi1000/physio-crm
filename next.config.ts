import type { NextConfig } from "next";

/**
 * The CRM only ever serves authenticated clinic data, so both headers apply to
 * every route without exception rather than being opted into per page.
 */
const globalSecurityHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "Cache-Control", value: "no-store" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next regenerates AGENTS.md/CLAUDE.md on every dev run; this repo documents
  // itself in README.md instead.
  agentRules: false,
  async headers() {
    return [{ source: "/:path*", headers: globalSecurityHeaders }];
  },
};

export default nextConfig;
