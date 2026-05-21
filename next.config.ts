import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained server bundle for the Docker image / k3s deploy.
  output: "standalone",
  // better-sqlite3 is a native module; keep it external so Next doesn't bundle it.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
