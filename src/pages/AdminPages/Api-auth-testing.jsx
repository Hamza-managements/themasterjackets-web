import React, { useState, useContext } from "react";
import { AuthContext } from "../../components/auth/AuthProvider";

const APITestingPage = () => {
  const { user } = useContext(AuthContext);
  const [apiResults, setApiResults] = useState({});
  const [loading, setLoading] = useState(false);


  // Generic API call function
  const callAPI = async (endpoint, method = "GET", body = null) => {
    setLoading(true);
    try {
      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${localStorage.getItem('token')}`,
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(
        `https://themasterjacketsbackend-production.up.railway.app/api/user/${endpoint}`,
        options
      );

      const data = await response.json();
      setApiResults(prev => ({
        ...prev,
        [endpoint]: {
          success: response.ok,
          data: data,
          status: response.status,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (error) {
      setApiResults(prev => ({
        ...prev,
        [endpoint]: {
          success: false,
          error: error.message,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  // Specific API functions
  const fetchAllUsers = () => callAPI("fetch-all/68762589a469c496106e01d4");

  const fetchAdmins = () => callAPI("fetch-all/68762589a469c496106e01d4?role=admin");

  const fetchUserById = () => {
    const id = prompt("Enter User ID to fetch:", "564564564564564564");
    if (!id) {
      callAPI(`fetchById/68762589a469c496106e01d4?uid=${user.uid}`, "GET");
      console.log("No ID provided, fetching current user." + user.uid);
      return
    }
    callAPI(`fetchById/68762589a469c496106e01d4?uid=${id}`, "GET");
  };

  const changeUserStatus = () => {
    const id = prompt("Enter User ID to fetch:", "564564564564564564");
    if (!id) return;
    callAPI(`change-activation-status/68762589a469c496106e01d4?uid=${id}`, "PUT");
  };

  const updateUser = () => {
    const uid = prompt("Enter User ID", "564564564564564564");
    const userName = prompt("Enter UserName", "John Doe");
    const contactNo = prompt("Enter Contact number", "5555555555");
    if (!uid) return;
    callAPI(
      "update/68762589a469c496106e01d4",
      "PUT",
      {
        uid,
        userName,
        contactNo
      }
    );

  };
  const deleteUser = () => {
    const id = prompt("Enter User ID to fetch:", "564564564564564564");
    if (!id) return;
    callAPI(
      `delete/68762589a469c496106e01d4?uid=${id}`,
      "DELETE"
    );
  }

  const allCategory = () => {
    callAPI(`change-activation-status/68762589a469c496106e01d4`, "PUT");
  };


  // User Check
  const checkAdminStatus = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      const userEmail = currentUser?.userEmail || "No user found";

      const response = await fetch(
        "https://themasterjacketsbackend-production.up.railway.app/api/user/fetch-all/68762589a469c496106e01d4?role=admin",
        {
          headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await response.json();

      if (Array.isArray(data?.data)) {
        const isAdmin = data.data.some(admin => admin.email === userEmail);
        setApiResults(prev => ({
          ...prev,
          adminCheck: {
            success: true,
            data: {
              userEmail,
              isAdmin,
              adminCount: data.data.length
            },
            timestamp: new Date().toLocaleTimeString()
          }
        }));
      }
    } catch (error) {
      setApiResults(prev => ({
        ...prev,
        adminCheck: {
          success: false,
          error: error.message,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <h1>API Testing Dashboard</h1>
      <p>Welcome, {user?.userName || "Admin"}</p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "15px",
        margin: "20px 0"
      }}>
        <APITestButton
          label="Fetch All Users"
          onClick={fetchAllUsers}
          loading={loading}
        />
        <APITestButton
          label="Fetch Admins"
          onClick={fetchAdmins}
          loading={loading}
        />
        <APITestButton
          label="Fetch User By ID"
          onClick={fetchUserById}
          loading={loading}
        />
        <APITestButton
          label="Change User Status"
          onClick={changeUserStatus}
          loading={loading}
        />
        <APITestButton
          label="Update User"
          onClick={updateUser}
          loading={loading}
        />
        <APITestButton
          label="Delete User"
          onClick={deleteUser}
          loading={loading}
        />
        <APITestButton
          label="Check Admin Status"
          onClick={checkAdminStatus}
          loading={loading}
        />
      </div>

      <div style={{ marginTop: "30px" }}>
        <h2>API Results</h2>
        {Object.entries(apiResults).map(([endpoint, result]) => (
          <APIResultBox
            key={endpoint}
            endpoint={endpoint}
            result={result}
          />
        ))}
      </div>
    </div>
  );
};

// Reusable button component
const APITestButton = ({ label, onClick, loading }) => (
  <button
    onClick={onClick}
    disabled={loading}
    style={{
      padding: "12px 15px",
      borderRadius: "6px",
      background: "#A06D33",
      color: "white",
      border: "none",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.2s",
      opacity: loading ? 0.7 : 1,
      pointerEvents: loading ? "none" : "auto"
    }}
  >
    {loading ? "Processing..." : label}
  </button>
);

// Reusable result display component
const APIResultBox = ({ endpoint, result }) => (
  <div style={{
    marginBottom: "20px",
    padding: "15px",
    border: `1px solid ${result.success ? "#4CAF50" : "#F44336"}`,
    borderRadius: "6px",
    background: "#F8F5F2"
  }}>
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "10px"
    }}>
      <h3 style={{ margin: 0 }}>{endpoint}</h3>
      <span style={{
        color: result.success ? "#4CAF50" : "#F44336",
        fontWeight: "bold"
      }}>
        {result.success ? "SUCCESS" : "ERROR"}
      </span>
    </div>
    <p style={{ margin: "5px 0", color: "#666" }}>
      <strong>Time:</strong> {result.timestamp}
    </p>
    {result.status && (
      <p style={{ margin: "5px 0", color: "#666" }}>
        <strong>Status:</strong> {result.status}
      </p>
    )}
    {result.data?.data?.length && (
      <p style={{ margin: "5px 0", color: "#666" }}>
        <strong>Length:</strong> {result.data?.data?.length ?? "N/A"}
      </p>
    )}
    <pre style={{
      background: "white",
      padding: "10px",
      borderRadius: "4px",
      overflowX: "auto",
      maxHeight: "300px",
      border: "1px solid #ddd"
    }}>
      {JSON.stringify(result.data || result.error, null, 2)}
    </pre>
  </div>
);

export default APITestingPage;