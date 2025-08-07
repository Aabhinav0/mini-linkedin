import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { handleGenericError } from '../utils/errorHandler';
import ErrorNotification from '../components/ErrorNotification';

const Profile = () => {
  const { user, updateProfile, refreshUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      await refreshUser();
      if (user) {
        fetchUserPosts();
        setFormData({
          name: user.name,
          bio: user.bio || ''
        });
      }
    };
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserPosts = async () => {
    try {
      setError('');
      const response = await api.get(`/api/users/${user._id}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Fetch user posts error:', error);
      const errorResult = handleGenericError(error);
      const errorMessage = typeof errorResult === 'string' ? errorResult : errorResult.message;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const result = await updateProfile(formData.name, formData.bio);
    
    if (result.success) {
      setEditing(false);
    } else {
      setError(result.message);
    }
    
    setSaving(false);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      setError('');
      const response = await api.delete(`/api/posts/${postId}`);
      
      if (response.data.success) {
        setPosts(posts.filter(post => post._id !== postId));
      } else {
        setError(response.data.message || 'Failed to delete post.');
      }
    } catch (error) {
      console.error('Delete post error:', error);
      const errorResult = handleGenericError(error);
      const errorMessage = typeof errorResult === 'string' ? errorResult : errorResult.message;
      setError(errorMessage);
    }
  };

  const handleLike = async (postId) => {
    try {
      setError('');
      const response = await api.put(`/api/posts/${postId}/like`);
      
      if (response.data.success) {
        setPosts(posts.map(post => 
          post._id === postId ? response.data.post : post
        ));
      } else {
        setError(response.data.message || 'Failed to like post.');
      }
    } catch (error) {
      console.error('Like post error:', error);
      const errorResult = handleGenericError(error);
      const errorMessage = typeof errorResult === 'string' ? errorResult : errorResult.message;
      setError(errorMessage);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page-linkedin">
      <ErrorNotification 
        error={error} 
        onClose={() => setError('')}
        position="top-right"
      />

      {/* Cover Photo Section */}
      <div className="profile-cover">
        <div className="cover-photo">
          <div className="cover-overlay"></div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="profile-header-linkedin">
        <div className="profile-avatar-linkedin">
          {getInitials(user.name)}
        </div>
        
        <div className="profile-info-linkedin">
          {editing ? (
            <form onSubmit={handleSubmit} className="profile-edit-form-linkedin">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="bio" className="form-label">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Tell us about yourself..."
                  maxLength="500"
                  rows="3"
                />
              </div>
              
              <div className="profile-edit-actions-linkedin">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? <span className="spinner"></span> : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: user.name,
                      bio: user.bio || ''
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="profile-name-linkedin">{user.name}</h1>
              <p className="profile-email-linkedin">{user.email}</p>
              {user.bio && <p className="profile-bio-linkedin">{user.bio}</p>}
              <div className="profile-stats-linkedin">
                <div className="stat-item-linkedin">
                  <span className="stat-number-linkedin">{posts.length}</span>
                  <span className="stat-label-linkedin">Posts</span>
                </div>
                <div className="stat-item-linkedin">
                  <span className="stat-number-linkedin">0</span>
                  <span className="stat-label-linkedin">Connections</span>
                </div>
                <div className="stat-item-linkedin">
                  <span className="stat-number-linkedin">0</span>
                  <span className="stat-label-linkedin">Views</span>
                </div>
              </div>
              <div className="profile-actions-linkedin">
                <button 
                  onClick={() => setEditing(true)}
                  className="btn btn-outline edit-profile-btn-linkedin"
                >
                  Edit Profile
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="profile-content-linkedin">
        <div className="profile-sidebar">
          <div className="sidebar-card">
            <h3>About</h3>
            <p>{user.bio || 'No bio added yet.'}</p>
            <button 
              onClick={() => setEditing(true)}
              className="btn btn-text"
            >
              Edit
            </button>
          </div>

          <div className="sidebar-card">
            <h3>Activity</h3>
            <div className="activity-item">
              <span className="activity-icon"></span>
              <span>{posts.length} posts published</span>
            </div>
            <div className="activity-item">
              <span className="activity-icon"></span>
              <span>0 connections made</span>
            </div>
          </div>
        </div>

        <div className="profile-main">
          {/* Posts Section with Single Toggle Button */}
          <div className="posts-section-linkedin">
            <div className="posts-header-with-toggle">
              <h2 className="section-title-linkedin">
                {showAllPosts ? 'All My Posts' : 'Recent Posts'} ({posts.length})
              </h2>
              {posts.length > 0 && (
                <button 
                  onClick={() => setShowAllPosts(!showAllPosts)}
                  className="btn btn-primary toggle-posts-btn-linkedin"
                >
                  {showAllPosts ? 'Hide Posts' : 'View All Posts'}
                </button>
              )}
            </div>
            
            {posts.length === 0 ? (
              <div className="empty-posts-linkedin">
                <h3>No Posts Yet</h3>
                <p>You haven't posted anything yet. Start sharing your thoughts!</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="btn btn-primary"
                >
                  Create Your First Post
                </button>
              </div>
            ) : showAllPosts ? (
              <div className="posts-grid">
                {posts.map(post => (
                  <div key={post._id} className="post-container">
                    <div className="post-header">
                      <div className="create-post-avatar">
                        {getInitials(post.author.name)}
                      </div>
                      <div>
                        <Link to={`/user/${post.author._id}`} className="post-author">
                          {post.author.name}
                        </Link>
                        <span className="post-timestamp">
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="btn btn-danger delete-post-btn"
                      >
                        Delete
                      </button>
                    </div>
                    
                    <div className="post-title">
                      {post.title}
                    </div>
                    
                    <div className="post-content">
                      {post.content}
                    </div>
                    
                    <img 
                      src={`http://localhost:5000${post.image}`} 
                      alt="Post" 
                      className="post-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    
                    <div className="post-actions">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`post-action ${post.likes.includes(user._id) ? 'liked' : ''}`}
                      >
                        {post.likes.includes(user._id) ? 'Liked' : 'Like'} 
                        {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="posts-preview-grid-linkedin">
                {posts.slice(0, 3).map(post => (
                  <div key={post._id} className="post-preview-card-linkedin">
                    <div className="post-preview-header-linkedin">
                      <div className="create-post-avatar small">
                        {getInitials(post.author.name)}
                      </div>
                      <div>
                        <span className="post-author">{post.author.name}</span>
                        <span className="post-timestamp">{formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                    <div className="post-preview-title-linkedin">{post.title}</div>
                    <div className="post-preview-content-linkedin">{post.content.substring(0, 100)}...</div>
                    <img 
                      src={`http://localhost:5000${post.image}`} 
                      alt="Post" 
                      className="post-preview-image-linkedin"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 