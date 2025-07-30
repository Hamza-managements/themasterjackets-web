import React, { useContext, useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom';
import { AuthContext } from '../components/auth/AuthProvider';
import './UserDashboard.css';

const UserDashboard = () => {
  useEffect(() => {
          AOS.init();
        }, []);
  const { user } = useContext(AuthContext);

  const orders = [
    {
      id: 'ORD-12345',
      date: '2023-05-15',
      status: 'Delivered',
      total: 149.99,
      items: [
        { name: 'Wireless Headphones', quantity: 1, price: 99.99 },
        { name: 'Phone Case', quantity: 2, price: 25.00 }
      ]
    },
    {
      id: 'ORD-12344',
      date: '2023-04-02',
      status: 'Shipped',
      total: 89.98,
      items: [
        { name: 'Smart Watch', quantity: 1, price: 89.98 }
      ]
    }
  ];

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const { uid, userName, contactNo, token , userEmail } = storedUser;

  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState({
    userName: userName || '',
    contactNo: contactNo || ''
  });
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        'https://themasterjacketsbackend-production.up.railway.app/api/user/update/68762589a469c496106e01d4',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            uid,
            userName: editData.userName,
            contactNo: editData.contactNo,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Update localStorage with new values
        const updatedUser = { ...storedUser, ...editData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setMessage('Profile updated successfully!');
      } else {
        setMessage(data.message || 'Update failed.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      console.error(error);
    } finally { 
      setTimeout(() => {
      setShowEditForm(false);
      setMessage('');
    }, 1500);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.userName || 'Customer'}!</h1>
        <p>Here's what's happening with your account</p>
      </div>

      <div className="dashboard-grid">
        {/* Account Summary */}
        <div className="dashboard-card account-summary">
          <h2>Account Summary</h2>
          <div className="account-details">
            <div className="detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-value">
                {user?.userName}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{user?.userEmail}</span>
            </div>
            {/* <div className="detail-item">
              <span className="detail-label">Member Since:</span>
              <span className="detail-value">May 2023</span>
            </div> */}
          </div>
          <button className="edit-btn" onClick={() => setTimeout(() => {setShowEditForm(true);}, 1000)}>
        Edit Profile
        </button>
      {showEditForm && (
        <div className="edit-form p-4 mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input
              disabled
              type="email"
              name="email"
              value={userEmail}
              className="w-full px-3 py-2 border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Username</label>
            <input
              type="text"
              name="userName"
              value={editData.userName}
              onChange={handleInputChange}
              className="w-half px-3 py-2 border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Contact No</label>
            <input
              type="text"
              name="contactNo"
              value={editData.contactNo}
              onChange={handleInputChange}
              className="w-1/2 px-3 py-2 border-gray-300 rounded-md"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Save
            </button>
            <button
              onClick={() => setShowEditForm(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded-md"
            >
              Cancel
            </button>
          </div>
          {message && <p className="mt-2 text-sm text-green-600">{message}</p>}
        </div>
      )}
        </div>

        {/* Order History */}
        <div className="dashboard-card order-history">
          <h2>Recent Orders</h2>
          {orders.length > 0 ? (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-item">
                  <div className="order-header">
                    <span className="order-id">Order #{order.id}</span>
                    <span className={`order-status ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-details">
                    <span className="order-date">Placed on {order.date}</span>
                    <span className="order-total">${order.total.toFixed(2)}</span>
                  </div>
                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item-product">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">Qty: {item.quantity}</span>
                        <span className="item-price">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <Link to={`/orders/${order.id}`} className="view-order-btn">
                    View Order Details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-orders">
              <p>You haven't placed any orders yet</p>
              <Link to="/products" className="shop-btn">
                Start Shopping
              </Link>
            </div>
          )}
          <Link to="/orders" className="view-all-orders">
            View All Orders
          </Link>
        </div>

        {/* Quick Links */}
        <div className="dashboard-card quick-links">
          <h2>Quick Actions</h2>
          <div className="links-grid">
            <Link to="/wishlist" className="quick-link">
              <div className="link-icon">❤️</div>
              <span>Wishlist</span>
            </Link>
            <Link to="/addresses" className="quick-link">
              <div className="link-icon">🏠</div>
              <span>Addresses</span>
            </Link>
            <Link to="/payment-methods" className="quick-link">
              <div className="link-icon">💳</div>
              <span>Pay Methods</span>
            </Link>
            <Link to="/settings" className="quick-link">
              <div className="link-icon">⚙️</div>
              <span>Account Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;