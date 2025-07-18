import React from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "./UseAuth";

const Login = () => {
  const { register, handleSubmit } = useForm();
  const { login } = useAuth(); // from your AuthProvider

  const onSubmit = (data) => {
    // API call or local logic
    console.log("Login Data:", data);
    login(data); // example usage
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Email:</label>
        <input {...register("email")} type="email" required />

        <label>Password:</label>
        <input {...register("password")} type="password" required />

        <button type="submit">Loginsdsdsdsdsds</button>
      </form>
    </div>
  );
};

export default Login;
