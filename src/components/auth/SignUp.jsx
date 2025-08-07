import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './UseAuth';
import React, { useContext, useEffect, useState } from 'react';
import './Signup.css';
import { AuthContext } from './AuthProvider';

const Signup = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  useEffect(() => {
    if(user){
     navigate('/dashboard');
    }
  }, [user, navigate]);
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNo: "",
    role: "customer",
  });

  const [errors, setErrors] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNo: "",
    role: "customer",
  });

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: 'Very weak',
    color: '#ff4444'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const newFormData = { ...prev, [name]: value };

      // Validate field using the *new* form state
      if (name === "password") {
        validatePassword(newFormData.password, newFormData);
      } else if (name === "confirmPassword") {
        validateField("confirmPassword", newFormData.confirmPassword, newFormData);
      } else {
        validateField(name, value, newFormData);
      }

      return newFormData;
    });
  };

  // returns an object with password-related errors and also updates strength
  const validatePassword = (password, formSnapshot) => {
    let passwordError = "";
    let confirmPasswordError = "";

    if (!password || password.length === 0) {
      passwordError = "Password is required";
    } else if (password.length < 8) {
      passwordError = "Password too short";
    }

    if (formSnapshot.confirmPassword) {
      if (formSnapshot.confirmPassword !== password) {
        confirmPasswordError = "Passwords do not match";
      }
    }

    // strength calculation (same as before)
    let score = 0;
    let message = "Very weak";
    let color = "#ff4444";

    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (password.length === 0) {
      message = "";
      color = "";
    } else if (score === 0) {
      message = "Very weak";
      color = "#ff4444";
    } else if (score <= 2) {
      message = "Weak";
      color = "#ffbb33";
    } else if (score === 3) {
      message = "Good";
      color = "#5cb85c";
    } else {
      message = "Strong";
      color = "#00C851";
    }

    setPasswordStrength({
      score,
      message,
      color,
    });

    return {
      password: passwordError,
      confirmPassword: confirmPasswordError,
    };
  };
  // returns error string for a non-password field
  const validateField = (fieldName, value, formSnapshot) => {
    let error = "";

    switch (fieldName) {
      case "userName":
        if (!value.trim()) error = "This field is required";
        else if (value.trim().length < 2) error = "Too short";
        break;
      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Invalid email format";
        break;
      case "contactNo":
        if (value) {
          const digits = value.replace(/\D/g, "");
          if (!/^\d{10}$/.test(digits)) {
            error = "Contact number must be 10 digits";
          }
        }
        break;
      default:
        break;
    }

    return error;
  };



  const validateAll = (formSnapshot) => {
    const newErrors = {};

    // Validate userName, email, contactNo, confirmPassword via generic validator
    ["userName", "email", "contactNo", "confirmPassword"].forEach((field) => {
      if (field === "confirmPassword") {
        // handled in password validator too, but keep consistent
        newErrors[field] = validateField(field, formSnapshot[field], formSnapshot);
      } else if (field !== "contactNo") {
        newErrors[field] = validateField(field, formSnapshot[field], formSnapshot);
      } else {
        newErrors[field] = validateField(field, formSnapshot[field], formSnapshot);
      }
    });

    // Password-specific (includes confirmPassword cross-check)
    const pwdErrors = validatePassword(formSnapshot.password, formSnapshot);
    newErrors.password = pwdErrors.password;
    // prefer password validator's confirmPassword error if any
    newErrors.confirmPassword = pwdErrors.confirmPassword || newErrors.confirmPassword;

    // Trim whitespace for required fields
    if (!formSnapshot.userName || !formSnapshot.userName.trim()) newErrors.userName = newErrors.userName || "This field is required";
    if (!formSnapshot.email || !formSnapshot.email.trim()) newErrors.email = newErrors.email || "Email is required";

    setErrors(prev => ({ ...prev, ...newErrors }));

    // Return whether form is clean
    const hasErrors = Object.values(newErrors).some(err => err);
    return !hasErrors;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Registering...");
    setIsSubmitting(true);
    setFormSubmitted(false);

    const snapshot = { ...formData };

    // Validate everything
    const isValid = validateAll(snapshot);
    if (!isValid) {
      setMessage("Please fix the errors before submitting.");
      setIsSubmitting(false);
      return;
    }

    // Build payload (contactNo optional)
    const payload = {
      userName: snapshot.userName.trim(),
      email: snapshot.email.trim(),
      password: snapshot.password,
      role: snapshot.role,
      ...(snapshot.contactNo && { contactNo: snapshot.contactNo }),
    };

    try {
      const response = await fetch(
        "https://themasterjacketsbackend-production.up.railway.app/api/user/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log("Registration successful:", data);
        setFormData({
          userName: "",
          email: "",
          password: "",
          confirmPassword: "",
          contactNo: "",
          role: snapshot.role,
        });
        setMessage("Registered successfully!");
        setFormSubmitted(true);
        return;
      }
      console.error('Registration failed:', data, data.message);
      setMessage(data.message || 'Registration failed.');
      setIsSubmitting(false);
      // Reset form state if needed
      setFormData({
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
        contactNo: "",
        role: snapshot.role,
      });
      setErrors({
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
        contactNo: "",
        role: snapshot.role,
      });
      setPasswordStrength({
        score: 0,
        message: 'Very weak',
        color: '#ff4444'
      });
    } catch (error) {
      console.error('Registration error:', error);
      // setMessage('Something went wrong. Please try again.');
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (formSubmitted) {
    return (
      <div className="signup-success">
        <div className="success-icon">✓</div>
        <h2>This {formData.userName}{message}</h2>
        <p>Click To <Link to="/auth/login">Go to Login</Link>.</p>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Create Your Account</h1>
          <p>Join TMJ to start shopping today</p>
        </div>
        {message && (
        <div className="auth-error">
          <svg className="auth-error-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p>{message}</p>
        </div>
      )}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className={`signup-form-group ${errors.userName ? 'has-error' : ''}`}>
              <label htmlFor="userName">User Name *</label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                onBlur={(e) => validateField('userName', e.target.value)}
                className={formData.userName ? 'has-value' : ''}
              />
              {errors.userName && <span className="error-messages">{errors.userName}</span>}
            </div>
            {/* 
            <div className={`form-group ${errors.lastName ? 'has-error' : ''}`}>
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={(e) => validateField('lastName', e.target.value)}
                className={formData.lastName ? 'has-value' : ''}
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div> */}
          </div>

          <div className={`signup-form-group ${errors.email ? 'has-error' : ''}`}>
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={(e) => validateField('email', e.target.value)}
              className={formData.email ? 'has-value' : ''}
            />
            {errors.email && <span className="error-messages">{errors.email}</span>}
          </div>

          <div className={`signup-form-group ${errors.password ? 'has-error' : ''}`}>
            <label htmlFor="password">Password *</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={(e) => validateField('password', e.target.value)}
                className={formData.password ? 'has-value' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <div className="password-strength">
              <div className="strength-meter">
                <div
                  className="strength-bar"
                  style={{
                    width: `${(passwordStrength.score / 4) * 100}%`,
                    backgroundColor: passwordStrength.color
                  }}
                ></div>
              </div>
              {formData.password && (
                <span className="strength-text" style={{ color: passwordStrength.color }}>
                  {passwordStrength.message}
                </span>
              )}
            </div>
            {errors.password && <span className="error-messages">{errors.password}</span>}
          </div>

          <div className={`signup-form-group ${errors.confirmPassword ? 'has-error' : ''}`}>
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={(e) => validateField('confirmPassword', e.target.value)}
              className={formData.confirmPassword ? 'has-value' : ''}
            />
            {errors.confirmPassword && <span className="error-messages">{errors.confirmPassword}</span>}
          </div>

          <div className={`signup-form-group ${errors.contactNo ? 'has-error' : ''}`}>
            <label htmlFor="contactNo">Contact Number (Optional)</label>
            <input
              type="text"
              id="contactNo"
              name="contactNo"
              value={formData.contactNo}
              onChange={handleChange}
              onBlur={(e) => validateField('contactNo', e.target.value)}
              className={formData.contactNo ? 'has-value' : ''}
            />
            {errors.contactNo && <span className="error-messages">{errors.contactNo}</span>}
          </div>

          <div className="form-actions">
            <button type="submit" className="signup-submit-button" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <svg className="auth-spinner" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                  </svg>
                </>
              ) : (
                'Create Account'
              )}
            </button>
            {/* {message && (
            <div
              className="feedback"
              role="alert"
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '0.5rem',
                padding: '0.75rem',
                borderRadius: '6px',
                backgroundColor: '#fdecea',
                color: '#b71c1c',
              }}
            >
              {message}
            </div>
             )}  */}
          </div>

          <div className="signup-footer">
            <p>Already have an account? <Link to="/auth/login">
              Log in
            </Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
