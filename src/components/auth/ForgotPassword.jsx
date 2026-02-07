import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import ReCAPTCHA from 'react-google-recaptcha';

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
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/verify-email`, {
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
      const timer = setTimeout(() => navigate('/auth/login'), 8000);
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
                <img src="https://res.cloudinary.com/dvmpyh0hj/image/upload/v1760615184/hilkmru9zutcneybpwwc.png" alt="Company Logo" className="logo" />
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
              <div className={`forgot-password-input-group ${errors.email ? 'error' : ''}`}>
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
                  className={errors.email ? 'error' : 'forgot-password-input'}
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
            className="forgot-success-message"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <FiCheckCircle size={60} className="forgot-success-icon" />
            <h2>Check Your Email</h2>
            <p>
              We've sent a password reset link to <strong>{email}</strong>.
              Please check your inbox and follow the instructions.
            </p>
            <p className="forgot-redirect-message">
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
        <style>{`.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #a3a3a3 0%, #5a5959 100%);
  padding: 2rem;
}

.forgot-password-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  width: 100%;
  max-width: 480px;
  position: relative;
  overflow: hidden;
}

.back-button {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  background: none;
  border: none;
  color: #3E2C1C;
  cursor: pointer;
  transition: transform 0.2s;
}

.back-button:hover {
  transform: translateX(-3px);
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.logo {
  height: 80px;
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #212529;
  text-align: center;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6c757d;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.forgot-password-input-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.forgot-password-input-group.error {
  margin-bottom: 0.5rem;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.forgot-password-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #b6b4b4;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
}

input:focus {
  outline: none;
  border-color: #4361ee;
  box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
}

input.error {
  border-color: #f72585;
}

input.error:focus {
  box-shadow: 0 0 0 2px rgba(247, 37, 133, 0.2);
}

.error-message {
  color: #f72585;
  font-size: 0.8rem;
  display: block;
  margin-top: 0.5rem;
}

.recaptcha-container {
  margin: 1.5rem 0;
}

.forgot-password-submit-button {
  width: 100%;
  padding: 1rem;
  background: var(--black);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.forgot-password-submit-button:hover {
  background: var(--dark-gray);
  transform: translateY(-1px);
}

.forgot-password-submit-button:disabled {
  background: var(--gray);
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.forgot-success-message {
  display: flex;
  align-items: center;
  flex-direction: column;
  text-align: center;
  padding: 1rem 0;
}

.forgot-success-icon {
  color: #18be9d;
  margin-bottom: 1.5rem;
}

.forgot-success-message h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #212529;
}

.forgot-success-message p {
  color: #6c757d;
  margin-bottom: 1rem;
}

.forgot-redirect-message {
  font-size: 0.9rem;
  color: #adb5bd;
}

.additional-options {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.9rem;
  color: #6c757d;
}

.text-button {
  background: none;
  border: none;
  color: #000000;
  cursor: pointer;
  font-weight: 500;
  padding: 0.2rem;
}

.text-button:hover {
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 768px) {
  .forgot-password-container {
    padding: 1rem;
    align-items: flex-start;
  }

  .forgot-password-card {
    padding: 2rem 1.5rem;
    margin-top: 2rem;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.85rem;
  }

  input {
    padding: 0.65rem 1rem 0.65rem 2.5rem;
    font-size: 0.9rem;
  }

  .submit-button {
    padding: 0.85rem;
    font-size: 0.95rem;
  }
}`}</style>
      </div>
    </motion.div>
  );
}