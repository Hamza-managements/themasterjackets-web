import React, { useContext, useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Dashboard.css';
import { AuthContext } from './auth/AuthProvider';
import {
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaShoppingBag,
  FaUser,
  FaMapMarkerAlt,
  FaLock,
  FaBell,
  FaSearch,
  FaChevronDown,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCheckCircle,
  FaTruck,
  FaClock,
  FaCreditCard,
  FaQuestionCircle,
  FaHeart,
  FaSyncAlt
} from 'react-icons/fa';
import { MdPayment, MdSecurity } from 'react-icons/md';
import { BsGraphUp, BsShieldLock } from 'react-icons/bs';

const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { user, logout } = useContext(AuthContext);
  const { uid, userName, contactNo, token, userEmail } = user;

  // Initialize AOS animations
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true
    });

    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 1024);
      if (window.innerWidth > 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'order',
      message: 'Your order #ORD-78945 has been shipped',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'promotion',
      message: 'Special 20% discount on all jackets this weekend',
      time: '1 day ago',
      read: false
    },
    {
      id: 3,
      type: 'account',
      message: 'Your profile information was updated successfully',
      time: '3 days ago',
      read: true
    },
    {
      id: 4,
      type: 'order',
      message: 'Your order #ORD-78123 is being processed',
      time: '5 days ago',
      read: true
    },
    {
      id: 5,
      type: 'system',
      message: 'New security feature available: Two-factor authentication',
      time: '1 week ago',
      read: true
    }
  ]);

  const [showNotifications, setShowNotifications] = useState(false);

  const [orders, setOrders] = useState([
    {
      id: 'ORD-78945',
      date: '2023-06-15',
      status: 'Delivered',
      items: [
        { name: 'Premium Leather Jacket', quantity: 1, price: 99.99 },
        { name: 'Denim Jeans', quantity: 2, price: 25.00 }
      ],
      total: 149.99,
      tracking: 'SH-784512369',
      paymentMethod: 'Visa •••• 4242'
    },
    {
      id: 'ORD-78452',
      date: '2023-07-02',
      status: 'Shipped',
      items: [
        { name: 'Casual T-Shirt', quantity: 1, price: 19.99 },
        { name: 'Baseball Cap', quantity: 1, price: 15.00 }
      ],
      total: 89.99,
      tracking: 'SH-451236987',
      paymentMethod: 'Mastercard •••• 5555'
    },
    {
      id: 'ORD-78123',
      date: '2023-07-10',
      status: 'In-Process',
      items: [
        { name: 'Winter Coat', quantity: 1, price: 149.99 }
      ],
      total: 149.99,
      tracking: 'SH-123456789',
      paymentMethod: 'PayPal'
    }
  ]);

  const [returns, setReturns] = useState([
    {
      id: 'RET-12345',
      date: '2023-07-15',
      status: 'Pending',
      items: [
        { name: 'Leather Jacket', quantity: 1, price: 99.99 }
      ],
      reason: 'Size too large',
      refundAmount: 99.99
    },
    {
      id: 'RET-12346',
      date: '2023-07-20',
      status: 'Approved',
      items: [
        { name: 'Denim Jeans', quantity: 1, price: 25.00 }
      ],
      reason: 'Defective item',
      refundAmount: 25.00
    }
  ]);

  const [stats, setStats] = useState({
    totalOrders: 12,
    checkedOutOrders: 2,
    wishlistItems: 5,
    completedOrders: 8,
    pendingOrders: 2,
    cancelledOrders: 2,
    totalSpent: 1249.99,
    savings: 149.50
  });

  const [profileData, setProfileData] = useState({
    userName: user?.userName || '',
    userEmail: user?.userEmail || '',
    contactNo: user?.contactNo || '',
    address: {
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zip: '62704',
      country: 'USA'
    }
  });

  const addressesFromStorage = localStorage.getItem('addresses');
  const [addresses, setAddresses] = useState(addressesFromStorage ? JSON.parse(addressesFromStorage) : []);

  const [newAddress, setNewAddress] = useState({
    type: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    isDefault: false
  });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    securityQuestions: [
      { question: 'What was your first pet\'s name?', answer: '••••••' },
      { question: 'In what city were you born?', answer: '••••••' }
    ]
  });

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle navigation click
  const handleNavClick = (tab) => {
    setActiveTab(tab);
    if (isMobileView) {
      setIsMobileMenuOpen(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "https://themasterjacketsbackend-production.up.railway.app/api/user/update/68762589a469c496106e01d4", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          uid,
          userName: profileData.userName,
          contactNo: profileData.contactNo,
        }),
      }
      );

      const data = await res.json();
      if (res.ok) {
        // Update local user data
        console.log('Profile updated:', data);
        setEditMode(false);
      } else {
        console.error('Profile update failed:', data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  // Handle address input changes
  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress({
      ...newAddress,
      [name]: value
    });
  };

  // Add new address
  const handleAddAddress = (e) => {
    e.preventDefault();
    const newId = addresses.length > 0 ? Math.max(...addresses.map(a => a.id)) + 1 : 1;
    // If setting as default, remove default from others
    const updatedAddresses = newAddress.isDefault
      ? addresses.map(addr => ({ ...addr, isDefault: false }))
      : [...addresses];

    updatedAddresses.push({ ...newAddress, id: newId });
    setAddresses(updatedAddresses);
    localStorage.setItem('addresses', JSON.stringify(updatedAddresses));
    setShowAddressForm(false);
    setNewAddress({
      type: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      isDefault: false
    });
  };

  // Set default address
  const setDefaultAddress = (id) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  // Delete address
  const deleteAddress = (id) => {
    if (addresses.length <= 1) {
      alert('You must have at least one address');
      return;
    }

    const addressToDelete = addresses.find(a => a.id === id);
    if (addressToDelete.isDefault) {
      alert('Please set another address as default before deleting this one');
      return;
    }

    setAddresses(addresses.filter(a => a.id !== id));
    localStorage.setItem('addresses', JSON.stringify(addresses.filter(a => a.id !== id)));
  };

  // Toggle two-factor authentication
  const toggleTwoFactor = () => {
    setSecuritySettings({
      ...securitySettings,
      twoFactorEnabled: !securitySettings.twoFactorEnabled
    });
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter orders based on search query
  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.tracking.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReturns = returns.filter(ret =>
    ret.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ret.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ret.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="dashboard-container">
      {/* Top Navigation Bar */}
      <header className="dashboard-topbar">
        <div className="topbar-left">
          {isMobileView && (
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
              <FaBars />
            </button>
          )}
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search orders, settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="topbar-right">
          <button
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FaBell />
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </button>

          <div
            className={`user-menu ${showUserMenu ? 'active' : ''}`}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span>{userName}</span>
            <FaChevronDown className={`dropdown-icon ${showUserMenu ? 'open' : ''}`} />

            {showUserMenu && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div className="user-avatar large">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4>{userName}</h4>
                    <p>{userEmail}</p>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button onClick={() => handleNavClick('profile')}>
                  <FaUser /> My Profile
                </button>
                <button onClick={() => handleNavClick('security')}>
                  <MdSecurity /> Account Settings
                </button>
                <div className="dropdown-divider"></div>
                <button onClick={logout}>
                  <FaLock /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {showNotifications && (
          <div className="notifications-panel">
            <div className="notifications-header">
              <h4>Notifications</h4>
              <button>Mark all as read</button>
            </div>
            <div className="notification-list">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div key={notification.id} className="notification-item">
                    <div className="notification-icon">
                      {notification.type === 'order' ? <FaShoppingBag /> : <FaBell />}
                    </div>
                    <div className="notification-content">
                      <p>{notification.message}</p>
                      <small>{notification.time}</small>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-notifications">
                  <FaBell />
                  <p>No new notifications</p>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <div className="dashboard-grid">
        {/* Left Sidebar */}
        <aside
          className={`dashboard-sidebar ${isMobileView ? (isMobileMenuOpen ? 'mobile-open' : 'mobile-closed') : ''}`}
        >
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
              {/* <div>
                <span>${stats.totalSpent.toFixed(2)}</span>
                <small>Total Spent</small>
              </div> */}
            </div>
          </div>

          <nav className="dashboard-nav">
            <button
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => handleNavClick('overview')}
            >
              <FaTachometerAlt className="nav-icon" />
              <span>Dashboard</span>
            </button>
            <button
              className={activeTab === 'orders' ? 'active' : ''}
              onClick={() => handleNavClick('orders')}
            >
              <FaShoppingBag className="nav-icon" />
              <span>My Orders</span>
              {orders.length > 0 && <span className="nav-badge">{orders.length}</span>}
            </button>
            <button
              className={activeTab === 'returns' ? 'active' : ''}
              onClick={() => handleNavClick('returns')}
            >
              <FaSyncAlt className="nav-icon" />
              <span>My Returns</span>
              <span className="nav-badge">{returns.length}</span>
            </button>
            <button
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => handleNavClick('profile')}
            >
              <FaUser className="nav-icon" />
              <span>Profile</span>
            </button>
            <button
              className={activeTab === 'addresses' ? 'active' : ''}
              onClick={() => handleNavClick('addresses')}
            >
              <FaMapMarkerAlt className="nav-icon" />
              <span>Addresses</span>
            </button>
            <button
              className={activeTab === 'security' ? 'active' : ''}
              onClick={() => handleNavClick('security')}
            >
              <FaLock className="nav-icon" />
              <span>Security</span>
            </button>
            {isMobileView && (
              <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                <FaTimes />
              </button>
            )}
          </nav>

          <div className="sidebar-footer">
            <div className="help-card">
            <Link to="/contact-us" className="help-card">
              <FaQuestionCircle />
              <div>
                <h4>Need Help?</h4>
                <p>Contact our support team</p>
              </div>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          {/* Dashboard Overview */}
          {activeTab === 'overview' && (
            <div data-aos="fade-up">
              <div className="content-header">
                <h1>Dashboard Overview</h1>
                <p>Welcome back, {userName}! Here's what's happening with your account.</p>
              </div>

              <div className="stats-grid">
                <div className="stat-card primary">
                  <div className="stat-icon">
                    <FaShoppingBag />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.totalOrders}</h3>
                    <p>Total Orders</p>
                    {/* <span className="stat-trend positive">+12% from last month</span> */}
                  </div>
                </div>

                <div className="stat-card success">
                  <div className="stat-icon">
                    <FaHeart />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.wishlistItems}</h3>
                    <p>Wishlist</p>
                    {/* <span className="stat-trend positive">+5% from last month</span> */}
                  </div>
                </div>

                <div className="stat-card warning">
                  <div className="stat-icon">
                    <FaClock />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.checkedOutOrders}</h3>
                    <p>Check out</p>
                    {/* <span className="stat-trend negative">-2% from last month</span> */}
                  </div>
                </div>

                {/* <div className="stat-card info">
                  <div className="stat-icon">
                    <FaChartLine />
                  </div>
                  <div className="stat-info">
                    <h3>${stats.totalSpent.toFixed(2)}</h3>
                    <p>Total Spent</p>
                    <span className="stat-trend positive">Saved ${stats.savings.toFixed(2)} with coupons</span>
                  </div>
                </div> */}
              </div>

              <div className="content-section">
                <div className="section-header">
                  <h2>Recent Orders</h2>
                  <button
                    className="btn-text"
                    onClick={() => handleNavClick('orders')}
                  >
                    View All Orders
                  </button>
                </div>

                <div className="orders-table">
                  <div className="table-responsive">
                    <table>
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.slice(0, 5).map((order) => (
                          <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{formatDate(order.date)}</td>
                            <td>
                              <span className={`status-badge ${order.status.toLowerCase()}`}>
                                {order.status}
                              </span>
                            </td>
                            <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                            <td>${order.total.toFixed(2)}</td>
                            <td>
                              <div className="action-buttons">
                                <button className="btn-icon" title="Track Order">
                                  <FaTruck />
                                </button>
                                <button className="btn-icon" title="View Details">
                                  <FaSearch />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="content-section">
                <h2>Quick Actions</h2>
                <div className="quick-actions">
                  <button className="action-card">
                    <FaShoppingBag />
                    <span>Start Shopping</span>
                  </button>
                  <button className="action-card" onClick={() => handleNavClick('profile')}>
                    <FaUser />
                    <span>Update Profile</span>
                  </button>
                  <button className="action-card" onClick={() => handleNavClick('returns')}>
                    <FaSyncAlt />
                    <span>My Returns</span>
                  </button>
                  {/* <button className="action-card">
                    <MdPayment />
                    <span>Payment Methods</span>
                  </button> */}
                  <button className="action-card" onClick={() => handleNavClick('security')}>
                    <BsShieldLock />
                    <span>Security Settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div data-aos="fade-up">
              <div className="content-header">
                <h1>My Orders</h1>
                <p>View and manage your recent and past orders</p>
              </div>

              <div className="orders-filter">
                <div className="search-box">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder="Search by order ID, status..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="filter-options">
                  <select>
                    <option>All Orders</option>
                    <option>Completed</option>
                    <option>In-Process</option>
                    <option>Cancelled</option>
                  </select>
                  <select>
                    <option>Sort by: Newest</option>
                    <option>Sort by: Oldest</option>
                    <option>Sort by: Price (High to Low)</option>
                    <option>Sort by: Price (Low to High)</option>
                  </select>
                </div>
              </div>

              <div className="orders-list">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <div className="order-card" key={order.id}>
                      <div className="order-header">
                        <div>
                          <span className="order-id">Order #{order.id} </span>
                          <small>  Placed on {formatDate(order.date)}</small>
                        </div>
                        <div className="order-status">
                          <span className={`status-badge ${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                          <span className="payment-method">
                            {order.paymentMethod}
                          </span>
                        </div>
                      </div>

                      <div className="order-items">
                        {order.items.map((item, index) => (
                          <div key={index} className="order-item">
                            <div className="item-image">
                              {/* Placeholder for product image */}
                              <div className="image-placeholder"></div>
                            </div>
                            <div className="item-details">
                              <h4>{item.name}</h4>
                              <p>Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="order-footer">
                        <div className="order-total">
                          <span>Total:</span>
                          <strong>${order.total.toFixed(2)}</strong>
                        </div>
                        <div className="order-actions">
                          <button className="btn-outline">
                            <FaTruck /> Track Order
                          </button>
                          <button className="btn-primary">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <FaShoppingBag />
                    <h3>No orders found</h3>
                    <p>Your search didn't match any orders. Try different keywords.</p>
                    <button className="btn-primary">Continue Shopping</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* returns Tab */}
          {activeTab === 'returns' && (
            <div data-aos="fade-up">
              <div className="content-header">
                <h1>My Returns</h1>
                <p>View and manage your recent and past returns</p>
              </div>

              <div className="orders-filter">
                <div className="search-box">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder="Search by return ID, status..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="filter-options">
                  <select>
                    <option>All Returns</option>
                    <option>Approved</option>
                    <option>In-Process</option>
                    <option>Cancelled</option>
                  </select>
                  <select>
                    <option>Sort by: Newest</option>
                    <option>Sort by: Oldest</option>
                    <option>Sort by: Price (High to Low)</option>
                    <option>Sort by: Price (Low to High)</option>
                  </select>
                </div>
              </div>

              <div className="orders-list">
                {filteredReturns.length > 0 ? (
                  filteredReturns.map((ret) => (
                    <div className="order-card" key={ret.id}>
                      <div className="order-header">
                        <div>
                          <span className="order-id">Return #{ret.id} </span>
                          <small> Placed on {formatDate(ret.date)}</small>
                        </div>
                        <div className="order-status">
                          <span className={`status-badge ${ret.status.toLowerCase()}`}>
                            {ret.status}
                          </span>
                          <span className="return-reason">
                            Return reason : <span>{ret.reason}</span>
                          </span>
                        </div>
                      </div>

                      <div className="order-items">
                        {ret.items.map((item, index) => (
                          <div key={index} className="order-item">
                            <div className="item-image">
                              {/* Placeholder for product image */}
                              <div className="image-placeholder"></div>
                            </div>
                            <div className="item-details">
                              <h4>{item.name}</h4>
                              <p>Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="order-footer">
                        <div className="order-total">
                          <span>Total:</span>
                          <strong>${ret.refundAmount.toFixed(2)}</strong>
                        </div>
                        <div className="order-actions">
                          <button className="btn-outline">
                            <FaTruck /> Track Return
                          </button>
                          <button className="btn-primary">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <FaShoppingBag />
                    <h3>No Returns found</h3>
                    <p>Your search didn't match any Returns. Try different keywords.</p>
                    <button className="btn-primary">Continue Shopping</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div data-aos="fade-up">
              <div className="content-header">
                <h1>My Profile</h1>
                <p>Manage your personal information and account settings</p>
              </div>

              <div className="profile-section">
                <div className="profile-header">
                  <div className="profile-avatar">
                    <div className="avatar-large">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="avatar-actions">
                      {/* <button className="btn-outline">
                        <FaEdit /> Change Photo
                      </button> */}
                      <button className="btn-text">
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="profile-actions">
                    {!editMode ? (
                      <button
                        className="btn-primary"
                        onClick={() => setEditMode(true)}
                      >
                        <FaEdit /> Edit Profile
                      </button>
                    ) : (
                      <div className="edit-actions">
                        <button
                          className="btn-outline"
                          onClick={() => setEditMode(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn-primary"
                          onClick={handleProfileUpdate}
                        >
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {!editMode ? (
                  <div className="profile-details">
                    <div className="detail-row">
                      <label>Full Name</label>
                      <p>{profileData.userName}</p>
                    </div>
                    <div className="detail-row">
                      <label>Email Address</label>
                      <p>{profileData.userEmail}</p>
                    </div>
                    <div className="detail-row">
                      <label>Phone Number</label>
                      <p>{profileData.contactNo || 'Not provided'}</p>
                    </div>
                    <div className="detail-row">
                      <label>Default Address</label>
                      <p>
                        {profileData.address.street}, {profileData.address.city}, {profileData.address.state} {profileData.address.zip}, {profileData.address.country}
                      </p>
                    </div>
                  </div>
                ) : (
                  <form className="profile-form" onSubmit={handleProfileUpdate}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          name="userName"
                          value={profileData.userName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Email Address</label>
                        <input
                          type="email"
                          name="userEmail"
                          value={profileData.userEmail}
                          onChange={handleInputChange}
                          required
                          disabled
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          name="contactNo"
                          value={profileData.contactNo}
                          onChange={handleInputChange}
                          placeholder="+1 (123) 456-7890"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Address</label>
                      <div className="address-fields">
                        <input
                          type="text"
                          name="street"
                          value={profileData.address.street}
                          onChange={handleInputChange}
                          placeholder="Street Address"
                        />
                        <div className="address-row">
                          <input
                            type="text"
                            name="city"
                            value={profileData.address.city}
                            onChange={handleInputChange}
                            placeholder="City"
                          />
                          <input
                            type="text"
                            name="state"
                            value={profileData.address.state}
                            onChange={handleInputChange}
                            placeholder="State"
                          />
                          <input
                            type="text"
                            name="zip"
                            value={profileData.address.zip}
                            onChange={handleInputChange}
                            placeholder="ZIP Code"
                          />
                        </div>
                        <input
                          type="text"
                          name="country"
                          value={profileData.address.country}
                          onChange={handleInputChange}
                          placeholder="Country"
                        />
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div data-aos="fade-up">
              <div className="content-header">
                <h1>My Addresses</h1>
                <p>Manage your shipping addresses for faster checkout</p>
              </div>

              <div className="addresses-grid">
                {addresses.map(address => (
                  <div
                    key={address.id}
                    className={`address-card ${address.isDefault ? 'default' : ''}`}
                  >
                    <div className="address-header">
                      <h3>{address.type} Address</h3>
                      {address.isDefault && (
                        <span className="default-badge">Default</span>
                      )}
                    </div>
                    <div className="address-details">
                      <p>{address.street}</p>
                      <p>{address.city}, {address.state} {address.zip}</p>
                      <p>{address.country}</p>
                    </div>
                    <div className="address-actions">
                      {!address.isDefault && (
                        <button
                          className="btn-text"
                          onClick={() => setDefaultAddress(address.id)}
                        >
                          Set as Default
                        </button>
                      )}
                      <div className="action-icons">
                        <button className="icon-btn" title="Edit">
                          <FaEdit />
                        </button>
                        <button
                          className="icon-btn"
                          title="Delete"
                          onClick={() => deleteAddress(address.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {showAddressForm ? (
                  <div className="address-card add-form">
                    <form onSubmit={handleAddAddress}>
                      <div className="form-group">
                        <label>Address Type</label>
                        <select
                          name="type"
                          value={newAddress.type}
                          onChange={handleAddressInputChange}
                          required
                        >
                          <option value="">Select type</option>
                          <option value="Home">Home</option>
                          <option value="Work">Work</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Street Address</label>
                        <input
                          type="text"
                          name="street"
                          value={newAddress.street}
                          onChange={handleAddressInputChange}
                          required
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>City</label>
                          <input
                            type="text"
                            name="city"
                            value={newAddress.city}
                            onChange={handleAddressInputChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>State/Province</label>
                          <input
                            type="text"
                            name="state"
                            value={newAddress.state}
                            onChange={handleAddressInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>ZIP/Postal Code</label>
                          <input
                            type="text"
                            name="zip"
                            value={newAddress.zip}
                            onChange={handleAddressInputChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Country</label>
                          <input
                            type="text"
                            name="country"
                            value={newAddress.country}
                            onChange={handleAddressInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-checkbox">
                        <input
                          type="checkbox"
                          id="defaultAddress"
                          name="isDefault"
                          checked={newAddress.isDefault}
                          onChange={(e) => setNewAddress({
                            ...newAddress,
                            isDefault: e.target.checked
                          })}
                        />
                        <label htmlFor="defaultAddress">Set as default address</label>
                      </div>

                      <div className="form-actions">
                        <button
                          type="button"
                          className="btn-outline"
                          onClick={() => setShowAddressForm(false)}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                          Save Address
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div
                    className="address-card add-new"
                    onClick={() => setShowAddressForm(true)}
                  >
                    <div className="add-new-content">
                      <FaPlus />
                      <h3>Add New Address</h3>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div data-aos="fade-up">
              <div className="content-header">
                <h1>Account Security</h1>
                <p>Manage your account security settings and preferences</p>
              </div>

              <div className="security-settings">
                <div className="security-card">
                  <div className="security-header">
                    <div className="security-icon">
                      <FaLock />
                    </div>
                    <div className="security-info">
                      <h3>Password</h3>
                      <p>Last changed 3 months ago</p>
                    </div>
                  </div>
                  <button className="btn-outline">Change Password</button>
                </div>
              </div>


              {/* <div className="security-card">
                  <div className="security-header">
                    <div className="security-icon">
                      <BsShieldLock />
                    </div>
                    <div className="security-info">
                      <h3>Two-Factor Authentication</h3>
                      <p>Add an extra layer of security to your account</p>
                      <div className="security-status">
                        {securitySettings.twoFactorEnabled ? (
                          <span className="status-enabled">Enabled</span>
                        ) : (
                          <span className="status-disabled">Disabled</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    className={`btn-${securitySettings.twoFactorEnabled ? 'outline' : 'primary'}`}
                    onClick={toggleTwoFactor}
                  >
                    {securitySettings.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
                  </button>
                </div>

                <div className="security-card">
                  <div className="security-header">
                    <div className="security-icon">
                      <FaQuestionCircle />
                    </div>
                    <div className="security-info">
                      <h3>Security Questions</h3>
                      <p>Help verify your identity for sensitive actions</p>
                    </div>
                  </div>
                  <button className="btn-outline">Manage Questions</button>
                </div>

                <div className="security-card">
                  <div className="security-header">
                    <div className="security-icon">
                      <FaClock />
                    </div>
                    <div className="security-info">
                      <h3>Login Activity</h3>
                      <p>Review recent login attempts to your account</p>
                    </div>
                  </div>
                  <button className="btn-outline">View Activity</button>
                </div>

                <div className="security-card">
                  <div className="security-header">
                    <div className="security-icon">
                      <MdPayment />
                    </div>
                    <div className="security-info">
                      <h3>Connected Devices</h3>
                      <p>Manage devices that have access to your account</p>
                    </div>
                  </div>
                  <button className="btn-outline">Manage Devices</button>
                </div>
              </div>

              <div className="security-advanced">
                <h3>Advanced Security</h3>
                <div className="advanced-options">
                  <div className="option-row">
                    <div>
                      <h4>Logout from all devices</h4>
                      <p>This will sign you out from all devices where you're currently logged in</p>
                    </div>
                    <button className="btn-outline">Logout Everywhere</button>
                  </div>

                  <div className="option-row">
                    <div>
                      <h4>Deactivate Account</h4>
                      <p>Temporarily deactivate your account. You can reactivate it later by logging in.</p>
                    </div>
                    <button className="btn-outline danger">Deactivate</button>
                  </div>

                  <div className="option-row">
                    <div>
                      <h4>Delete Account</h4>
                      <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
                    </div>
                    <button className="btn-outline danger">Delete Account</button>
                  </div>
                </div>
              </div> */}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;