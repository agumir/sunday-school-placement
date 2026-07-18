/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: ['localhost:3000'],
        },
    },
    // Optional: Fix the workspace root warning
    turbopack: {
        root: process.cwd(),
    },
};

module.exports = nextConfig;