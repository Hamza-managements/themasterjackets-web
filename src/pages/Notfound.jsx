import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './styles/NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(10);
  const [suggestedPages, setSuggestedPages] = useState([]);
  const timerRef = useRef(null);

  // Common pages that might be relevant
  const commonPages = [
    { path: '/', name: 'Home' },
    { path: "/return-exchange", name: "Return Exchange" },
    { path: '/about', name: 'About Us' },
    { path: '/contact-us', name: 'Contact' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/admin-dashboard', name: 'Admin Dashboard' },
    { path: '/auth/signup', name: 'Sign up' },
    { path: '/auth/login', name: 'Log in' },
    { path: '/forgot-password', name: 'Forgot password' },
    { path: '/checkout', name: 'Checkout' },
    // { path: '/blog', name: 'Blog' },
    // { path: '/products', name: 'Products' },
    // { path: '/services', name: 'Services' },
  ];

  useEffect(() => {
    const invalidPath = location.pathname.toLowerCase();
    const suggestions = commonPages.filter(page =>
      page.path.toLowerCase().includes(invalidPath.split('/')[1]) ||
      page.name.toLowerCase().includes(invalidPath.split('/')[1])
    );
    setSuggestedPages(suggestions.slice(0, 3));
  }, [location]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [navigate]);

  useEffect(() => {
    console.log(`404 Error - Path not found: ${location.pathname}`);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.search.value.trim();
    if (searchTerm) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const stopCountdown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setCountdown(0);
    }
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-graphic">
          <div className="error-number">4</div>
          <div className="error-number">0</div>
          {/* <div className="error-icon">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" />
              <path d="M30,30 L70,70 M30,70 L70,30" stroke="currentColor" strokeWidth="8" />
            </svg>
          </div> */}
          <div className="error-number">4</div>
        </div>

        <h1 className='not-found-h1'>Page Not Found</h1>
        <p className="error-message-not">
          The page <code>{location.pathname}</code> doesn't exist or has been moved.
        </p>

        {suggestedPages.length > 0 && (
          <div className="suggestions">
            <h3>Were you looking for one of these?</h3>
            <ul>
              {suggestedPages.map((page, index) => (
                <li key={index}>
                  <button className='button' onClick={() => {
                    stopCountdown();
                    navigate(page.path);
                  }}>
                    {page.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="action-section">
          <button
            className="primary-button button"
            onClick={() => {
              stopCountdown();
              navigate('/');
            }}
          >
            Go to Homepage
          </button>

          <button
            className="secondary-button button"
            onClick={() => {
              stopCountdown();
              window.history.back();
            }}
          >
            Go Back
          </button>
        </div>

        <div className="search-section">
          <p>Or try searching for what you need:</p>
          <form onSubmit={handleSearch}>
            <div className="search-input">
              <input
                type="text"
                name="search"
                placeholder="Search our site..."
                autoFocus
              />
              <button type="submit">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </button>
            </div>
          </form>
        </div>


        {countdown > 0 && (
          <div className="countdown">
            <p>You'll be automatically redirected to the homepage in {countdown} seconds.</p>
            <button
              className="text-button-cancel"
              onClick={stopCountdown}
            >
              Cancel redirect
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotFound;