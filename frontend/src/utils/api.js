const BASE_URL = 'http://localhost:3000';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  // Set credentials to 'include' for cookie support
  options.credentials = 'include';
  
  const token = sessionStorage.getItem('token');
  if (token) {
    options.headers = {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };
  }
  
  if (options.body && !(options.body instanceof FormData)) {
    options.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, options);

  if (response.status === 401) {
    // Session expired or unauthorized - clear user session if any
    // We can handle this logic or dispatch an event
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || 'Unauthorized');
    error.status = 401;
    throw error;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || 'Something went wrong');
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  return response.json();
}

export const api = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
  
  // Custom upload helper since it uses FormData
  upload: (endpoint, formData, options = {}) => {
    return request(endpoint, {
      ...options,
      method: 'POST',
      body: formData, // fetch will set boundary headers automatically for FormData
    });
  }
};
