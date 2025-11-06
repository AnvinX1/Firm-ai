/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // For Tauri builds, use static export
  output: process.env.TAURI_BUILD === "true" ? "export" : undefined,
  // Disable server-side features for Tauri builds
  ...(process.env.TAURI_BUILD === "true" && {
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
  }),
}

export default nextConfig
