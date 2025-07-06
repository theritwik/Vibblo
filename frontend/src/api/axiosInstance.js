import axios from 'axios';

// Create an Axios instance with default headers
const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_API}/api`, // Set the base URL for your API
});

// Add a request interceptor to include the auth-token
// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message = error.response.data?.message || 
                     error.response.data?.error || 
                     error.response.statusText || 
                     'Something went wrong';
                     
      return Promise.reject({
        ...error,
        response: {
          ...error.response,
          data: { message }
        }
      });
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject({
        response: {
          data: {
            message: 'No response from server. Please check your internet connection.'
          }
        }
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject({
        response: {
          data: {
            message: 'Error setting up the request.'
          }
        }
      });
    }
  }
);

// Add request interceptor to include the auth-token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the auth-token from localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['auth-token'] = token; // Set the token in the request headers
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
