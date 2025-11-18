import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  eslint: {
    // Não quebra o build em produção
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Não quebra o build em produção
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
