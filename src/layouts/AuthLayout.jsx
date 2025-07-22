import { Outlet, Link } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-box">
          <div className="logo-wrap">
            <Link to="/">
              <img
                src="https://res.cloudinary.com/dekf5dyng/image/upload/v1752742536/official_tmj_logo_jygsft.png"
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
