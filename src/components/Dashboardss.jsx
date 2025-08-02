import React, { useContext, useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Dasboard.css';
import { AuthContext } from './auth/AuthProvider';

const Testing = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true
    });
  }, []);

  const { user } = useContext(AuthContext);
  const { uid, userName, contactNo, token, userEmail } = user;

  // Mock data for orders and statistics
  const [orders, setOrders] = useState([
    {
      id: 'ORD-78945',
      date: '2023-06-15',
      status: 'Delivered',
      items: 3,
      total: 149.99,
      tracking: 'SH-784512369'
    },
    {
      id: 'ORD-78452',
      date: '2023-07-02',
      status: 'Shipped',
      items: 2,
      total: 89.99,
      tracking: 'SH-451236987'
    },
    {
      id: 'ORD-78123',
      date: '2023-07-10',
      status: 'Processing',
      items: 1,
      total: 49.99,
      tracking: 'SH-123456789'
    }
  ]);

  const [stats, setStats] = useState({
    totalOrders: 12,
    completedOrders: 8,
    pendingOrders: 2,
    cancelledOrders: 2,
    totalSpent: 1249.99
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: userName,
    email: userEmail,
    phone: contactNo,
    address: '123 Main St, New York, NY 10001'
  });

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to update the profile
    setEditMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" data-aos="fade-down">
        <h1>Welcome back, {userName}!</h1>
        <p>Here's what's happening with your account today.</p>
      </div>

      <div className="dashboard-grid">
        {/* Left Sidebar */}
        <div className="dashboard-sidebar" data-aos="fade-right">
          <div className="user-profile-card">
            <div className="avatar">
              {userName.charAt(0).toUpperCase()}
            </div>
            <h3>{userName}</h3>
            <p>{userEmail}</p>
            <div className="user-stats">
              <div>
                <span>{stats.totalOrders}</span>
                <small>Total Orders</small>
              </div>
              <div>
                <span>${stats.totalSpent.toFixed(2)}</span>
                <small>Total Spent</small>
              </div>
            </div>
          </div>

          <nav className="dashboard-nav">
            <button 
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              <i className="fas fa-tachometer-alt"></i> Overview
            </button>
            <button 
              className={activeTab === 'orders' ? 'active' : ''}
              onClick={() => setActiveTab('orders')}
            >
              <i className="fas fa-shopping-bag"></i> My Orders
            </button>
            <button 
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              <i className="fas fa-user"></i> Profile
            </button>
            <button 
              className={activeTab === 'addresses' ? 'active' : ''}
              onClick={() => setActiveTab('addresses')}
            >
              <i className="fas fa-map-marker-alt"></i> Addresses
            </button>
            <button 
              className={activeTab === 'security' ? 'active' : ''}
              onClick={() => setActiveTab('security')}
            >
              <i className="fas fa-lock"></i> Security
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div data-aos="fade-up">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#e3f2fd' }}>
                    <i className="fas fa-shopping-cart" style={{ color: '#2196f3' }}></i>
                  </div>
                  <div className="stat-info">
                    <h3>{stats.totalOrders}</h3>
                    <p>Total Orders</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#e8f5e9' }}>
                    <i className="fas fa-check-circle" style={{ color: '#4caf50' }}></i>
                  </div>
                  <div className="stat-info">
                    <h3>{stats.completedOrders}</h3>
                    <p>Completed</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#fff8e1' }}>
                    <i className="fas fa-clock" style={{ color: '#ffc107' }}></i>
                  </div>
                  <div className="stat-info">
                    <h3>{stats.pendingOrders}</h3>
                    <p>Pending</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#ffebee' }}>
                    <i className="fas fa-times-circle" style={{ color: '#f44336' }}></i>
                  </div>
                  <div className="stat-info">
                    <h3>{stats.cancelledOrders}</h3>
                    <p>Cancelled</p>
                  </div>
                </div>
              </div>

              <div className="recent-orders">
                <h2>Recent Orders</h2>
                <div className="orders-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{order.date}</td>
                          <td>
                            <span className={`status-badge ${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>{order.items}</td>
                          <td>${order.total.toFixed(2)}</td>
                          <td>
                            <button className="view-btn">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div data-aos="fade-up">
              <h2>My Orders</h2>
              <div className="orders-list">
                {orders.map((order) => (
                  <div className="order-card" key={order.id}>
                    <div className="order-header">
                      <div>
                        <span>Order #{order.id}</span>
                        <small>Placed on {order.date}</small>
                      </div>
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="order-details">
                      <div>
                        <span>Items</span>
                        <strong>{order.items}</strong>
                      </div>
                      <div>
                        <span>Total</span>
                        <strong>${order.total.toFixed(2)}</strong>
                      </div>
                      <div>
                        <span>Tracking</span>
                        <strong>{order.tracking}</strong>
                      </div>
                    </div>
                    <div className="order-actions">
                      <button className="btn-outline">Track Order</button>
                      <button className="btn-primary">View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div data-aos="fade-up">
              <div className="profile-header">
                <h2>My Profile</h2>
                {!editMode ? (
                  <button className="edit-btn" onClick={() => setEditMode(true)}>
                    <i className="fas fa-edit"></i> Edit Profile
                  </button>
                ) : (
                  <button className="cancel-btn" onClick={() => setEditMode(false)}>
                    Cancel
                  </button>
                )}
              </div>

              {!editMode ? (
                <div className="profile-info">
                  <div className="info-row">
                    <span>Full Name</span>
                    <p>{profileData.name}</p>
                  </div>
                  <div className="info-row">
                    <span>Email Address</span>
                    <p>{profileData.email}</p>
                  </div>
                  <div className="info-row">
                    <span>Phone Number</span>
                    <p>{profileData.phone || 'Not provided'}</p>
                  </div>
                  <div className="info-row">
                    <span>Default Address</span>
                    <p>{profileData.address}</p>
                  </div>
                </div>
              ) : (
                <form className="profile-form" onSubmit={handleProfileUpdate}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      required
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <textarea
                      name="address"
                      value={profileData.address}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>
                  <button type="submit" className="save-btn">
                    Save Changes
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div data-aos="fade-up">
              <h2>My Addresses</h2>
              <div className="addresses-grid">
                <div className="address-card primary">
                  <div className="address-header">
                    <h3>Primary Address</h3>
                    <span className="badge">Default</span>
                  </div>
                  <div className="address-details">
                    <p>{profileData.name}</p>
                    <p>{profileData.address}</p>
                    <p>Phone: {profileData.phone || 'Not provided'}</p>
                  </div>
                  <div className="address-actions">
                    <button className="btn-outline">
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    <button className="btn-outline">
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>

                <div className="address-card add-new">
                  <div className="add-new-content">
                    <i className="fas fa-plus"></i>
                    <h3>Add New Address</h3>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div data-aos="fade-up">
              <h2>Account Security</h2>
              <div className="security-card">
                <div className="security-item">
                  <div className="security-info">
                    <i className="fas fa-lock"></i>
                    <div>
                      <h3>Password</h3>
                      <p>Last changed 3 months ago</p>
                    </div>
                  </div>
                  <button className="btn-outline">Change Password</button>
                </div>

                <div className="security-item">
                  <div className="security-info">
                    <i className="fas fa-mobile-alt"></i>
                    <div>
                      <h3>Two-Factor Authentication</h3>
                      <p>Add an extra layer of security</p>
                    </div>
                  </div>
                  <button className="btn-outline">Enable 2FA</button>
                </div>

                <div className="security-item">
                  <div className="security-info">
                    <i className="fas fa-shield-alt"></i>
                    <div>
                      <h3>Login Activity</h3>
                      <p>View your recent login history</p>
                    </div>
                  </div>
                  <button className="btn-outline">View Activity</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Testing;