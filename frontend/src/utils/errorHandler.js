// Error handling utility for frontend
export const handleApiError = (error) => {
  // Log error for debugging (but don't expose to user)
  console.error('API Error:', {
    message: error.message,
    status: error.response?.status,
    url: error.config?.url,
    method: error.config?.method,
    timestamp: new Date().toISOString()
  });

  // Handle network errors
  if (!error.response) {
    return {
      message: 'Network error. Please check your connection and try again.',
      type: 'network'
    };
  }

  const { status, data } = error.response;

  // Handle different HTTP status codes
  switch (status) {
    case 400:
      return {
        message: data?.message || 'Invalid request. Please check your input and try again.',
        type: 'validation'
      };
    
    case 401:
      return {
        message: data?.message || 'Authentication failed. Please login again.',
        type: 'auth'
      };
    
    case 403:
      return {
        message: 'You do not have permission to perform this action.',
        type: 'permission'
      };
    
    case 404:
      return {
        message: data?.message || 'The requested resource was not found.',
        type: 'notFound'
      };
    
    case 409:
      return {
        message: data?.message || 'This resource already exists.',
        type: 'conflict'
      };
    
    case 413:
      return {
        message: 'File size too large. Please select a smaller file.',
        type: 'fileSize'
      };
    
    case 422:
      return {
        message: data?.message || 'Invalid data provided. Please check your input.',
        type: 'validation'
      };
    
    case 429:
      return {
        message: 'Too many requests. Please wait a moment and try again.',
        type: 'rateLimit'
      };
    
    case 500:
      return {
        message: 'Server error. Please try again later.',
        type: 'server'
      };
    
    case 502:
    case 503:
    case 504:
      return {
        message: 'Service temporarily unavailable. Please try again later.',
        type: 'server'
      };
    
    default:
      return {
        message: 'An unexpected error occurred. Please try again.',
        type: 'unknown'
      };
  }
};

// Validation error handler
export const handleValidationError = (errors) => {
  if (Array.isArray(errors)) {
    return errors.map(error => error.msg || error.message).join(', ');
  }
  
  if (typeof errors === 'object') {
    return Object.values(errors).map(error => error.message || error).join(', ');
  }
  
  return 'Please check your input and try again.';
};

// File upload error handler
export const handleFileError = (error) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return 'File size too large. Please select a smaller image (max 5MB).';
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return 'Too many files. Please select only one image.';
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return 'Unexpected file field. Please check your form.';
  }
  
  return 'File upload error. Please try again.';
};

// Network error handler
export const handleNetworkError = (error) => {
  if (error.code === 'NETWORK_ERROR') {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please try again.';
  }
  
  return 'Connection error. Please try again.';
};

// Generic error handler
export const handleGenericError = (error) => {
  // If it's already a user-friendly message, return it
  if (typeof error === 'string') {
    return error;
  }
  
  // If it's an API error, use the API error handler
  if (error.response) {
    return handleApiError(error);
  }
  
  // If it's a network error
  if (!error.response && error.request) {
    return handleNetworkError(error);
  }
  
  // Default fallback
  return {
    message: 'An unexpected error occurred. Please try again.',
    type: 'unknown'
  };
}; 