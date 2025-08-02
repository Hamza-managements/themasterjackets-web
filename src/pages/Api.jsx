import React, { useState ,useContext } from "react";
import { AuthContext } from "../components/auth/AuthProvider";
import { Navigate } from "react-router-dom";


const SignupForm = () => {
  const { user } = useContext(AuthContext);
  if(user){
    Navigate('/dashboard');
  }
  const ApiTesting = async(e) => {
   const response = await fetch( 
        "https://themasterjacketsbackend-production.up.railway.app/api/user/fetch-all/68762589a469c496106e01d4",{
          headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
    const data = await response.json();
    console.log(data);  
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    const response = await fetch( 
        "https://themasterjacketsbackend-production.up.railway.app/api/user/delete/68762589a469c496106e01d4?uid=688c9b86a2bef30fb961481b",{
         method: "DELETE",
         headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${localStorage.getItem('token')}`,
          },
      }
    );
    const data = await response.json();
    console.log(data);  
  };
  // user list API: fetch( 
  //       "https://themasterjacketsbackend-production.up.railway.app/api/user/fetch-all/68762589a469c496106e01d4",{
  //         headers: {
  //           "Content-Type": "application/json",
  //           "authorization": `Bearer ${localStorage.getItem('token')}`,
  //         },
  //       }
  //     );

  //  or if by role 
  
  // user list by role *admin or customer* API: fetch(
  //       "https://themasterjacketsbackend-production.up.railway.app/api/user/fetch-all/68762589a469c496106e01d4?role=admin",{
  //         headers: {
  //           "Content-Type": "application/json",
  //           "authorization": `Bearer ${localStorage.getItem('token')}`,
  //         },
  //       }
  //     );

  //  Get user by ID API: const response = await fetch(
  //       "https://themasterjacketsbackend-production.up.railway.app/api/user/fetchById/68762589a469c496106e01d4?uid=68762589a469c496106e01d4",{
  //         headers: {
  //           "Content-Type": "application/json",
  //           "authorization": `Bearer ${localStorage.getItem('token')}`,
  //         },
  //       }
  //     );

  // user status change API: fetch(
  //       "https://themasterjacketsbackend-production.up.railway.app/api/user/change-activation-status/68762589a469c496106e01d4?uid=688872b4a2bef30fb9614517",{
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //           "authorization": `Bearer ${localStorage.getItem('token')}`,
  //         },
  //       }
  //     );

  // update user API: fetch(
  //       "https://themasterjacketsbackend-production.up.railway.app/api/user/update/68762589a469c496106e01d4",{
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //           "authorization": `Bearer ${localStorage.getItem('token')}`,
  //         },
  //      body: JSON.stringify(
  //        {
  //          uid: "688872b4a2bef30fb9614517",
  //          userName: "Hamza S",
  //          contactNo: "03001234567",
  //        }),
  //       }
  //     );

  // Delete user API: fetch( 
  //       "https://themasterjacketsbackend-production.up.railway.app/api/user/delete/68762589a469c496106e01d4?uid=688c7a5aa2bef30fb9614768",{
  //        method: "DELETE",
  //        headers: {
  //           "Content-Type": "application/json",
  //           "authorization": `Bearer ${localStorage.getItem('token')}`,
  //         },
  //     }
  //   );
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    contactNo: "",
    role: "customer",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Registering...");

    try {
      // const response = await fetch(
      //   "https://themasterjacketsbackend-production.up.railway.app/api/user/register",
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(formData),
      //   }
      // );
      const response = await fetch(
        "https://themasterjacketsbackend-production.up.railway.app/api/user/fetch-all/68762589a469c496106e01d4",{
          headers: {
            "Content-Type": "application/json",
             authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("User registered successfully!");
        setFormData({
          userName: "",
          email: "",
          password: "",
          contactNo: "",
          role: "customer",
        });
        console.log("Registration successful:", data);
      } else {
        setMessage(`Error: ${data.message || "Registration failed."}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Signup Form</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="userName"
          placeholder="Username"
          value={formData.userName}
          onChange={handleChange}
          required
        />
        <br />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <br />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <br />
        <input
          type="text"
          name="contactNo"
          placeholder="Contact Number"
          value={formData.contactNo}
          onChange={handleChange}
          required
        />
        <br />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
        </select>
        <br />
        <button type="submit">Sign Up</button>
        <button onClick={handleDelete}>delete</button>
        <button onClick={ApiTesting}>Fetch Users</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default SignupForm;
