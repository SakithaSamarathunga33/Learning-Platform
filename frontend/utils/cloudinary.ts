// Direct browser upload to Cloudinary
// No need for server-side Cloudinary package

// Cloud name: drm8wqymd
// Upload preset: ml_default

// List of allowed image extensions
const ALLOWED_FILE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Validate file before upload
const validateFile = (file: File): { valid: boolean; message?: string } => {
  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    return { valid: false, message: 'Only image files are allowed' };
  }

  // Check file extension
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
      message: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` 
    };
  }

  return { valid: true };
};

export const uploadToCloudinary = async (file: File) => {
  const cloudName = 'drm8wqymd'; // Using hardcoded values since they're public anyway
  const uploadPreset = 'ml_default';
  
  console.log('Uploading to Cloudinary with:', {
    cloudName,
    uploadPreset,
    fileType: file.type,
    fileSize: file.size
  });

  // Validate file before upload
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.message);
  }
  
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