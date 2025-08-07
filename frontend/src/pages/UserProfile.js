import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { handleGenericError } from '../utils/errorHandler';
import ErrorNotification from '../components/ErrorNotification';

const UserProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setError('');
        setLoading(true);
        
        const [userResponse, postsResponse] = await Promise.all([
          api.get(`/api/users/${id}`),
          api.get(`/api/users/${id}/posts`)
        ]);
        
        setUserData(userResponse.data);
        setPosts(postsResponse.data);
      } catch (error) {
        console.error('Fetch user data error:', error);
        const errorResult = handleGenericError(error);
        const errorMessage = typeof errorResult === 'string' ? errorResult : errorResult.message;
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id]);

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

  if (error || !userData) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <ErrorNotification 
          error={error || 'User not found'} 
          onClose={() => setError('')}
          position="top-center"
          autoClose={false}
        />
        <div className="error-page">
          <div className="error-icon">👤</div>
          <h2>User Not Found</h2>
          <p>The user you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="btn btn-primary">
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <ErrorNotification 
        error={error} 
        onClose={() => setError('')}
        position="top-right"
      />
      <div className="profile-header">
        <div className="profile-avatar">
          {getInitials(userData.name)}
        </div>
        
        <div className="profile-info">
          <h1 className="profile-name">{userData.name}</h1>
          <p className="profile-email">{userData.email}</p>
          {userData.bio && <p className="profile-bio">{userData.bio}</p>}
          {posts.length > 0 && (
            <div className="profile-actions">
              <button 
                onClick={() => setShowAllPosts(!showAllPosts)}
                className="btn btn-primary view-posts-btn"
              >
                {showAllPosts ? '📋 Hide Posts' : '📋 View All Posts'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-main">
          {/* Posts Section with Toggle Button */}
          <div className="posts-section-linkedin">
            <div className="posts-header-with-toggle">
              <h2 className="section-title-linkedin">
                {showAllPosts ? `${userData.name}'s Posts` : `${userData.name}'s Recent Posts`} ({posts.length})
              </h2>
              {posts.length > 0 && (
                <button 
                  onClick={() => setShowAllPosts(!showAllPosts)}
                  className="btn btn-primary toggle-posts-btn-linkedin"
                >
                  {showAllPosts ? '📋 Hide Posts' : '📋 View All Posts'}
                </button>
              )}
            </div>
            
            {posts.length === 0 ? (
              <div className="empty-posts-linkedin">
                <div className="empty-posts-icon">📝</div>
                <h3>No Posts Yet</h3>
                <p>{userData.name} hasn't posted anything yet.</p>
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
                    
                    {user && (
                      <div className="post-actions">
                        <button
                          onClick={() => handleLike(post._id)}
                          className={`post-action ${post.likes.includes(user._id) ? 'liked' : ''}`}
                        >
                          {post.likes.includes(user._id) ? '❤️' : '🤍'} 
                          {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
                        </button>
                      </div>
                    )}
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
  );
};

export default UserProfile; 