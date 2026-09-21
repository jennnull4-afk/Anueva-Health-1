import type { NextConfig } from "next";

const forwardedPortDomain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
    serverActions: forwardedPortDomain
      ? { allowedOrigins: [`*.${forwardedPortDomain}`] }
      : undefined,
  },
};

export default nextConfig;
