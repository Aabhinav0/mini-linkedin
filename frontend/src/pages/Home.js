import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { handleGenericError } from '../utils/errorHandler';
import ErrorNotification from '../components/ErrorNotification';
import CreatePostModal from '../components/CreatePostModal';

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalLikes: 0
  });

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, []);

  const fetchPosts = async () => {
    try {
      setError('');
      const response = await api.get('/api/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Fetch posts error:', error);
      const errorResult = handleGenericError(error);
      const errorMessage = typeof errorResult === 'string' ? errorResult : errorResult.message;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/posts');
      const allPosts = response.data;
      const totalLikes = allPosts.reduce((sum, post) => sum + post.likes.length, 0);
      
      setStats({
        totalPosts: allPosts.length,
        totalUsers: new Set(allPosts.map(post => post.author._id)).size,
        totalLikes: totalLikes
      });
    } catch (error) {
      console.error('Fetch stats error:', error);
      setStats({
        totalPosts: 0,
        totalUsers: 0,
        totalLikes: 0
      });
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
        fetchStats();
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

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      setError('');
      const response = await api.delete(`/api/posts/${postId}`);
      
      if (response.data.success) {
        setPosts(posts.filter(post => post._id !== postId));
        fetchStats();
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

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    fetchStats();
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
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <ErrorNotification 
        error={error} 
        onClose={() => setError('')}
        position="top-right"
      />
      
      {/* Simple Header Section */}
      <div className="home-header">
        <div className="container">
          <div className="header-content">
            <div className="header-text">
              <h1>Professional Network</h1>
              <p>Connect, share, and grow with professionals</p>
            </div>
            {!user && (
              <div className="header-actions">
                <Link to="/register" className="btn-primary">Join Now</Link>
                <Link to="/login" className="btn-secondary">Sign In</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        <div className="home-layout">
          {/* Left Side - Posts */}
          <div className="main-content">
            <div className="content-header">
              <h2>Recent Posts</h2>
              {user && (
                <button className="create-post-btn" onClick={() => setShowCreateModal(true)}>
                  Create Post
                </button>
              )}
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading posts...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <p>Error loading posts: {error}</p>
                <button className="retry-btn" onClick={fetchPosts}>
                  Try Again
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="empty-state">
                <h3>No posts yet</h3>
                <p>Be the first to share something with your network!</p>
                <button className="create-first-post-btn" onClick={() => setShowCreateModal(true)}>
                  Create Your First Post
                </button>
              </div>
            ) : (
              <div className="posts-list">
                {posts.map((post) => (
                  <div key={post._id} className="post-card">
                    <div className="post-header">
                      <div className="post-author">
                        <div className="author-avatar">
                          <div className="avatar-fallback">
                            {getInitials(post.author.name)}
                          </div>
                        </div>
                        <div className="author-info">
                          <div className="author-name">{post.author.name}</div>
                          <div className="post-date">{formatDate(post.createdAt)}</div>
                        </div>
                      </div>
                      {user && post.author._id === user._id && (
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeletePost(post._id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    <div className="post-content">
                      <p className="post-text">{post.content}</p>
                      {post.image && (
                        <div className="post-image">
                          <img src={post.image} alt="Post" />
                        </div>
                      )}
                    </div>

                    <div className="post-actions">
                      <button 
                        className={`like-btn ${post.likes?.includes(user?._id) ? 'liked' : ''}`}
                        onClick={() => handleLike(post._id)}
                      >
                        Like ({post.likes?.length || 0})
                      </button>
                      <button className="comment-btn">
                        Comment ({post.comments?.length || 0})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Sidebar */}
          <div className="sidebar-right">
            <div className="sidebar-card">
              <h3>Quick Actions</h3>
              <button className="action-btn primary" onClick={() => setShowCreateModal(true)}>
                Create Post
              </button>
              <button className="action-btn">
                Find Connections
              </button>
              <button className="action-btn">
                Job Search
              </button>
            </div>

            <div className="sidebar-card">
              <h3>Network Stats</h3>
              <div className="stat-item">
                <span className="stat-number">{stats.totalUsers}</span>
                <span className="stat-label">Members</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.totalPosts}</span>
                <span className="stat-label">Posts</span>
              </div>
            </div>

            <div className="sidebar-card">
              <h3>Trending</h3>
              <div className="trending-item">
                <span className="trending-tag">#Technology</span>
                <span className="trending-count">1.2K posts</span>
              </div>
              <div className="trending-item">
                <span className="trending-tag">#Innovation</span>
                <span className="trending-count">856 posts</span>
              </div>
              <div className="trending-item">
                <span className="trending-tag">#Leadership</span>
                <span className="trending-count">642 posts</span>
              </div>
            </div>

            <div className="sidebar-card">
              <h3>Community</h3>
              <div className="community-stats">
                <div className="stat-item">
                  <span className="stat-number">{stats.totalLikes}</span>
                  <span className="stat-label">Total Likes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default Home; 