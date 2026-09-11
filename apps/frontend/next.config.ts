import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    reactRemoveProperties: true,
  },
  reactCompiler: true,
  typedRoutes: true,
  logging: {
    browserToTerminal: true,
  },
};

export default nextConfig;
