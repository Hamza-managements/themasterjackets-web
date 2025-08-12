import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import ReCAPTCHA from 'react-google-recaptcha';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [errors, setErrors] = useState({});
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();

  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate inputs
    const validationErrors = {};
    if (!email) validationErrors.email = 'Email is required';
    else if (!validateEmail(email)) validationErrors.email = 'Please enter a valid email';
    if (!recaptchaToken) validationErrors.recaptcha = 'Please complete the CAPTCHA';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('https://your-backend.com/api/user/forgot-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Captcha-Token': recaptchaToken
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSubmitted(true);
        Swal.fire({
          title: 'Success!',
          text: data.message || 'Password reset link sent to your email',
          icon: 'success',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      } else {
        throw new Error(data.message || 'Failed to send reset link');
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#4361ee'
      });
      // Reset CAPTCHA on error
      recaptchaRef.current.reset();
      setRecaptchaToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-redirect if already submitted
  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => navigate('/auth/login'), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, navigate]);

  return (
    <motion.div 
      className="forgot-password-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="forgot-password-card">
        {/* Back button */}
        <button 
          className="back-button"
          onClick={() => navigate('/auth/login')}
          aria-label="Back to login"
        >
          <FiArrowLeft size={20} />
        </button>

        {!isSubmitted ? (
          <>
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="logo-container">
                <img src="https://res.cloudinary.com/dekf5dyng/image/upload/v1752742536/official_tmj_logo_jygsft.png" alt="Company Logo" className="logo" />
              </div>
              <h1 className="title">Forgot Password?</h1>
              <p className="subtitle">
                Enter your email and we'll send you a link to reset your password
              </p>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className={`input-group ${errors.email ? 'error' : ''}`}>
                <div className="input-icon">
                  <FiMail />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  className={errors.email ? 'error' : ''}
                  autoFocus
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="recaptcha-container">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                  onChange={(token) => setRecaptchaToken(token)}
                  onExpired={() => setRecaptchaToken(null)}
                  onErrored={() => setRecaptchaToken(null)}
                />
                {errors.recaptcha && (
                  <span className="error-message">{errors.recaptcha}</span>
                )}
              </div>

              <button 
                type="submit" 
                className="forgot-password-submit-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="spinner"></div>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </motion.form>
          </>
        ) : (
          <motion.div
            className="success-message"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <FiCheckCircle size={60} className="success-icon" />
            <h2>Check Your Email</h2>
            <p>
              We've sent a password reset link to <strong>{email}</strong>.
              Please check your inbox and follow the instructions.
            </p>
            <p className="redirect-message">
              You'll be redirected to login page in 5 seconds...
            </p>
          </motion.div>
        )}

        <div className="additional-options">
          <p>
            Remember your password?{' '}
            <button onClick={() => navigate('/auth/login')} className="text-button">
              Sign in
            </button>
          </p>
          <p>
            Don't have an account?{' '}
            <button onClick={() => navigate('/auth/signup')} className="text-button">
              Create one
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
}