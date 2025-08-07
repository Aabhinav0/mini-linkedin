import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CreatePostModal from './CreatePostModal';

const Navbar = ({ onPostCreated }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleCreatePost = () => {
    setIsCreatePostModalOpen(true);
  };

  const handlePostCreated = (newPost) => {
    // Call the callback to refresh posts
    if (onPostCreated) {
      onPostCreated(newPost);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            Mini LinkedIn
          </Link>
          
          <ul className="navbar-nav">
            <li>
              <Link 
                to="/" 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                🏠 Home
              </Link>
            </li>
            
            {user ? (
              <>
                <li>
                  <Link 
                    to="/network" 
                    className={`nav-link ${location.pathname === '/network' ? 'active' : ''}`}
                  >
                    👥 Network
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/jobs" 
                    className={`nav-link ${location.pathname === '/jobs' ? 'active' : ''}`}
                  >
                    💼 Jobs
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/messaging" 
                    className={`nav-link ${location.pathname === '/messaging' ? 'active' : ''}`}
                  >
                    💬 Messaging
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={handleCreatePost}
                    className="nav-link create-post-btn"
                  >
                    ✏️ Start a post
                  </button>
                </li>
                <li>
                  <Link 
                    to="/profile" 
                    className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
                  >
                    👤 Profile
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="nav-link logout">
                    🚪 Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link 
                    to="/login" 
                    className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                  >
                    🔑 Login
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/register" 
                    className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}
                  >
                    📝 Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <CreatePostModal 
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </>
  );
};

export default Navbar; 