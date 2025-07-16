import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './UseAuth';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'Required';
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = 'Invalid email';
    if (formData.password.length < 8) newErrors.password = 'Minimum 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords must match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await signup(formData);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrors({ form: result.message });
    }
  };

  const styles = {
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    input: {
      padding: '12px 15px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px'
    },
    error: {
      color: '#e53935',
      fontSize: '14px',
      marginTop: '5px'
    },
    button: {
      padding: '12px',
      background: '#000',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
      marginTop: '10px'
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Create Account</h2>

      {errors.form && (
        <div style={{
          background: '#ffebee',
          color: '#e53935',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          {errors.form}
        </div>
      )}

      <div>
        <label style={{ display: 'block', marginBottom: '5px' }}>First Name</label>
        <input
          type="text"
          style={{
            ...styles.input,
            borderColor: errors.firstName ? '#e53935' : '#ddd'
          }}
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
        />
        {errors.firstName && <span style={styles.error}>{errors.firstName}</span>}
      </div>

      {/* Repeat similar fields for lastName, email, password, confirmPassword */}

      <button
        type="submit"
        style={styles.button}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating Account...' : 'Sign Up'}
      </button>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        Already have an account? <Link to="/login" style={{ color: '#1976d2' }}>Log in</Link>
      </div>
    </form>
  );
};

export default Signup;
