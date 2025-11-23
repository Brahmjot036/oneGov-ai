/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('better-sqlite3');
    }
    return config;
  },
  // Turbopack configuration
  turbopack: {
    // Empty config to silence the warning
    // better-sqlite3 will be handled by webpack config above
  },
};

export default nextConfig;
