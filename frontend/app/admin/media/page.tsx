'use client';

import MediaUpload from '@/components/MediaUpload';

export default function MediaPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Media Management</h1>
      <MediaUpload />
    </div>
  );
}
