import React, { useState } from 'react';
import api from '../utils/api';
import { handleGenericError } from '../utils/errorHandler';
import ErrorNotification from './ErrorNotification';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');

    // Validate form
    if (!title.trim()) {
      setError('Please enter a title for your post.');
      return;
    }

    if (!content.trim()) {
      setError('Please enter some content for your post.');
      return;
    }

    setPosting(true);

    try {
      const response = await api.post('/api/posts', {
        title: title.trim(),
        content: content.trim()
      });

      if (response.data.success) {
        // Reset form
        setTitle('');
        setContent('');
        setError('');

        // Close modal and notify parent
        onClose();
        onPostCreated(response.data.post);
      } else {
        setError(response.data.message || 'Failed to create post.');
      }
    } catch (error) {
      console.error('Create post error:', error);
      
      const errorResult = handleGenericError(error);
      const errorMessage = typeof errorResult === 'string' ? errorResult : errorResult.message;
      setError(errorMessage);
    } finally {
      setPosting(false);
    }
  };

  const handleClose = () => {
    if (!posting) {
      setTitle('');
      setContent('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <ErrorNotification 
        error={error} 
        onClose={() => setError('')}
        position="top-center"
        autoClose={false}
      />
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Post</h2>
          <button
            className="modal-close"
            onClick={handleClose}
            disabled={posting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
              className="form-input"
              maxLength="100"
              required
              disabled={posting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Description *</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="form-textarea"
              rows="4"
              maxLength="1000"
              required
              disabled={posting}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={posting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={posting || !title.trim() || !content.trim()}
            >
              {posting ? <span className="spinner"></span> : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal; 