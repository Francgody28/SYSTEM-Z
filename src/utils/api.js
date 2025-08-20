import axios from 'axios';
import { API_BASE } from "../config";

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || API_BASE,
  withCredentials: true, // Important: this allows cookies to be sent with requests
});

// Function to get CSRF token and set it up for future requests
export const setupCSRF = async () => {
  try {
    await api.get('/api/get-csrf-token/');
    // After this call, the CSRF cookie will be set in the browser
  } catch (error) {
    console.error('Error setting up CSRF token:', error);
  }
};

// Get CSRF token from cookies (keeping for compatibility)
export const getCSRFToken = () => {
  const match = document.cookie.match(/(^|;\s*)csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[2]) : "";
};

// Add an interceptor to include the CSRF token in all requests
api.interceptors.request.use(config => {
  // Get CSRF token from cookie
  const csrfToken = getCSRFToken();
  
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  
  return config;
});

// API functions for user operations - updated to use axios
export const updateUser = async (userId, userData) => {
  try {
    console.log('Updating user:', userId, 'with data:', userData);
    const response = await api.patch(`/api/users/${userId}/`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    console.error('Response data:', error.response?.data);
    console.error('Response status:', error.response?.status);
    console.error('Response headers:', error.response?.headers);
    
    // Handle HTML error responses (like Django debug pages)
    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
      // Extract title from HTML for a cleaner error message
      const titleMatch = error.response.data.match(/<title>(.*?)<\/title>/);
      const errorTitle = titleMatch ? titleMatch[1] : 'Server Error';
      throw new Error(`Server Error: ${errorTitle}`);
    }
    
    // Provide more detailed error information for JSON responses
    if (error.response?.data) {
      throw new Error(error.response.data.detail || error.response.data.message || JSON.stringify(error.response.data));
    }
    
    throw new Error(error.message || 'Update failed');
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/api/users/${userId}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getUsers = async () => {
  try {
    const response = await api.get('/api/users/');
    return response.data;
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

// For backward compatibility
export const fetchCSRFToken = setupCSRF;

// Legacy apiRequest function - only use for transition
export const apiRequest = async (url, method = "GET", data = null) => {
  try {
    const config = {};
    if (data) config.data = data;
    
    const response = await api.request({
      url,
      method,
      ...config
    });
    
    return response.data;
  } catch (error) {
    console.error(`Request failed: ${error.message}`);
    throw error;
  }
};

// Add these functions to your existing api.js file

export const createUser = async (userData) => {
  try {
    console.log('Creating user with data:', userData);
    const response = await api.post('/api/users/', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    console.error('Response data:', error.response?.data);
    console.error('Response status:', error.response?.status);
    
    // Handle HTML error responses
    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
      const titleMatch = error.response.data.match(/<title>(.*?)<\/title>/);
      const errorTitle = titleMatch ? titleMatch[1] : 'Server Error';
      throw new Error(`Server Error: ${errorTitle}`);
    }
    
    // Provide more detailed error information for JSON responses
    if (error.response?.data) {
      throw new Error(error.response.data.detail || error.response.data.message || JSON.stringify(error.response.data));
    }
    
    throw new Error(error.message || 'Registration failed');
  }
};

// Update the existing updateUser function to handle user registration updates
export const updateUserProfile = async (userId, userData) => {
  try {
    console.log('Updating user profile:', userId, 'with data:', userData);
    const response = await api.patch(`/api/users/${userId}/`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    console.error('Response data:', error.response?.data);
    console.error('Response status:', error.response?.status);
    
    // Handle HTML error responses
    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
      const titleMatch = error.response.data.match(/<title>(.*?)<\/title>/);
      const errorTitle = titleMatch ? titleMatch[1] : 'Server Error';
      throw new Error(`Server Error: ${errorTitle}`);
    }
    
    // Provide more detailed error information for JSON responses
    if (error.response?.data) {
      throw new Error(error.response.data.detail || error.response.data.message || JSON.stringify(error.response.data));
    }
    
    throw new Error(error.message || 'Update failed');
  }
};

export default api;