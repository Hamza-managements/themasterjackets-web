import { Outlet, Link, Navigate } from 'react-router-dom';
import './AuthLayout.css';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

const AuthLayout = () => {
  const { user } = useContext(AuthContext);
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-box">
          <div className="logo-wrap">
            <Link to="/">
              <img
                src="https://res.cloudinary.com/dvmpyh0hj/image/upload/v1760615184/hilkmru9zutcneybpwwc.png"
                alt="Master Jackets"
                className="logo-img"
              />
            </Link>
          </div>

          <Outlet />
        </div>
      </div>

      <footer className="auth-footer">
        © {new Date().getFullYear()}{' '}
        <Link to="/" className="footer-brand">The Master Jackets</Link>. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout;
