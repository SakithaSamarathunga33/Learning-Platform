// Direct browser upload to Cloudinary
// No need for server-side Cloudinary package

// Cloud name: drm8wqymd
// Upload preset: ml_default

export const uploadToCloudinary = async (file: File) => {
  const cloudName = 'drm8wqymd'; // Using hardcoded values since they're public anyway
  const uploadPreset = 'ml_default';
  
  console.log('Uploading to Cloudinary with:', {
    cloudName,
    uploadPreset,
    fileType: file.type,
    fileSize: file.size
  });
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'user_profiles');

  try {
    console.log('Sending request to Cloudinary...');
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const responseText = await response.text();
    console.log('Cloudinary response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText
    });

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.status} ${responseText}`);
    }

    const data = JSON.parse(responseText);
    console.log('Cloudinary upload successful:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}; 