// components/auth/SignUp.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthProvider';
import AuthForm from './AuthForm';

const SignUp = () => {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignup = async (formData) => {
    const { firstName, lastName, email, password } = formData;
    return await signup({ firstName, lastName, email, password });
  };

  return (
    <div className="auth-page">
      <AuthForm type="signup" onSubmit={handleSignup} />
    </div>
  );
};

export default SignUp;