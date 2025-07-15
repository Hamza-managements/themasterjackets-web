// components/auth/Login.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthProvider';
import AuthForm from './AuthForm';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    const { email, password } = formData;
    return await login(email, password);
  };

  return (
    <div className="auth-page">
      <AuthForm type="login" onSubmit={handleLogin} />
    </div>
  );
};

export default Login;