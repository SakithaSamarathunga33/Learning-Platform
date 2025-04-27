'use client';

import { CldImage, CldUploadWidget } from 'next-cloudinary';
import { useState } from 'react';

// List of allowed image extensions
const ALLOWED_FILE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function MediaUpload() {
  const [publicId, setPublicId] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpload = async (results: any) => {
    if (!results || results.event !== 'success' || !results.info) return;
    
    try {
      setUploadStatus('uploading');
      const { public_id, secure_url, resource_type, format } = results.info;
      
      // Validate that this is an image file
      if (resource_type !== 'image' && !ALLOWED_FILE_TYPES.includes(format?.toLowerCase())) {
        setErrorMessage(`Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`);
        setUploadStatus('error');
        return;
      }
      
      setPublicId(public_id);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8080/api/media/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          publicId: public_id,
          url: secure_url,
          type: resource_type.toUpperCase(),
          title: 'Uploaded Media',
          description: `${resource_type.toUpperCase()} uploaded via Cloudinary`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save media information');
      }

      setUploadStatus('success');
      setErrorMessage('');
      console.log('Media upload recorded successfully');
    } catch (error) {
      console.error('Error saving media:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      setUploadStatus('error');
    }
  };

  // Handle upload errors
  const handleError = (error: any) => {
    console.error('Upload error:', error);
    setErrorMessage(error.message || 'File upload failed. Please try again.');
    setUploadStatus('error');
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-2xl font-bold mb-4">Upload Media</h2>
      
      {cloudName ? (
        <CldUploadWidget
          uploadPreset={uploadPreset}
          onUpload={handleUpload}
          onError={handleError}
          options={{
            cloudName: cloudName,
            maxFiles: 1,
            resourceType: 'auto',
            clientAllowedFormats: ALLOWED_FILE_TYPES,
            maxFileSize: MAX_FILE_SIZE
          }}
        >
          {({ open }) => (
            <button
              onClick={() => {
                setUploadStatus('idle');
                setErrorMessage('');
                open();
              }}
              className={`font-bold py-2 px-4 rounded ${uploadStatus === 'uploading' 
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-700 text-white'}`}
              disabled={uploadStatus === 'uploading'}
            >
              {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Media'}
            </button>
          )}
        </CldUploadWidget>
      ) : (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Cloudinary configuration is missing. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your environment.
        </div>
      )}

      {uploadStatus === 'error' && (
        <p className="text-red-500 mt-2">{errorMessage || 'Error uploading media. Please try again.'}</p>
      )}

      {uploadStatus === 'success' && (
        <p className="text-green-500 mt-2">Media uploaded successfully!</p>
      )}

      <p className="text-sm text-gray-500 mt-2">
        Allowed formats: {ALLOWED_FILE_TYPES.join(', ')}. Max size: {MAX_FILE_SIZE / (1024 * 1024)}MB.
      </p>

      {publicId && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Uploaded Image:</h3>
          <CldImage
            src={publicId}
            width="500"
            height="500"
            alt="Uploaded media"
            crop="fill"
          />
        </div>
      )}
    </div>
  );
}
