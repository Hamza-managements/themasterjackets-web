import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './UseAuth';
import React, { useState } from 'react';
import './Signup.css';

const Signup = () => {
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate field on change
    if (name === 'password') {
      validatePassword(value);
    } else {
      validateField(name, value);
    }
  };

  const validateField = (fieldName, value) => {
    let error = '';

    switch (fieldName) {
      case 'userName':
        if (!value.trim()) error = 'This field is required';
        else if (value.length < 2) error = 'Too short';
        break;
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
      case 'confirmPassword':
        if (value !== formData.password) error = 'Passwords do not match';
        break;
      case 'contactNo':
        if (!/^\d{10}$/.test(value)) {
          error = 'contact number must be 10 digits';
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const validatePassword = (password) => {
    // Reset errors
    setErrors(prev => ({
      ...prev,
      password: '',
      confirmPassword: formData.confirmPassword ?
        (formData.confirmPassword === password ? '' : 'Passwords do not match')
        : ''
    }));

    // Calculate strength
    let score = 0;
    let message = 'Very weak';
    let color = '#ff4444';

    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (password.length === 0) {
      message = '';
    } else if (score === 0) {
      message = 'Very weak';
      color = '#ff4444';
    } else if (score <= 2) {
      message = 'Weak';
      color = '#ffbb33';
    } else if (score === 3) {
      message = 'Good';
      color = '#5cb85c';
    } else {
      message = 'Strong';
      color = '#00C851';
    }

    setPasswordStrength({
      score,
      message,
      color
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    Object.keys(formData).forEach(field => {
      validateField(field, formData[field]);
    });

    // Check if any errors exist
    const hasErrors = Object.values(errors).some(error => error !== '');
    const hasEmptyFields = Object.values(formData).some(value => value === '');

    if (!hasErrors && !hasEmptyFields) {
      // Form is valid, proceed with submission
      setMessage("Registering...");
      setIsSubmitting(true);
      try {
        const response = await fetch(
          "https://themasterjacketsbackend-production.up.railway.app/api/user/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        const data = await response.json();

        if (response.ok) {
          setFormData({
            userName: "",
            email: "",
            password: "",
            confirmPassword: "",
            contactNo: "",
          });
          console.log("Registration successful:", data);
          console.log('Form submitted:', formData);

        } else {
          setMessage(`Error: ${data.message || "Registration failed."}`);
        }
      } catch (error) {
        setMessage("Something went wrong. Please try again.");
      } finally {
        setMessage(" registered successfully!");
        setIsSubmitting(false);
        setFormSubmitted(true);
      }
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
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className={`form-group ${errors.userName ? 'has-error' : ''}`}>
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
              {errors.userName && <span className="error-message">{errors.userName}</span>}
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

          <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
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
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
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
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className={`form-group ${errors.confirmPassword ? 'has-error' : ''}`}>
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
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <div className={`form-group ${errors.contactNo ? 'has-error' : ''}`}>
            <label htmlFor="contactNo">Contact Number (Optional)</label>
            <input
              type="number"
              id="contactNo"
              name="contactNo"
              value={formData.contactNo}
              onChange={handleChange}
              onBlur={(e) => validateField('contactNo', e.target.value)}
              className={formData.contactNo ? 'has-value' : ''}
            />
            {errors.contactNo && <span className="error-message">{errors.contactNo}</span>}
          </div>

          <div className="form-actions">
            <button type="submit" className="signup-button" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner" /> {message}
                </>
              ) : (
                'Create Account'
              )}
            </button>
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
