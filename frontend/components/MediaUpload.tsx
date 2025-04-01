'use client';

import { CldImage, CldUploadWidget } from 'next-cloudinary';
import { useState } from 'react';

export default function MediaUpload() {
  const [publicId, setPublicId] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpload = async (results: any) => {
    if (!results || results.event !== 'success' || !results.info) return;
    
    try {
      setUploadStatus('uploading');
      const { public_id, secure_url, resource_type } = results.info;
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
      console.log('Media upload recorded successfully');
    } catch (error) {
      console.error('Error saving media:', error);
      setUploadStatus('error');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-2xl font-bold mb-4">Upload Media</h2>
      
      {cloudName ? (
        <CldUploadWidget
          uploadPreset={uploadPreset}
          onUpload={handleUpload}
          options={{
            cloudName: cloudName,
            maxFiles: 1,
            resourceType: 'auto',
            clientAllowedFormats: ['image', 'video']
          }}
        >
          {({ open }) => (
            <button
              onClick={() => {
                setUploadStatus('idle');
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
        <p className="text-red-500 mt-2">Error uploading media. Please try again.</p>
      )}

      {uploadStatus === 'success' && (
        <p className="text-green-500 mt-2">Media uploaded successfully!</p>
      )}

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
