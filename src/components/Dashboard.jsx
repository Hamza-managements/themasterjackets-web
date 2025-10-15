import React, { useContext, useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';
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
import { MdSecurity } from 'react-icons/md';
import { BsShieldLock } from 'react-icons/bs';

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
      <style>{`
      :root {
    --primary-color: #A06D33;
    --primary-light: #e6f0ff;
    --secondary-color: #D6AD60;
    --success-color: #4cc9f0;
    --warning-color: #f8961e;
    --danger-color: #f72585;
    --dark-color: #3E2C1C;
    --light-color: #f8f9fa;
    --gray-color: #6c757d;
    --light-gray: #e9ecef;
    --border-radius: 8px;
    --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    --transition: all 0.3s ease;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    line-height: 1.6;
    color: var(--dark-color);
    background-color: #f5f7fa;
}

a {
    text-decoration: none;
    color: inherit;
}

button {
    cursor: pointer;
    border: none;
    background: none;
}

/* Dashboard Container */
.dashboard-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

/* Top Navigation Bar */
.dashboard-topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: white;
    box-shadow: var(--box-shadow);
    position: sticky;
    top: 0;
}

.topbar-left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.mobile-menu-toggle {
    display: none;
    background: none;
    border: none;
    font-size: 1.25rem;
    color: var(--gray-color);
}

.search-bar {
    position: relative;
    width: 300px;
}

.search-bar .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--gray-color);
}

.search-bar input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid var(--light-gray);
    border-radius: var(--border-radius);
    font-size: 0.9rem;
    transition: var(--transition);
}

.search-bar input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px var(--primary-light);
}

.topbar-right {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.notification-btn {
    position: relative;
    background: none;
    border: none;
    font-size: 1.25rem;
    color: var(--gray-color);
}

.notification-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: var(--dark-color);
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: bold;
}

.user-menu {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    position: relative;
}

.user-avatar , .avatar-large {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

.user-avatar.large {
    border-radius: 50%;
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
}

.dropdown-icon {
    transition: var(--transition);
}

.dropdown-icon.open {
    transform: rotate(180deg);
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    width: 280px;
    background-color: white;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    padding: 1rem 0;
    display: none;
}

.user-menu.active .dropdown-menu,
.user-menu:focus-within .dropdown-menu {
    display: block;
}

.dropdown-header {
    display: flex;
    gap: 1rem;
    padding: 0 1rem 1rem;
    border-bottom: 1px solid var(--light-gray);
}

.dropdown-menu button {
    width: 100%;
    padding: 0.75rem 1.5rem;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: var(--transition);
}

.dropdown-menu button:hover {
    background-color: var(--light-color);
}

.dropdown-divider {
    height: 1px;
    background-color: var(--light-gray);
    margin: 0.5rem 0;
}

.notifications-panel {
    position: absolute;
    top: 100%;
    right: 0;
    width: 350px;
    max-height: 500px;
    overflow-y: auto;
    color: black;
    background-color: rgb(230, 227, 227);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
}

.notification-btn:hover .notifications-panel,
.notification-btn:focus-within .notifications-panel {
    display: block;
}

.notifications-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--light-gray);
}

.notifications-header button {
    color: var(--primary-color);
    font-size: 0.9rem;
    font-weight: 500;
}

.notification-list {
    padding: 0.5rem 0;
}

.notification-item {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    transition: var(--transition);
}

.notification-item:hover {
    background-color: var(--light-color);
}

.notification-icon {
    font-size: 1.25rem;
    color: var(--primary-color);
}

.notification-content {
    flex: 1;
}

.notification-content small {
    color: var(--gray-color);
    font-size: 0.8rem;
}

.empty-notifications {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
    color: var(--gray-color);
}

.empty-notifications svg {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: var(--primary-color);
}

/* Dashboard Grid Layout */
.dashboard-grid {
    display: flex;
    flex: 1;
}

/* Sidebar */
.dashboard-sidebar {
    width: 280px;
    background-color: white;
    box-shadow: var(--box-shadow);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    transition: var(--transition);
    z-index: 90;
}

.user-profile-card {
    text-align: center;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--light-gray);
    margin-bottom: 1.5rem;
}

.user-profile-card .avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: bold;
    margin: 0 auto 1rem;
}

.user-profile-card h3 {
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
}

.user-profile-card p {
    color: var(--gray-color);
    font-size: 0.9rem;
    margin-bottom: 1rem;
}

.user-stats {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
}

.user-stats div {
    text-align: center;
}

.user-stats span {
    font-size: 1.25rem;
    font-weight: bold;
    display: block;
}

.user-stats small {
    color: var(--gray-color);
    font-size: 0.8rem;
}

.dashboard-nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
}

.dashboard-nav button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: var(--border-radius);
    color: var(--gray-color);
    transition: var(--transition);
    position: relative;
}

.dashboard-nav button:hover {
    background-color: var(--light-color);
    color: var(--primary-color);
}

.dashboard-nav button.active {
    background-color: var(--primary-light);
    color: var(--primary-color);
    font-weight: 500;
}

.dashboard-nav button.active .nav-icon {
    color: var(--primary-color);
}

.nav-icon {
    font-size: 1.1rem;
    color: var(--gray-color);
}

.nav-badge {
    position: absolute;
    right: 1rem;
    background-color: var(--primary-color);
    color: white;
    border-radius: 50%;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
}

.sidebar-footer {
    margin-top: auto;
    padding-top: 1.5rem;
    border-top: 1px solid var(--light-gray);
}

.help-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background-color: var(--light-color);
    border-radius: var(--border-radius);
}

.help-card svg {
    font-size: 1.5rem;
    color: var(--primary-color);
}

.help-card h4 {
    font-size: 1rem;
    margin-bottom: 0.25rem;
}

.help-card p {
    font-size: 0.85rem;
    color: var(--gray-color);
}

/* Main Content */
.dashboard-content {
    flex: 1;
    padding: 2rem;
    background-color: #f5f7fa;
    overflow-y: auto;
}

.content-header {
    margin-bottom: 2rem;
}

.content-header h1 {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
}

.content-header p {
    color: var(--gray-color);
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background-color: white;
    border-radius: var(--border-radius);
    border: 2px solid #3030303f;
    padding: 16px;
    display: flex;
    gap: 1.5rem;
    box-shadow: var(--box-shadow);
}

/* .stat-card.primary {
  border-left: 4px solid var(--primary-color);
}

.stat-card.success {
  border-left: 4px solid var(--success-color);
}

.stat-card.warning {
  border-left: 4px solid var(--warning-color);
}

.stat-card.info {
  border-left: 4px solid var(--secondary-color);
} */

.stat-icon {
    width: 40px;
    height: 45px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
}

.stat-card.primary .stat-icon {
    background-color: var(--primary-light);
    color: var(--primary-color);
}

.stat-card.success .stat-icon {
    background-color: rgba(196, 76, 240, 0.1);
    color: rgba(25, 1, 34, 0.621);
}

.stat-card.warning .stat-icon {
    background-color: rgba(248, 150, 30, 0.1);
    color: var(--warning-color);
}

.stat-card.info .stat-icon {
    background-color: rgba(63, 55, 201, 0.1);
    color: var(--secondary-color);
}

.stat-info h3 {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
}

.stat-info p {
    color: var(--gray-color);
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
}

.stat-trend {
    font-size: 0.75rem;
    font-weight: 500;
}

.stat-trend.positive {
    color: #28a745;
}

.stat-trend.negative {
    color: #dc3545;
}

/* Content Sections */
.content-section {
    background-color: white;
    border-radius: var(--border-radius);
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: var(--box-shadow);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.section-header h2 {
    font-size: 1.25rem;
}

.btn-text {
    color: var(--primary-color);
    font-weight: 500;
    background: none;
    border: none;
    padding: 0.25rem 0.5rem;
}

.btn-text:hover {
    text-decoration: underline;
}

/* Orders Table */
.orders-table {
    overflow-x: auto;
}

.table-responsive {
    min-width: 100%;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid var(--light-gray);
}

th {
    font-weight: 500;
    color: var(--gray-color);
    font-size: 0.9rem;
    text-transform: uppercase;
}

.status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
}

.status-badge.delivered {
    background-color: rgba(40, 167, 69, 0.1);
    color: #28a745;
}

.status-badge.shipped {
    background-color: rgba(13, 110, 253, 0.1);
    color: #0d6efd;
}

.status-badge.in-process {
    background-color: rgba(255, 193, 7, 0.1);
    color: #cd9b05;
}

.status-badge.cancelled {
    background-color: rgba(220, 53, 69, 0.1);
    color: #dc3545;
}

.status-badge.approved {
    background-color: rgba(255, 0, 0, 0.1);
    color: #28a745;
}

.status-badge.pending {
    background-color: rgba(255, 0, 0, 0.1);
    color: #ff0000;
}

.return-reason {
    font-size: 0.85rem;
    color: var(--gray-color);
    margin-left: 0.5rem;
}

.return-reason span {
    font-weight: 500;
    
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
}

.btn-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--light-color);
    color: var(--gray-color);
    transition: var(--transition);
}

.btn-icon:hover {
    background-color: var(--primary-light);
    color: var(--primary-color);
}

/* Quick Actions */
.quick-actions {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
}

.action-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5rem 1rem;
    background-color: white;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    transition: var(--transition);
    border: 1px solid var(--light-gray);
}

.action-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    border-color: var(--primary-light);
}

.action-card svg {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
    color: var(--primary-color);
}

/* Orders List */
.orders-filter {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    gap: 1rem;
}

.search-box {
    position: relative;
    flex: 1;
    max-width: 400px;
}

.search-box svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--gray-color);
}

.search-box input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid var(--light-gray);
    border-radius: var(--border-radius);
    font-size: 0.9rem;
}

.filter-options {
    display: flex;
    gap: 1rem;
}

.filter-options select {
    padding: 0.75rem 1rem;
    border: 1px solid var(--light-gray);
    border-radius: var(--border-radius);
    font-size: 0.9rem;
    background-color: white;
}

.orders-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.order-card {
    background-color: white;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    overflow: hidden;
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--light-gray);
}

.order-id {
    font-weight: 500;
}

.order-header small {
    color: var(--gray-color);
    font-size: 0.85rem;
}

.order-status {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.payment-method {
    font-size: 0.85rem;
    color: var(--gray-color);
}

.order-items {
    padding: 1rem 1.5rem;
}

.order-item {
    display: flex;
    gap: 1rem;
    padding: 0.75rem 0;
}

.order-item:not(:last-child) {
    border-bottom: 1px solid var(--light-gray);
}

.item-image {
    width: 60px;
    height: 60px;
    border-radius: var(--border-radius);
    background-color: var(--light-gray);
    flex-shrink: 0;
}

.image-placeholder {
    width: 100%;
    height: 100%;
    background-color: var(--light-gray);
    border-radius: var(--border-radius);
}

.item-details h4 {
    font-size: 0.95rem;
    margin-bottom: 0.25rem;
}

.item-details p {
    font-size: 0.85rem;
    color: var(--gray-color);
}

.order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--light-gray);
}

.order-total {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.order-total span {
    color: var(--gray-color);
}

.order-total strong {
    font-size: 1.1rem;
}

.order-actions {
    display: flex;
    gap: 0.75rem;
}

.btn-outline {
    padding: 0.5rem 1rem;
    border: 1px solid var(--light-gray);
    border-radius: var(--border-radius);
    background-color: white;
    color: var(--dark-color);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: var(--transition);
}

.btn-outline:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
}

.btn-outline.danger {
    border-color: var(--danger-color);
    color: var(--danger-color);
}

.btn-outline.danger:hover {
    background-color: rgba(247, 37, 133, 0.05);
}

.btn-primary {
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius);
    background-color: var(--primary-color);
    color: white;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: var(--transition);
}

.btn-primary:hover {
    background-color: var(--secondary-color);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    text-align: center;
    background-color: white;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
}

.empty-state svg {
    font-size: 3rem;
    color: var(--light-gray);
    margin-bottom: 1.5rem;
}

.empty-state h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
}

.empty-state p {
    color: var(--gray-color);
    margin-bottom: 1.5rem;
    max-width: 400px;
}

/* Profile Section */
.profile-section {
    background-color: white;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    padding: 2rem;
}

.profile-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
}

.profile-avatar {
    display: flex;
    gap: 1.5rem;
}

.avatar-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.profile-actions {
    display: flex;
    gap: 1rem;
}

.edit-actions {
    display: flex;
    gap: 1rem;
}

.profile-details {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
}

.detail-row {
    margin-bottom: 1.5rem;
}

.detail-row label {
    display: block;
    color: var(--gray-color);
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
}

.detail-row p {
    font-size: 1rem;
}

.profile-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-row {
    display: flex;
    gap: 1.5rem;
}

.form-group {
    flex: 1;
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--light-gray);
    border-radius: var(--border-radius);
    font-size: 1rem;
    transition: var(--transition);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px var(--primary-light);
}

.address-fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.address-row {
    display: flex;
    gap: 1rem;
}

.address-row .form-group {
    flex: 1;
}

.form-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.form-checkbox input {
    width: auto;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
}

/* Addresses Section */
.addresses-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
}

.address-card {
    background-color: white;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    padding: 1.5rem;
    border: 1px solid var(--light-gray);
    transition: var(--transition);
}

.address-card.default {
    border-color: var(--primary-color);
    border-width: 2px;
}

.address-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.default-badge {
    background-color: var(--primary-light);
    color: var(--primary-color);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
}

.address-details p {
    margin-bottom: 0.5rem;
}

.address-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.5rem;
}

.action-icons {
    display: flex;
    gap: 0.5rem;
}

.icon-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--light-color);
    color: var(--gray-color);
    transition: var(--transition);
}

.icon-btn:hover {
    background-color: var(--primary-light);
    color: var(--primary-color);
}

.address-card.add-new {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed var(--light-gray);
    cursor: pointer;
    background-color: transparent;
}

.address-card.add-new:hover {
    border-color: var(--primary-color);
    background-color: var(--primary-light);
}

.add-new-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: var(--gray-color);
}

.address-card.add-new:hover .add-new-content {
    color: var(--primary-color);
}

.address-card.add-new svg {
    font-size: 1.5rem;
}

.address-card.add-form {
    grid-column: 1 / -1;
}

/* Security Section */
.security-settings {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.security-card {
    background-color: white;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid var(--light-gray);
}

.security-header {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.security-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: var(--primary-light);
    color: var(--primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    flex-shrink: 0;
}

.security-info h3 {
    margin-bottom: 0.25rem;
}

.security-info p {
    color: var(--gray-color);
    font-size: 0.9rem;
}

.security-status {
    margin-top: 0.5rem;
}

.status-enabled {
    color: #28a745;
    font-size: 0.85rem;
    font-weight: 500;
}

.status-disabled {
    color: var(--gray-color);
    font-size: 0.85rem;
    font-weight: 500;
}

.security-advanced {
    background-color: white;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    padding: 2rem;
}

.advanced-options {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.option-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--light-gray);
}

.option-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
}

.option-row h4 {
    margin-bottom: 0.25rem;
}

.option-row p {
    color: var(--gray-color);
    font-size: 0.9rem;
}

/* Responsive Breakpoints */
@media (max-width: 1200px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .quick-actions {
        grid-template-columns: repeat(2, 1fr);
    }

    .security-settings {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 992px) {
    .dashboard-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        transform: translateX(-100%);
        z-index: 1000;
    }

    .dashboard-sidebar.mobile-open {
        transform: translateX(0);
    }

    .mobile-menu-toggle {
        display: block;
    }

    .dashboard-content {
        margin-left: 0;
        padding: 1.5rem;
    }

    .profile-details {
        grid-template-columns: 1fr;
    }

    .form-row {
        flex-direction: column;
        gap: 1rem;
    }
}

@media (max-width: 768px) {
    .dashboard-topbar {
        padding: 1rem;
    }

    .topbar-left {
        gap: 1rem;
    }

    .search-bar {
        display: none;
    }

    .orders-filter {
        flex-direction: column;
        align-items: stretch;
    }

    .filter-options {
        flex-direction: column;
        gap: 0.75rem;
    }

    .filter-options select {
        width: 100%;
    }

    .addresses-grid {
        grid-template-columns: 1fr;
    }

    .order-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .order-status {
        width: 100%;
        justify-content: space-between;
    }

    .order-footer {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }

    .order-actions {
        justify-content: flex-end;
    }

    .profile-header {
        flex-direction: column;
        gap: 1.5rem;
    }

    .profile-avatar {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .avatar-actions {
        flex-direction: row;
        justify-content: center;
    }

    .profile-actions {
        width: 100%;
        justify-content: flex-end;
    }
}

@media (max-width: 576px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }

    .quick-actions {
        grid-template-columns: 1fr;
    }

    .order-card {
        padding: 1rem;
    }

    .order-items {
        padding: 1rem;
    }

    .order-item {
        flex-direction: column;
    }

    .item-image {
        width: 100%;
        height: 120px;
    }

    .notifications-panel {
        width: 280px;
    }

    .dropdown-menu {
        width: 240px;
    }

    .dashboard-content {
        padding: 1rem;
    }

    .content-header h1 {
        font-size: 1.5rem;
    }

    .section-header h2 {
        font-size: 1.1rem;
    }

    .security-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.5rem;
    }

    .option-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .option-row button {
        align-self: flex-end;
    }
}`}</style>
    </div>
  );
};

export default Dashboard;