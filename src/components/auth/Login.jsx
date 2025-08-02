import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from './UseAuth';
import './Login.css';
import { AuthContext } from './AuthProvider';

const Login = () => {
  const [formData, setFormData] = useState({
    userEmail: '',
    userPassword: '',
    rememberMe: false
  });
  const { login } = useContext(AuthContext);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.userEmail) {
      newErrors.userEmail = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.userEmail)) {
      newErrors.userEmail = 'Please enter a valid email';
    }

    if (!formData.userPassword) {
      newErrors.userPassword = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('https://themasterjacketsbackend-production.up.railway.app/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: formData.userEmail,
          userPassword: formData.userPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.data.token) {
        // console.log('Form Data:', formData);
        // console.log('Login successful:', data , data.data.token);
        const userObj = {
          token: data.data.token,
          uid: data.data.user._id,
          contactNo: data.data.user.contactNo,
          userName: data.data.user.userName,
          userEmail: data.data.user.email,
        };
        login(userObj);
        navigate('/dashboard');
      } else {
        setErrors({ form: data.message || 'Invalid credentials' });
      }
    } catch (error) {
      setErrors({ form: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>Welcome Back</h1>
        <p>Sign in to your account to continue</p>
      </div>

      {errors.form && (
        <div className="auth-error">
          <svg className="auth-error-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p>{errors.form}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="userEmail">Email Address *</label>
          <input
            id="userEmail"
            name="userEmail"
            type="email"
            value={formData.userEmail}
            onChange={handleChange}
            className={errors.userEmail ? 'error' : ''}
            placeholder="Enter your email"
          />
          {errors.userEmail && <span className="error-message">{errors.userEmail}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="userPassword">Password *</label>
          <div className="password-input-container">
            <input
              id="userPassword"
              name="userPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.userPassword}
              onChange={handleChange}
              className={errors.userPassword ? 'error' : ''}
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <svg className="password-toggle-icon" viewBox="0 0 20 20" fill="currentColor">
                {showPassword ? (
                  <>
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </>
                ) : (
                  <>
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </>
                )}
              </svg>
            </button>
          </div>
          {errors.userPassword && <span className="error-message">{errors.userPassword}</span>}
        </div>

        <div className="form-options">
          <div className="remember-me">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            <label htmlFor="rememberMe" className='label-login'>Remember me</label>
          </div>
          <Link to="/forgot-password" className="forgot-password">
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="auth-button" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <svg className="auth-spinner" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
              </svg>
              Loging In...
            </>
          ) : 'Sign In'}
        </button>
      </form>

      <div className="auth-footer">
        <p>Don't have an account? <Link to="/auth/signup">Sign up</Link></p>
      </div>
    </div>
  );
};

export default Login;