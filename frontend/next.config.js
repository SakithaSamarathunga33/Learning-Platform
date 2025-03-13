/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
  },
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: 'drlfav5jz'
  },
  // Completely disable all development indicators and overlays
  devIndicators: false
};

module.exports = nextConfig;
