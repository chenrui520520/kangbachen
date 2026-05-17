import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/admin",
  transpilePackages: ["@kenba/ui"],
};

export default nextConfig;
