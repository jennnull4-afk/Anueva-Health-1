import type { NextConfig } from "next";

const forwardedPortDomain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;
const isDevelopment = process.env.NODE_ENV !== "production";
const allowedServerActionOrigins = [
  ...(isDevelopment ? ["localhost:3000", "127.0.0.1:3000"] : []),
  ...(forwardedPortDomain ? [`*.${forwardedPortDomain}`] : []),
];

const nextConfig: NextConfig = {
  allowedDevOrigins: forwardedPortDomain ? [`*.${forwardedPortDomain}`] : undefined,
  experimental: {
    authInterrupts: true,
    serverActions: { allowedOrigins: allowedServerActionOrigins },
  },
};

export default nextConfig;
