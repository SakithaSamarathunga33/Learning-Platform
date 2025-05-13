import axios from 'axios';

// Create a reusable function to get the token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token;
};

// Setup axios instance with base URL
const apiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
});

// Add a request interceptor to add the auth token
apiInstance.interceptors.request.use(
  (config) => {
    // Get token fresh on each request (in case it changed)
    const token = getAuthToken();
    
    // If token exists, add it to the headers
    if (token) {
      // Spring Security expects the 'Bearer ' prefix
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url} - Token present`);
      
      // For debugging: show a bit of the token
      console.log(`Token starts with: ${token.substring(0, 15)}...`);
    } else {
      console.warn(`API Request: ${config.method?.toUpperCase()} ${config.url} - No auth token found!`);
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
    console.log(`API Response: ${response.status} from ${response.config.url}`);
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
      
      // Check if we still have a token that's not being accepted
      if (getAuthToken()) {
        console.error('Token exists but was rejected. It may be expired or invalid.');
        
        // For debugging, log part of the token
        const token = getAuthToken();
        if (token) {
          console.log(`Rejected token starts with: ${token.substring(0, 15)}...`);
        }
        
        // Clear token if it's invalid
        localStorage.removeItem('token');
        
        // Dispatch event so other components can react to this
        window.dispatchEvent(new Event('tokenInvalid'));
      }
      
      // Uncomment if you want to auto-redirect to login
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiInstance; 