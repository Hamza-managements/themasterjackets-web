// components/auth/AuthForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthForm = ({ type, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    ...(type === 'signup' && {
      firstName: '',
      lastName: '',
      confirmPassword: ''
    })
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (type === 'signup') {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    const result = await onSubmit(formData);
    setIsSubmitting(false);
    
    if (result && !result.success) {
      setErrors(prev => ({ ...prev, form: result.message }));
    }
  };

  return (
    <div className="auth-container">
      <h2>{type === 'login' ? 'Login' : 'Create Account'}</h2>
      
      {errors.form && <div className="error-message">{errors.form}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        {type === 'signup' && (
          <>
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? 'error' : ''}
              />
              {errors.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={errors.lastName ? 'error' : ''}
              />
              {errors.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>
          </>
        )}
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>
        
        {type === 'signup' && (
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>
        )}
        
        <button type="submit" disabled={isSubmitting} className="auth-button">
          {isSubmitting ? (
            <span>Processing...</span>
          ) : (
            <span>{type === 'login' ? 'Login' : 'Sign Up'}</span>
          )}
        </button>
      </form>
      
      <div className="auth-footer">
        {type === 'login' ? (
          <p>
            Don't have an account?{' '}
            <button type="button" onClick={() => navigate('/signup')}>
              Sign up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <button type="button" onClick={() => navigate('/login')}>
              Login
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;