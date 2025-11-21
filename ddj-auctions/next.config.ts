import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "upload.wikimedia.org",
      "images.unsplash.com",
      "i.imgur.com"
    ],
  },
};

module.exports = nextConfig;

export default nextConfig;
