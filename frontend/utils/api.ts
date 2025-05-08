import axios from 'axios';

const apiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
});

// Add a request interceptor to add the auth token
apiInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No auth token found for API request:', config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('Error in API request interceptor:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
apiInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Extract useful information for debugging
    const errorResponse = error.response || {};
    const status = errorResponse.status;
    const url = error.config?.url || 'unknown URL';
    
    // Log detailed error information
    console.error(`API Error (${status}) for ${url}:`, {
      message: error.message,
      data: errorResponse.data,
      headers: error.config?.headers
    });

    if (status === 401) {
      // Handle unauthorized errors (e.g., redirect to login)
      console.error('Unauthorized request. Please log in again.');
      
      // Clear token if it's invalid
      localStorage.removeItem('token');
      
      // Uncomment if you want to auto-redirect to login
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiInstance; 