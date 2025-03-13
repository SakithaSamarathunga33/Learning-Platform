'use client';

import { CldImage, CldUploadWidget } from 'next-cloudinary';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UploadInfo {
  public_id: string;
  secure_url: string;
  resource_type: string;
}

interface UploadResponse {
  event: 'success';
  info: UploadInfo;
}

export default function UploadPage() {
  const [resource, setResource] = useState<string>('');
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsLoggedIn(true);
    }
  }, [router]);

  if (!isLoggedIn) {
    return <p>Redirecting to login...</p>;
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Media Upload</h1>
          <p className="text-gray-600 mb-8">Upload your photos and videos</p>

          <CldUploadWidget
            uploadPreset="ml_default"
            onUpload={(result, widget) => {
              const error = result?.error;
              if (error) {
                console.error('Upload error:', error);
                return;
              }

              const uploadResult = result as UploadResponse;
              if (!uploadResult || !uploadResult.info) return;

              setResource(uploadResult.info.public_id);
              const info = uploadResult.info;

              // Get JWT token from localStorage
              const token = localStorage.getItem('token');
              if (!token) {
                console.error('No authentication token found');
                return;
              }

              // Send to our backend
              fetch('http://localhost:8080/api/media/upload', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  publicId: info.public_id,
                  url: info.secure_url,
                  type: info.resource_type.toUpperCase(),
                  title: 'Uploaded Media',
                  description: `${info.resource_type.toUpperCase()} uploaded via Cloudinary`,
                }),
              })
                .then((response) => {
                  if (!response.ok) {
                    throw new Error('Failed to save media information');
                  }
                  return response.json();
                })
                .then(() => {
                  console.log('Media upload recorded successfully');
                })
                .catch((error) => {
                  console.error('Error saving media:', error);
                });
            }}
          >
            {({ open }) => (
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => open()}
              >
                Upload Media
              </button>
            )}
          </CldUploadWidget>
        </div>

        {resource && (
          <div className="mt-8">
            <CldImage width="500" height="500" src={resource} sizes="100vw" alt="Uploaded image" />
          </div>
        )}
      </main>
    </div>
  );
}
