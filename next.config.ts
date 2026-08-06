import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: {
    '/api/**/*': ['./data/**/*.json'],
    '/confirmation/**/*': ['./data/**/*.json'],
    '/admin/**/*': ['./data/**/*.json'],
  },
};

export default nextConfig;
