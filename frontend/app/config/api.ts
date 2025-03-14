export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const ENDPOINTS = {
  UPLOAD: `${API_URL}/api/files/upload`,
  USERS: `${API_URL}/api/users`,
  AUTH: `${API_URL}/api/auth`,
} as const;

export const getImageUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
};
