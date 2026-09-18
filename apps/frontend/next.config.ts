import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
