import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../components/auth/AuthProvider';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);

  // Sample order data - replace with real data from your API
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.firstName || 'Customer'}!</h1>
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
                {user?.firstName} {user?.lastName}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{user?.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Member Since:</span>
              <span className="detail-value">May 2023</span>
            </div>
          </div>
          <Link to="/account/settings" className="edit-btn">
            Edit Profile
          </Link>
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
              <span>Payment Methods</span>
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