import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { FiLock, FiCheck, FiEye, FiEyeOff } from 'react-icons/fi';
import zxcvbn from 'zxcvbn';
import './ResetPassword.css';
export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({
        password: '',
        confirmPassword: '',
        token: ''
    });

    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (!urlToken) {
              Swal.fire('Error', 'Invalid password reset link', 'error').then(() => navigate('/'));
        }
        setToken(urlToken);
    }, [searchParams, navigate]);

    // Password strength calculation
    useEffect(() => {
        if (password) {
            setPasswordStrength(zxcvbn(password).score);
        } else {
            setPasswordStrength(0);
        }
    }, [password]);

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
            isValid = false;
        } else if (passwordStrength < 2) {
            newErrors.password = 'Password is too weak';
            isValid = false;
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await fetch('https://your-api.com/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            Swal.fire({
                title: 'Success!',
                text: 'Your password has been reset successfully',
                icon: 'success',
                confirmButtonText: 'Login Now'
            }).then(() => {
                navigate('/auth/login');
            });
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const getStrengthColor = () => {
        const colors = ['#ff4d4f', '#faad14', '#a0d911', '#52c41a'];
        return colors[passwordStrength] || colors[0];
    };

    return (
        <motion.div
            className="reset-password-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="reset-password-card">
                <h1>Reset Your Password</h1>
                <p className="subtitle">Create a new password for your account</p>

                <form onSubmit={handleSubmit}>
                    {/* Password Field */}
                    <div className={`input-group ${errors.password ? 'has-error' : ''}`}>
                        <div className="input-wrapper">
                            <div className="input-icon">
                                <FiLock />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors({ ...errors, password: '' });
                                }}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        {errors.password && (
                            <div className="error-message">{errors.password}</div>
                        )}
                    </div>

                    {/* Password Strength Meter */}
                    {password && (
                        <div className="password-strength">
                            <div className="strength-bars">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className={`strength-bar ${passwordStrength >= i ? 'active' : ''}`}
                                        style={{ backgroundColor: passwordStrength >= i ? getStrengthColor() : '#f0f0f0' }}
                                    />
                                ))}
                            </div>
                            <span className="strength-text">
                                {['Very Weak', 'Weak', 'Good', 'Strong', 'Very Strong'][passwordStrength]}
                            </span>
                        </div>
                    )}

                    {/* Password Requirements */}
                    <div className="password-requirements">
                        <p className={password.length >= 8 ? 'valid' : ''}>
                            <FiCheck /> At least 8 characters
                        </p>
                        <p className={/[A-Z]/.test(password) ? 'valid' : ''}>
                            <FiCheck /> At least one uppercase letter
                        </p>
                        <p className={/[0-9]/.test(password) ? 'valid' : ''}>
                            <FiCheck /> At least one number
                        </p>
                        <p className={/[^A-Za-z0-9]/.test(password) ? 'valid' : ''}>
                            <FiCheck /> At least one special character
                        </p>
                    </div>

                    {/* Confirm Password Field */}
                    <div className={`input-group ${errors.confirmPassword ? 'error' : ''}`}>
                        <div className="input-wrapper">
                        <div className="input-icon">
                            <FiLock />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                            }}
                            autoComplete="new-password"
                        />
                        </div>
                        {errors.confirmPassword && (
                            <span className="error-message">{errors.confirmPassword}</span>
                        )}
                    </div>

                    <button type="submit" className="reset-password-submit-button" disabled={isLoading}>
                        {isLoading ? (
                            <div className="spinner"></div>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>
            </div>
        </motion.div>
    );
}