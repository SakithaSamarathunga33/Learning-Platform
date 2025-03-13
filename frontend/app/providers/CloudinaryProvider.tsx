'use client';

import { ReactNode } from 'react';
import { CldImage } from 'next-cloudinary';

interface CloudinaryProviderProps {
  children: ReactNode;
}

export default function CloudinaryProvider({ children }: CloudinaryProviderProps) {
  // Ensure Cloudinary is initialized
  if (typeof window !== 'undefined') {
    CldImage;
  }
  
  return <>{children}</>;
}
