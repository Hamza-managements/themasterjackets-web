import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const AccountSettings = () => {
  const [formData, setFormData] = useState({
    uid: '',
    userName: '',
    contactNo: '',
  });
  
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const { uid, userName, contactNo , token } = storedUser;
  console.log('User data from localStorage:', { uid, userName, contactNo });  
//   if (!uid) {
//     navigate('/login');
//     return;
//   }

  setFormData({ uid, userName, contactNo });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch('https://themasterjacketsbackend-production.up.railway.app/api/user/update', {
        method: 'POST', // or PUT based on your backend
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Profile updated successfully!');
        localStorage.setItem('userName', formData.userName);
        localStorage.setItem('contactNo', formData.contactNo);
      } else {
        setMessage(data.message || 'Failed to update profile.');
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2>Account Settings</h2>
      <form onSubmit={handleSave}>
        <label>
          Name:
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Contact No:
          <input
            type="text"
            name="contactNo"
            value={formData.contactNo}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" disabled={isSaving} style={{ marginTop: '10px' }}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>

        {message && <p style={{ marginTop: '10px' }}>{message}</p>}
      </form>
    </div>
  );
};

export default AccountSettings;
