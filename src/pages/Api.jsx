import { useEffect, useState } from "react";

export default function Api() {
  const [status, setStatus] = useState("Loading...");
  const apiURL = "https://themasterjacketsbackend-production.up.railway.app/";

  useEffect(() => {
    fetch(apiURL)
      .then(res => {
        if (!res.ok) throw new Error("Network error");
        return res.text(); // or .json() if it's JSON
      })
      .then(data => setStatus("API is working ✅"))
      .catch(err => setStatus("Error: " + err.message));
  }, []);

  return (
    <div>
      <h1>API Documentation</h1>
      <p>API Base URL: <code>{apiURL}</code></p>
      <p>Status: {status}</p>
    </div>
  );
}
