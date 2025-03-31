import { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import Image from 'next/image';
import { uploadToCloudinary } from '@/utils/cloudinary';

interface ImageUploadProps {
  currentImage?: string;
  onImageUpload: (url: string) => void;
  className?: string;
}

// Define the type for the imperative handle
export interface ImageUploadHandle {
  triggerFileInput: () => void;
}

const ImageUpload = forwardRef<ImageUploadHandle, ImageUploadProps>(
  ({ currentImage, onImageUpload, className = '' }, ref) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Expose a function to trigger the file input click
    useImperativeHandle(ref, () => ({
      triggerFileInput: () => {
        fileInputRef.current?.click();
      }
    }));

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        // Optionally add user feedback here
        console.warn('Invalid file type. Please upload an image.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        // Optionally add user feedback here
        console.warn('File size exceeds 5MB limit.');
        return;
      }

      setIsUploading(true);
      try {
        const imageUrl = await uploadToCloudinary(file);
        onImageUpload(imageUrl);
      } catch (err) {
        console.error('Upload error:', err);
        // Optionally add user feedback here
      } finally {
        setIsUploading(false);
      }
    };

    return (
      <div className={`relative ${className}`}>
        <div className="relative w-full h-full rounded-full overflow-hidden">
          {currentImage ? (
            <Image
              src={currentImage}
              alt="Profile"
              fill
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <svg 
                className="w-12 h-12 text-gray-400 dark:text-gray-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    );
  }
);

ImageUpload.displayName = 'ImageUpload';

export default ImageUpload;
