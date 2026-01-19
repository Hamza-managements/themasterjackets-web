import { useState, useEffect, useCallback } from 'react';
import './styles/AdminAllOrder.css';
import { cancelOrderWithId, GetAllOrder } from '../utils/OrderUtils';
import { Search } from 'lucide-react';

const AdminAllOrderDashboard = ({ user }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(10);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        revenue: 0
    });

    const fetchOrders = useCallback(async () => {
        if (!user?.uid) return;

        try {
            setLoading(true);
            const response = await GetAllOrder(user.uid);
            setOrders(response.data);
            calculateStats(response.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    }, [user?.uid]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const calculateStats = (ordersData) => {
        const statsData = {
            total: ordersData.length,
            pending: ordersData.filter(o => o.orderStatus === 'pending').length,
            processing: ordersData.filter(o => o.orderStatus === 'processing').length,
            shipped: ordersData.filter(o => o.orderStatus === 'shipped').length,
            delivered: ordersData.filter(o => o.orderStatus === 'delivered').length,
            cancelled: ordersData.filter(o => o.orderStatus === 'cancelled').length,
            revenue: ordersData.reduce((sum, order) => sum + order.pricing.grandTotal, 0)
        };
        setStats(statsData);
    };

    // Filter and search orders
    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.userDetails.userId.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;

        // Date filtering logic
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const matchesDate = dateFilter === 'all' ||
            (dateFilter === 'today' && orderDate.toDateString() === now.toDateString()) ||
            (dateFilter === 'week' && (now - orderDate) <= 7 * 24 * 60 * 60 * 1000) ||
            (dateFilter === 'month' && orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear());

        return matchesSearch && matchesStatus && matchesDate;
    });

    // Pagination
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    // Handle bulk actions
    const handleBulkAction = (action) => {
        switch (action) {
            case 'mark_processing':
                updateOrderStatus(selectedOrders, 'processing');
                break;
            case 'mark_shipped':
                updateOrderStatus(selectedOrders, 'shipped');
                break;
            case 'mark_delivered':
                updateOrderStatus(selectedOrders, 'delivered');
                break;
            case 'cancel':
                handleCancelOrder(selectedOrders, 'cancelled');
                break;
            case 'print_labels':
                printShippingLabels(selectedOrders);
                break;
            default:
                break;
        }
        setSelectedOrders([]);
    };

    const updateOrderStatus = async (orderIds, status) => {
        try {
            if (status === 'cancelled') {
                await handleCancelOrder(orderIds);
            } else {
                await UpdateOrderStatus(orderIds, status);
                fetchOrders();
            }
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const handleCancelOrder = async (orderIds) => {
        try {
            await cancelOrderWithId(user?.uid, orderIds);
            fetchOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const printShippingLabels = (orderIds) => {
        // Implementation for printing labels
        console.log('Printing labels for orders:', orderIds);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'placed': return '#f59e0b';
            case 'confirmed': return '#3b82f6';
            case 'shipped': return '#8b5cf6';
            case 'completed': return '#10b981';
            case 'cancelled': return '#ef4444';
            case 'returned': return '#ef4444';
            default: return '#6b7280';
        }
    };

    return (
        <div className="admin-order-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <h1>Order Management</h1>
                <div className="header-actions">
                    <button className="btn-export" onClick={fetchOrders}>
                        Refresh
                    </button>
                    <button className="btn-export">
                        Export Report
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Sales</span>
                    </div>
                    <div className="stat-value">{formatCurrency(stats.revenue)}</div>
                    <div className="stat-change">+18% from last month</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Total Orders</span>
                    </div>
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-change">+12% from last month</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Pending</span>
                    </div>
                    <div className="stat-value">{stats.pending}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Confirmed</span>
                    </div>
                    <div className="stat-value">{stats.shipped}</div>
                    <div className="stat-change">{Math.round((stats.shipped / stats.total) * 100)}% of total</div>
                </div>
            </div>

            {/* Filters and Controls */}
            <div className="filters-section">
                <div className="filter-group">
                    <div className="search-box">
                        <Search
                            className="search-icon"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Search orders, customers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className="filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="placed">Placed</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="returned">Returned</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <select
                        className="filter-select"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                </div>

                <div className="bulk-actions">
                    <select
                        className="bulk-select"
                        onChange={(e) => handleBulkAction(e.target.value)}
                        value=""
                        disabled={selectedOrders.length === 0}
                    >
                        <option value="" disabled>Bulk Actions</option>
                        <option value="mark_processing">Mark as Processing</option>
                        <option value="mark_shipped">Mark as Shipped</option>
                        <option value="mark_delivered">Mark as Delivered</option>
                        <option value="cancel">Cancel Orders</option>
                        <option value="print_labels">Print Shipping Labels</option>
                    </select>
                    <span className="selected-count">
                        {selectedOrders.length} selected
                    </span>
                </div>
            </div>

            {/* Orders Table */}
            <div className="orders-table-container">
                {loading ? (
                    <div className="loading">Loading orders...</div>
                ) : (
                    <>
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.length === currentOrders.length}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedOrders(currentOrders.map(o => o._id));
                                                } else {
                                                    setSelectedOrders([]);
                                                }
                                            }}
                                        />
                                    </th>
                                    <th>Order ID</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentOrders.map((order) => (
                                    <tr key={order._id} className='order-line'>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order._id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedOrders([...selectedOrders, order._id]);
                                                    } else {
                                                        setSelectedOrders(selectedOrders.filter(id => id !== order._id));
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <a href={`/admin/orders/${order._id}/${order.userDetails.userId._id}`} className="order-link">
                                                {order.orderNumber}
                                            </a>
                                        </td>
                                        <td className="customer-email">{formatDate(order.createdAt)}</td>
                                        <td>
                                            <div className="customer-info">
                                                <div className="customer-name">{order.shippingAddress.fullName}</div>
                                                <div className="customer-email">{order.userDetails.userId.email}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="items-count">
                                                <img src={order.items[0]?.productId?.productImages[0] || ''} alt="" />
                                                <span title={order.items[0]?.productId?.productName}>{order.items[0]?.productId?.productName?.slice(0, 15)}...</span>
                                            </div>
                                        </td>
                                        <td className="total-amount">
                                            {formatCurrency(order.pricing.grandTotal)}
                                        </td>
                                        <td>
                                            <span
                                                className="status-badge"
                                                style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                                            >
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="all-order-payment-status">
                                                <span className={`payment-dot ${order.payment.status}`}></span>
                                                <span>
                                                    {order.payment.method} - {order.payment.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                {/* <button
                                                    className="btn-view"
                                                    onClick={() => window.location.href = `/admin/orders/${order._id}/${order.userDetails.userId._id}`}
                                                >
                                                    👁️
                                                </button>
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => editOrder(order._id)}
                                                >
                                                    ✏️
                                                </button> */}
                                                <select
                                                    className="status-dropdown"
                                                    value={order.orderStatus}
                                                    onChange={(e) => updateOrderStatus([order._id], e.target.value)}
                                                    disabled={order.orderStatus === 'cancelled' || order.orderStatus === 'delivered'}
                                                >
                                                    <option value="placed">Placed</option>
                                                    <option value="confirmed">Confirmed</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredOrders.length === 0 && (
                            <div className="no-orders">
                                <div className="no-orders-icon">📭</div>
                                <h3>No orders found</h3>
                                <p>Try adjusting your search or filters</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {filteredOrders.length > 0 && (
                            <div className="pagination">
                                <button
                                    className="pagination-btn"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    ← Previous
                                </button>

                                <div className="page-numbers">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                                                onClick={() => setCurrentPage(pageNum)}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    {totalPages > 5 && currentPage < totalPages - 2 && (
                                        <>
                                            <span className="ellipsis">...</span>
                                            <button
                                                className="page-btn"
                                                onClick={() => setCurrentPage(totalPages)}
                                            >
                                                {totalPages}
                                            </button>
                                        </>
                                    )}
                                </div>

                                <button
                                    className="pagination-btn"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
                <h3>Order Status Distribution</h3>
                <div className="status-distribution">
                    <div className="status-item">
                        <span className="status-dot pending"></span>
                        <span>Pending: {stats.pending}</span>
                    </div>
                    <div className="status-item">
                        <span className="status-dot processing"></span>
                        <span>Processing: {stats.processing}</span>
                    </div>
                    <div className="status-item">
                        <span className="status-dot shipped"></span>
                        <span>Shipped: {stats.shipped}</span>
                    </div>
                    <div className="status-item">
                        <span className="status-dot delivered"></span>
                        <span>Delivered: {stats.delivered}</span>
                    </div>
                    <div className="status-item">
                        <span className="status-dot cancelled"></span>
                        <span>Cancelled: {stats.cancelled}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UpdateOrderStatus = async (orderIds, status) => {
    // Your API call implementation
    return { success: true };
};

export default AdminAllOrderDashboard;