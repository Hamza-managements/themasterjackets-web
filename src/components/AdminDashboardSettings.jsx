import React, { useContext, useState } from "react";
import { AuthContext } from "./auth/AuthProvider";

const AdminSettings = ({darkMode}) => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        userName: user?.userName || '',
        userEmail: user?.userEmail || '',
        contactNo: user?.contactNo || '',
        notifications: true,
        language: "en",
    });

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Settings saved:", formData);
        alert("Settings saved successfully!");
    };

    return (
        <div className="settings-wrapper">
            <h3 className="settings-header">⚙️ Admin Settings</h3>

            <form className="settings-form" onSubmit={handleSubmit}>
                {/* General */}
                <div className="settings-section">
                    <h3>General</h3>
                    <div className="admin-dashboard-form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.userName}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="admin-dashboard-form-group">
                        <label>Email Address</label>
                        <input
                            type="userEmail"
                            name="userEmail"
                            value={formData.userEmail}
                            onChange={handleChange}
                            disabled
                        />
                    </div>
                    <div className="admin-dashboard-form-group">
                        <label>contactNo</label>
                        <input
                            type="contactNo"
                            name="contactNo"
                            value={formData.contactNo}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Preferences */}
                <div className="settings-section">
                    <h3>Preferences</h3>
                    <div className="admin-dashboard-form-group admin-dashboard-checkbox-group">
                        <label>
                            Enable Email Notifications
                        </label>
                        <input
                            type="checkbox"
                            name="notifications"
                            checked={formData.notifications}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="admin-dashboard-form-group">
                        <label>Language</label>
                        <select
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                        >
                            <option value="en">English</option>
                        </select>
                    </div>
                </div>

                {/* Buttons */}
                <div className="settings-actions">
                    <button type="submit" className="btn-save">Save Changes</button>
                    <button type="reset" className="btn-cancel">Cancel</button>
                </div>
            </form>

            <style>
                {`.settings-wrapper {
  background: ${darkMode ? '#1f2937' : '#fff'};
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
  max-width: 700px;
  margin: auto;
}

.settings-header {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: ${darkMode ? '#fff' : '#222'};
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.settings-section h3 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: ${darkMode ? '#fff' : '#222'};
}

.admin-dashboard-form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.admin-dashboard-form-group label {
  margin-bottom: 6px;
  font-weight: 500;
  color: ${darkMode ? '#ddd' : '#555'};
}

.admin-dashboard-form-group input,
.admin-dashboard-form-group select {
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
}

.admin-dashboard-form-group input:focus,
.admin-dashboard-form-group select:focus {
  border-color: #007bff;
  outline: none;
}

.admin-dashboard-checkbox-group{
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;              
  font-size: 0.95rem;
  font-weight: 500;
  color: ${darkMode ? '#ddd' : '#555'};
  cursor: pointer;
}

.admin-dashboard-checkbox-group input[type="checkbox"] {
  width: 18px;            
  height: 18px;
  accent-color: #007bff;  
  cursor: pointer;
}

.admin-dashboard-checkbox-group label {
  cursor: pointer;
  user-select: none;    
}


.settings-actions {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.btn-save {
  background: #007bff;
  color: #fff;
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-save:hover {
  background: #0056b3;
}

.btn-cancel {
  background: #e0e0e0;
  color: #333;
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-cancel:hover {
  background: #c4c4c4;
}`}
            </style>
        </div>
    );
};

export default AdminSettings;
