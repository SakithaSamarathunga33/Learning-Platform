'use client';

import { useState, useCallback, useEffect } from 'react';
import { CldImage, CldUploadWidget } from 'next-cloudinary';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ImagePlus, X, AlertCircle, Loader2, Check } from "lucide-react";

interface UploadResult {
  public_id: string;
  secure_url: string;
}

interface AchievementUploadProps {
  imageUrl?: string;
  imagePublicId?: string;
  setImageUrl: (url: string) => void;
  setImagePublicId: (id: string) => void;
  withForm?: boolean;
}

// List of allowed image extensions
const ALLOWED_FILE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function AchievementUpload({
  imageUrl = '',
  imagePublicId = '',
  setImageUrl,
  setImagePublicId,
  withForm = false
}: AchievementUploadProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadWidget, setUploadWidget] = useState<any>(null);
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  // Reset body overflow when the component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Check file is valid
  const validateFile = (file: any): { valid: boolean; message?: string } => {
    // Check if a file exists
    if (!file) {
      return { valid: false, message: 'No file selected' };
    }

    // Check file type
    const fileName = file.name || '';
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
        message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      };
    }

    return { valid: true };
  };

  // Define a simple upload callback
  const handleUploadSuccess = useCallback((result: any) => {
    setIsLoading(false);
    
    if (result?.info) {
      // Extract info about the uploaded file
      const info = result.info;
      
      // Check if this is an image file based on format or resource_type
      const fileFormat = info.format?.toLowerCase();
      const resourceType = info.resource_type?.toLowerCase();
      
      if (resourceType !== 'image' && !ALLOWED_FILE_TYPES.includes(fileFormat)) {
        setError(`Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`);
        return;
      }
      
      setImagePublicId(info.public_id);
      setImageUrl(info.secure_url);
      setError(''); // Clear any previous errors
    }

    // Make sure modal is closed
    if (uploadWidget) {
      uploadWidget.close();
    }
    
    // Ensure body scrolling is restored
    document.body.style.overflow = 'auto';
  }, [uploadWidget, setImagePublicId, setImageUrl]);

  // Handle dialog close
  const handleClose = useCallback(() => {
    setIsLoading(false);
    // Ensure body scrolling is restored
    document.body.style.overflow = 'auto';
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !imageUrl) {
      setError('Please fill all fields and upload an image');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      console.log('Submitting achievement:', {
        title,
        description,
        imageUrl,
        imagePublicId
      });

      // Create an AbortController to handle timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(`${apiUrl}/api/achievements`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title,
            description,
            imageUrl,
            imagePublicId
          }),
          signal: controller.signal
        });

        // Clear the timeout since the request completed
        clearTimeout(timeoutId);

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('Error response:', errorData);
          throw new Error(`Failed to post achievement: ${response.status} ${errorData}`);
        }

        // Response is successful
        console.log('Achievement posted successfully');

        // Reset form
        setTitle('');
        setDescription('');
        setImageUrl('');
        setImagePublicId('');
        
        // Redirect to feed page with a slight delay to allow state updates
        setTimeout(() => {
          try {
            router.push('/feed');
          } catch (navigationError) {
            console.error('Navigation error:', navigationError);
            window.location.href = '/feed'; // Fallback to direct navigation
          }
        }, 500);
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        throw fetchError;
      }
    } catch (err) {
      console.error('Error posting achievement:', err);
      setError(`Error posting achievement: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If using just the upload functionality without the form
  if (!withForm) {
    return (
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {imagePublicId ? (
          <div className="relative overflow-hidden rounded-md border">
            <CldImage
              width="400"
              height="300"
              src={imagePublicId}
              alt="Achievement image"
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={() => {
                setImageUrl('');
                setImagePublicId('');
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-muted/30 transition-colors hover:bg-muted/50">
            {cloudName ? (
              <>
                <CldUploadWidget 
                  uploadPreset={uploadPreset}
                  options={{
                    cloudName,
                    sources: ['local', 'url', 'camera'],
                    multiple: false,
                    maxFiles: 1,
                    inlineContainer: '#inline-container',
                    showPoweredBy: false,
                    clientAllowedFormats: ALLOWED_FILE_TYPES,
                    maxFileSize: MAX_FILE_SIZE
                  }}
                  onSuccess={handleUploadSuccess}
                  onClose={handleClose}
                  onOpen={() => {
                    // Reset overflow in case it was previously set
                    document.body.style.overflow = 'auto';
                  }}
                  onWidgetReady={(widget: any) => {
                    setUploadWidget(widget);
                  }}
                  onError={(error: any, widget: any) => {
                    console.error('Upload error:', error);
                    setError(error.message || 'Upload failed. Please try again.');
                    setIsLoading(false);
                  }}
                >
                  {({ open }) => {
                    function handleOnClick() {
                      setIsLoading(true);
                      setError(''); // Clear previous errors
                      open();
                    }
                    return (
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        onClick={handleOnClick}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> 
                            Uploading...
                          </>
                        ) : (
                          <>
                            <ImagePlus className="h-4 w-4" /> 
                            Upload Image
                          </>
                        )}
                      </Button>
                    );
                  }}
                </CldUploadWidget>
                <div id="inline-container" className="w-full"></div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Upload a photo that represents your achievement. Allowed formats: {ALLOWED_FILE_TYPES.join(', ')}. Max size: {MAX_FILE_SIZE / (1024 * 1024)}MB.
                </p>
              </>
            ) : (
              <Alert className="bg-destructive/10 border-destructive/20 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Configuration Error</AlertTitle>
                <AlertDescription>
                  Cloudinary is not properly configured. Please check your environment variables.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Achievement Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What did you achieve?"
            required
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Tell us more about your achievement..."
            required
            className="resize-none"
          />
        </div>
        
        <div className="space-y-4">
          <Label>Achievement Image</Label>
          
          {!imagePublicId ? (
            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-muted/30 transition-colors hover:bg-muted/50">
              {cloudName ? (
                <>
                  <CldUploadWidget 
                    uploadPreset={uploadPreset}
                    options={{
                      cloudName,
                      sources: ['local', 'url', 'camera'],
                      multiple: false,
                      maxFiles: 1,
                      inlineContainer: '#inline-container',
                      showPoweredBy: false,
                      clientAllowedFormats: ALLOWED_FILE_TYPES,
                      maxFileSize: MAX_FILE_SIZE
                    }}
                    onSuccess={handleUploadSuccess}
                    onClose={handleClose}
                    onOpen={() => {
                      // Reset overflow in case it was previously set
                      document.body.style.overflow = 'auto';
                    }}
                    onWidgetReady={(widget: any) => {
                      setUploadWidget(widget);
                    }}
                    onError={(error: any, widget: any) => {
                      console.error('Upload error:', error);
                      setError(error.message || 'Upload failed. Please try again.');
                      setIsLoading(false);
                    }}
                  >
                    {({ open }) => {
                      function handleOnClick() {
                        setIsLoading(true);
                        setError(''); // Clear previous errors
                        open();
                      }
                      return (
                        <Button
                          type="button"
                          variant="outline"
                          className="gap-2"
                          onClick={handleOnClick}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" /> 
                              Uploading...
                            </>
                          ) : (
                            <>
                              <ImagePlus className="h-4 w-4" /> 
                              Upload Image
                            </>
                          )}
                        </Button>
                      );
                    }}
                  </CldUploadWidget>
                  <div id="inline-container" className="w-full"></div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Upload a photo that represents your achievement. Allowed formats: {ALLOWED_FILE_TYPES.join(', ')}. Max size: {MAX_FILE_SIZE / (1024 * 1024)}MB.
                  </p>
                </>
              ) : (
                <Alert className="bg-destructive/10 border-destructive/20 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Configuration Error</AlertTitle>
                  <AlertDescription>
                    Cloudinary is not properly configured. Please check your environment variables.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-md border">
              <CldImage
                width="400"
                height="300"
                src={imagePublicId}
                alt="Achievement image"
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => {
                  setImageUrl('');
                  setImagePublicId('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || !title || !description || !imageUrl}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Post Achievement
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 