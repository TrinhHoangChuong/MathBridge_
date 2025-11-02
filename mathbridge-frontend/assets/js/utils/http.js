// assets/js/utils/http.js
// Utility functions for HTTP requests

/**
 * Make a GET request
 * @param {string} url - API endpoint
 * @param {Object} headers - Optional headers
 * @returns {Promise<Response>}
 */
async function httpGet(url, headers = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: defaultHeaders
    });
    return response;
  } catch (error) {
    console.error('[HTTP] GET error:', error);
    throw error;
  }
}

/**
 * Make a POST request
 * @param {string} url - API endpoint
 * @param {Object} data - Request body
 * @param {Object} headers - Optional headers
 * @returns {Promise<Response>}
 */
async function httpPost(url, data, headers = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(data)
    });
    return response;
  } catch (error) {
    console.error('[HTTP] POST error:', error);
    throw error;
  }
}

/**
 * Make a PUT request
 * @param {string} url - API endpoint
 * @param {Object} data - Request body
 * @param {Object} headers - Optional headers
 * @returns {Promise<Response>}
 */
async function httpPut(url, data, headers = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(data)
    });
    return response;
  } catch (error) {
    console.error('[HTTP] PUT error:', error);
    throw error;
  }
}

/**
 * Make a DELETE request
 * @param {string} url - API endpoint
 * @param {Object} headers - Optional headers
 * @returns {Promise<Response>}
 */
async function httpDelete(url, headers = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: defaultHeaders
    });
    return response;
  } catch (error) {
    console.error('[HTTP] DELETE error:', error);
    throw error;
  }
}

// Expose functions to global scope
window.httpGet = httpGet;
window.httpPost = httpPost;
window.httpPut = httpPut;
window.httpDelete = httpDelete;

