import { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import Image from 'next/image';
import { uploadToCloudinary } from '@/utils/cloudinary';

// List of allowed image extensions
const ALLOWED_FILE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ImageUploadProps {
  currentImage?: string;
  onImageUpload: (url: string) => void;
  className?: string;
  onError?: (error: string) => void;
}

// Define the type for the imperative handle
export interface ImageUploadHandle {
  triggerFileInput: () => void;
}

const ImageUpload = forwardRef<ImageUploadHandle, ImageUploadProps>(
  ({ currentImage, onImageUpload, onError, className = '' }, ref) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);

    // Expose a function to trigger the file input click
    useImperativeHandle(ref, () => ({
      triggerFileInput: () => {
        fileInputRef.current?.click();
      }
    }));

    const validateFile = (file: File): { valid: boolean; message?: string } => {
      // Check file type
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      
      if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
        return { 
          valid: false, 
          message: `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}` 
        };
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return { 
          valid: false, 
          message: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.` 
        };
      }

      return { valid: true };
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Clear previous errors
      setError(null);

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        const errorMessage = validation.message || 'Invalid file';
        setError(errorMessage);
        if (onError) onError(errorMessage);
        // Reset the file input
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setIsUploading(true);
      try {
        const imageUrl = await uploadToCloudinary(file);
        onImageUpload(imageUrl);
      } catch (err) {
        console.error('Upload error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        setError(errorMessage);
        if (onError) onError(errorMessage);
      } finally {
        setIsUploading(false);
        // Reset the file input
        if (fileInputRef.current) fileInputRef.current.value = '';
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

          {error && (
            <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs text-center p-1">
              {error}
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_FILE_TYPES.map(ext => `.${ext}`).join(',')}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    );
  }
);

ImageUpload.displayName = 'ImageUpload';

export default ImageUpload;
