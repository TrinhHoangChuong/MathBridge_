// file: portal/assets/js/utils/http.js
// Simple HTTP utility functions for API calls

import { CONFIG } from '../config.js';
import { getToken } from './auth.js';

/**
 * Make an authenticated HTTP request
 * @param {string} endpoint - API endpoint (e.g., '/api/portal/student/dashboard')
 * @param {Object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<any>} Response data
 */
export async function httpRequest(endpoint, options = {}) {
  const token = getToken();
  
  if (!token) {
    throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
  }

  const baseUrl = CONFIG?.BASE_URL || 'http://localhost:8080';
  const url = `${baseUrl}${endpoint}`;

  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    },
    ...(options.body && { 
      body: typeof options.body === 'string' 
        ? options.body 
        : JSON.stringify(options.body) 
    })
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('mb_auth');
      localStorage.removeItem('mb_token');
      window.location.href = '../../pages/login.html';
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
    const errorData = await response.json().catch(() => ({ 
      message: `HTTP error! Status: ${response.status}` 
    }));
    throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
  }

  return await response.json();
}

/**
 * GET request
 */
export async function httpGet(endpoint) {
  return httpRequest(endpoint, { method: 'GET' });
}

/**
 * POST request
 */
export async function httpPost(endpoint, data) {
  return httpRequest(endpoint, { 
    method: 'POST', 
    body: data 
  });
}

/**
 * PUT request
 */
export async function httpPut(endpoint, data) {
  return httpRequest(endpoint, { 
    method: 'PUT', 
    body: data 
  });
}

/**
 * DELETE request
 */
export async function httpDelete(endpoint) {
  return httpRequest(endpoint, { method: 'DELETE' });
}

