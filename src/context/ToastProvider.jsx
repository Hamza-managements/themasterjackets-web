// src/components/ToastProvider.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import "./Toast.css"; // custom styles

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = ({ type = "info", message }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="custom-toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`custom-toast ${toast.type}`}>
            <div className="toast-icon">
              {toast.type === "success" && "🛒"}
              {toast.type === "info" && "ℹ️"}
              {toast.type === "error" && "❌"}
              {toast.type === "warning" && "⚠️"}
            </div>
            <div className="toast-message">{toast.message}</div>
            <div className="toast-bar"></div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
