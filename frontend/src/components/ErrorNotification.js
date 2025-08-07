import React, { useState, useEffect } from 'react';
import './ErrorNotification.css';

const ErrorNotification = ({ 
  error, 
  onClose, 
  autoClose = true, 
  duration = 5000,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            onClose && onClose();
          }, 300); // Wait for fade out animation
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [error, autoClose, duration, onClose]);

  if (!error) return null;

  const getErrorIcon = (type) => {
    switch (type) {
      case 'auth':
        return '🔐';
      case 'validation':
        return '⚠️';
      case 'network':
        return '🌐';
      case 'server':
        return '⚡';
      case 'fileSize':
        return '📁';
      case 'permission':
        return '🚫';
      case 'notFound':
        return '🔍';
      default:
        return '❌';
    }
  };

  const getErrorType = (error) => {
    if (typeof error === 'object' && error.type) {
      return error.type;
    }
    return 'unknown';
  };

  const getErrorMessage = (error) => {
    if (typeof error === 'string') {
      return error;
    }
    if (typeof error === 'object' && error.message) {
      return error.message;
    }
    return 'An unexpected error occurred.';
  };

  const errorType = getErrorType(error);
  const errorMessage = getErrorMessage(error);
  const errorIcon = getErrorIcon(errorType);

  return (
    <div className={`error-notification ${position} ${isVisible ? 'show' : ''}`}>
      <div className="error-content">
        <div className="error-icon">{errorIcon}</div>
        <div className="error-message">
          <div className="error-title">
            {errorType === 'auth' && 'Authentication Error'}
            {errorType === 'validation' && 'Validation Error'}
            {errorType === 'network' && 'Connection Error'}
            {errorType === 'server' && 'Server Error'}
            {errorType === 'fileSize' && 'File Error'}
            {errorType === 'permission' && 'Permission Error'}
            {errorType === 'notFound' && 'Not Found'}
            {errorType === 'unknown' && 'Error'}
          </div>
          <div className="error-text">{errorMessage}</div>
        </div>
        <button 
          className="error-close" 
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose && onClose(), 300);
          }}
          aria-label="Close error notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ErrorNotification; 