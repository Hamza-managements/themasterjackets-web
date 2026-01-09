import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/AdminOrderDetails.css';
import { AuthContext } from '../../context/AuthContext';
import { getUserOrderById, cancelOrderWithId, confirmOrderWithOrderId, updateShipmentWithOrderId } from '../../utils/OrderUtils';

const AdminOrderDetails = () => {
    const { user } = useContext(AuthContext);
    const { orderId, userId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [editingField, setEditingField] = useState(null);
    const [tempValue, setTempValue] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Form states
    const [trackingInfo, setTrackingInfo] = useState({
        orderId: '',
        trackingNumber: '',
        carrier: 'FedEx',
    });
    const [refundData, setRefundData] = useState({
        amount: 0,
        reason: '',
        notes: ''
    });
    const [returnData, setReturnData] = useState({
        status: 'pending',
        reason: '',
        action: 'refund',
        notes: ''
    });

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const data = await getUserOrderById(userId);
            const selectedOrder = data?.data?.find(
                (order) => order._id === orderId
            );
            setOrder(selectedOrder);
            if (selectedOrder.fulfillment) {
                setTrackingInfo({
                    orderId: orderId,
                    trackingNumber: selectedOrder.fulfillment.trackingNumber || '',
                    carrier: selectedOrder.fulfillment.carrier || 'FedEx',
                });
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
        } finally {
            setLoading(false);
        }
    };

    // Update fulfillment status
    const updateFulfillmentStatus = async (status) => {
        try {
            setIsUpdating(true);
            await UpdateFulfillmentStatus(user?.uid, orderId, status);
            fetchOrderDetails();
        } catch (error) {
            console.error('Error updating fulfillment:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Update tracking info
    const handleUpdateTracking = async () => {
        try {
            setIsUpdating(true);
            console.log("Updating tracking with info:", trackingInfo);
            await updateShipmentWithOrderId(user?.uid, trackingInfo);
            fetchOrderDetails();
        } catch (error) {
            console.error('Error updating tracking:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Process refund
    const handleProcessRefund = async () => {
        try {
            setIsUpdating(true);
            await ProcessRefund(user?.uid, orderId, refundData);
            fetchOrderDetails();
            setRefundData({ amount: 0, reason: '', notes: '' });
        } catch (error) {
            console.error('Error processing refund:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Update return status
    const handleUpdateReturn = async () => {
        try {
            setIsUpdating(true);
            await UpdateReturnStatus(user?.uid, orderId, returnData);
            fetchOrderDetails();
        } catch (error) {
            console.error('Error updating return:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Cancel order
    const handleCancelOrder = async () => {
        try {
            setIsUpdating(true);
            await cancelOrderWithId(user?.uid, orderId);
            fetchOrderDetails();
        } catch (error) {
            console.error('Error cancelling order:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Update order status
    const updateOrderStatus = async (status) => {
        try {
            setIsUpdating(true);
            if (status === 'confirmed') {
                await confirmOrderWithOrderId(user?.uid, orderId);
            }
            fetchOrderDetails();
        } catch (error) {
            console.error('Error updating order status:', error);
        } finally {
            setIsUpdating(false);
        }
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
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="admin-order-details loading">
                <div className="loading-spinner"></div>
                <p>Loading order details...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="admin-order-details not-found">
                <h2>Order not found</h2>
                <button onClick={() => navigate('/admin/orders')}>Back to Orders</button>
            </div>
        );
    }

    return (
        <div className="admin-order-details">
            {/* Header */}
            <div className="order-header">
                <div className="header-top">
                    <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
                        ← Back to Orders
                    </button>
                    <div className="header-actions">
                        <button className="btn-print" onClick={() => window.print()}>
                            🖨️ Print
                        </button>
                        <button className="btn-email">
                            ✉️ Email Customer
                        </button>
                    </div>
                </div>

                <div className="header-main">
                    <div>
                        <h1>Order #{order.orderNumber}</h1>
                        <div className="order-meta">
                            <span className="order-date">Placed on {formatDate(order.createdAt)}</span>
                            <span className="order-source">The Master Jackets</span>
                        </div>
                    </div>

                    <div className="status-actions">
                        <select
                            className="status-select"
                            value={order.orderStatus}
                            onChange={(e) => updateOrderStatus(e.target.value)}
                            disabled={isUpdating || order.orderStatus === 'cancelled'}
                        >
                            <option value="shipped">Shipped</option>
                            <option value="placed">Placed</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="returned">Returned</option>
                        </select>
                        <button
                            className="btn-cancel"
                            onClick={handleCancelOrder}
                            disabled={isUpdating || order.orderStatus === 'cancelled'}
                        >
                            Cancel Order
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <nav className="order-tabs">
                <button
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📋 Overview
                </button>
                <button
                    className={`tab-btn ${activeTab === 'fulfillment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('fulfillment')}
                >
                    🚚 Fulfillment
                </button>
                <button
                    className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payment')}
                >
                    💳 Payment
                </button>
                <button
                    className={`tab-btn ${activeTab === 'returns' ? 'active' : ''}`}
                    onClick={() => setActiveTab('returns')}
                >
                    ↩️ Returns & Refunds
                </button>
                {/* <button
                    className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notes')}
                >
                    📝 Notes & History
                </button> */}
            </nav>

            <div className="order-details-body">
                <div className="order-content">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="tab-content">
                            <div className="overview-grid">
                                {/* Order Summary */}
                                <div className="order-summary">
                                    <h3>Order Summary</h3>
                                    <div className="summary-card">
                                        <div className="summary-row">
                                            <span>Subtotal</span>
                                            <span>{formatCurrency(order.pricing.subTotal)}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Shipping</span>
                                            <span>{order.pricing.shippingCharges === 0 ? 'FREE' : formatCurrency(order.pricing.shippingCharges)}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Tax</span>
                                            <span>{formatCurrency(order.pricing.tax)}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Discount</span>
                                            <span className="discount">-{formatCurrency(order.pricing.discount)}</span>
                                        </div>
                                        <div className="summary-row total">
                                            <span>Total</span>
                                            <span>{formatCurrency(order.pricing.grandTotal)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="customer-info">
                                    <h3>Customer Information</h3>
                                    <div className="info-card">
                                        <div className="customer-header">
                                            <div className="customer-avatar">
                                                {order.userDetails.userId.userName.charAt(0)}
                                            </div>
                                            <div>
                                                <h4>{order.userDetails.userId.userName}</h4>
                                                <p className="customer-email">{order.userDetails.userId.email}</p>
                                            </div>
                                        </div>
                                        <div className="customer-details">
                                            <p><strong>Customer ID:</strong> {order.userDetails.userId._id}</p>
                                            <p><strong>Account:</strong> Registered Customer</p>
                                            <p><strong>Orders:</strong> 5 total orders</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="order-items">
                                    <h3>Order Items</h3>
                                    <div className="items-list">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="order-item">
                                                <img
                                                    src={item.productId.productImages[0]}
                                                    alt={item.productId.productName}
                                                    className="item-image"
                                                />
                                                <div className="item-details">
                                                    <h4>{item.productId.productName}</h4>
                                                    <div className="item-variants">
                                                        <span>Size: {item.selectedAttributes.size}</span>
                                                        <span>Color: {item.selectedAttributes.color}</span>
                                                    </div>
                                                    <div className="item-price">
                                                        <span>{item.quantity} × {formatCurrency(item.unitPrice)}</span>
                                                        <strong>{formatCurrency(item.totalPrice)}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Shipping & Billing */}
                                <div className="shipping-billing">
                                    <div className="address-card">
                                        <h4>Shipping Address</h4>
                                        <p><strong>{order.shippingAddress.fullName}</strong></p>
                                        <p>{order.shippingAddress.addressLine1}</p>
                                        {order.shippingAddress.addressLine2 && (
                                            <p>{order.shippingAddress.addressLine2}</p>
                                        )}
                                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                                        <p>{order.shippingAddress.country}</p>
                                        <p className="phone">📱 {order.shippingAddress.phone || 'No phone provided'}</p>
                                    </div>

                                    <div className="address-card">
                                        <h4>Billing Address</h4>
                                        <p><em>Same as shipping address</em></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Fulfillment Tab */}
                    {activeTab === 'fulfillment' && (
                        <div className="tab-content">
                            <div className="fulfillment-grid">
                                {/* Fulfillment Status */}
                                <div className="fulfillment-status">
                                    <h3>Fulfillment Status</h3>
                                    <div className="status-timeline">
                                        <div className={`timeline-step ${order.fulfillment.status === 'pending' ? 'active' : ''}`}>
                                            <div className="step-icon">📦</div>
                                            <div className="step-content">
                                                <h4>Order Placed</h4>
                                                <p>{formatDate(order.createdAt)}</p>
                                            </div>
                                        </div>

                                        <div className={`timeline-step ${order.fulfillment.status === 'processing' ? 'active' : ''}`}>
                                            <div className="step-icon">⚙️</div>
                                            <div className="step-content">
                                                <h4>Processing</h4>
                                                {order.fulfillment.status === 'processing' && <p>In progress</p>}
                                            </div>
                                            <button
                                                className="step-action"
                                                onClick={() => updateFulfillmentStatus('processing')}
                                                disabled={isUpdating || order.fulfillment.status !== 'pending'}
                                            >
                                                Mark as Processing
                                            </button>
                                        </div>

                                        <div className={`timeline-step ${order.fulfillment.status === 'shipped' ? 'active' : ''}`}>
                                            <div className="step-icon">🚚</div>
                                            <div className="step-content">
                                                <h4>Shipped</h4>
                                                {order.fulfillment.shippedAt && (
                                                    <p>{formatDate(order.fulfillment.shippedAt)}</p>
                                                )}
                                            </div>
                                            <button
                                                className="step-action"
                                                onClick={() => updateFulfillmentStatus('shipped')}
                                                disabled={isUpdating || order.fulfillment.status === 'shipped'}
                                            >
                                                Mark as Shipped
                                            </button>
                                        </div>

                                        <div className={`timeline-step ${order.fulfillment.status === 'delivered' ? 'active' : ''}`}>
                                            <div className="step-icon">✅</div>
                                            <div className="step-content">
                                                <h4>Delivered</h4>
                                                {order.fulfillment.deliveredAt && (
                                                    <p>{formatDate(order.fulfillment.deliveredAt)}</p>
                                                )}
                                            </div>
                                            <button
                                                className="step-action"
                                                onClick={() => updateFulfillmentStatus('delivered')}
                                                disabled={isUpdating || order.fulfillment.status === 'delivered'}
                                            >
                                                Mark as Delivered
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Tracking Information */}
                                <div className="tracking-info">
                                    <h3>Tracking Information</h3>
                                    {order.fulfillment.trackingNumber && (
                                        <div className="current-tracking">
                                            <h4>Current Tracking</h4>
                                            <p><strong>Number:</strong> {order.fulfillment.trackingNumber}</p>
                                            <p><strong>Carrier:</strong> {order.fulfillment.carrier}</p>
                                            <a
                                                href={`https://tools.usps.com/go/TrackConfirmAction?tRef=fullpage&tLabels=${order.fulfillment.trackingNumber}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="track-link"
                                            >
                                                Track Package
                                            </a>
                                        </div>
                                    )}
                                    <div className="tracking-card">
                                        <div className="form-group">
                                            <label>Tracking Number</label>
                                            <input
                                                type="text"
                                                value={trackingInfo.trackingNumber}
                                                onChange={(e) => setTrackingInfo({
                                                    ...trackingInfo,
                                                    trackingNumber: e.target.value
                                                })}
                                                placeholder="Enter tracking number"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Carrier</label>
                                            <select
                                                value={trackingInfo.carrier}
                                                onChange={(e) => setTrackingInfo({
                                                    ...trackingInfo,
                                                    carrier: e.target.value
                                                })}
                                            >
                                                <option value="USPS">USPS</option>
                                                <option value="UPS">UPS</option>
                                                <option value="FedEx">FedEx</option>
                                                <option value="DHL">DHL</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <button
                                            className="btn-save"
                                            onClick={handleUpdateTracking}
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? 'Updating...' : 'Update Tracking Info'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Tab */}
                    {activeTab === 'payment' && (
                        <div className="tab-content">
                            <div className="payment-grid">
                                <div className="payment-details">
                                    <h3>Payment Details</h3>
                                    <div className="payment-card">
                                        <div className="payment-method">
                                            <div className="method-icon">💳</div>
                                            <div>
                                                <h4>{order.payment.method}</h4>
                                                <p className={`payment-status status-${order.payment.status}`}>
                                                    {order.payment.status.toUpperCase()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="payment-info">
                                            <div className="info-row">
                                                <span>Amount Charged :</span>
                                                <span> {formatCurrency(order.pricing.grandTotal)}</span>
                                            </div>
                                            {order.payment.transactionId && (
                                                <div className="info-row">
                                                    <span>Transaction ID</span>
                                                    <span className="transaction-id">{order.payment.transactionId}</span>
                                                </div>
                                            )}
                                            <div className="info-row">
                                                <span>Payment Date :</span>
                                                <span>{formatDate(order.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="refund-section">
                                    <h3>Issue Refund</h3>
                                    <div className="refund-card">
                                        <div className="form-group">
                                            <label>Refund Amount</label>
                                            <div className="amount-input">
                                                <span className="currency">$</span>
                                                <input
                                                    type="number"
                                                    value={refundData.amount}
                                                    onChange={(e) => setRefundData({
                                                        ...refundData,
                                                        amount: parseFloat(e.target.value)
                                                    })}
                                                    min="0"
                                                    max={order.pricing.grandTotal}
                                                    step="0.01"
                                                />
                                                <span className="max-amount" onClick={() => setRefundData({
                                                    ...refundData,
                                                    amount: order.pricing.grandTotal
                                                })}>
                                                    Max: {formatCurrency(order.pricing.grandTotal)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Reason for Refund</label>
                                            <select
                                                value={refundData.reason}
                                                onChange={(e) => setRefundData({
                                                    ...refundData,
                                                    reason: e.target.value
                                                })}
                                            >
                                                <option value="">Select a reason</option>
                                                <option value="customer_request">Customer Request</option>
                                                <option value="defective">Defective Product</option>
                                                <option value="wrong_item">Wrong Item Sent</option>
                                                <option value="late_delivery">Late Delivery</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Notes (Optional)</label>
                                            <textarea
                                                value={refundData.notes}
                                                onChange={(e) => setRefundData({
                                                    ...refundData,
                                                    notes: e.target.value
                                                })}
                                                rows="3"
                                                placeholder="Add any additional notes..."
                                            />
                                        </div>

                                        <button
                                            className="btn-process-refund"
                                            onClick={handleProcessRefund}
                                            disabled={isUpdating || !refundData.amount || !refundData.reason}
                                        >
                                            {isUpdating ? 'Processing...' : 'Process Refund'}
                                        </button>
                                    </div>

                                    {order.refund && (
                                        <div className="refund-history">
                                            <h4>Refund History</h4>
                                            <div className="refund-item">
                                                <div className="refund-header">
                                                    <span>Refund #{order.refund.refundId}</span>
                                                    <span className="refund-amount">{formatCurrency(order.refund.amount)}</span>
                                                </div>
                                                <p><strong>Status:</strong> {order.refund.status}</p>
                                                <p><strong>Reason:</strong> {order.refund.reason}</p>
                                                <p><strong>Date:</strong> {formatDate(order.refund.processedAt)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Returns & Refunds Tab */}
                    {activeTab === 'returns' && (
                        <div className="tab-content">
                            <div className="returns-grid">
                                <div className="returns-management">
                                    <h3>Returns Management</h3>

                                    {order.refund ? (
                                        <div className="return-status">
                                            <div className="status-header">
                                                <h4>Return Request</h4>
                                                <span className={`status-badge status-${order.refund.status}`}>
                                                    {order.refund.status}
                                                </span>
                                            </div>

                                            <div className="return-details">
                                                <div className="form-group">
                                                    <label>Return Status</label>
                                                    <select
                                                        value={returnData.status}
                                                        onChange={(e) => setReturnData({
                                                            ...returnData,
                                                            status: e.target.value
                                                        })}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="approved">Approved</option>
                                                        <option value="received">Received</option>
                                                        <option value="processed">Processed</option>
                                                        <option value="rejected">Rejected</option>
                                                    </select>
                                                </div>

                                                <div className="form-group">
                                                    <label>Action</label>
                                                    <select
                                                        value={returnData.action}
                                                        onChange={(e) => setReturnData({
                                                            ...returnData,
                                                            action: e.target.value
                                                        })}
                                                    >
                                                        <option value="refund">Refund</option>
                                                        <option value="exchange">Exchange</option>
                                                        <option value="store_credit">Store Credit</option>
                                                    </select>
                                                </div>

                                                <div className="form-group">
                                                    <label>Reason</label>
                                                    <textarea
                                                        value={returnData.reason}
                                                        onChange={(e) => setReturnData({
                                                            ...returnData,
                                                            reason: e.target.value
                                                        })}
                                                        rows="2"
                                                        placeholder="Update return reason..."
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label>Notes</label>
                                                    <textarea
                                                        value={returnData.notes}
                                                        onChange={(e) => setReturnData({
                                                            ...returnData,
                                                            notes: e.target.value
                                                        })}
                                                        rows="2"
                                                        placeholder="Add internal notes..."
                                                    />
                                                </div>

                                                <button
                                                    className="btn-update-return"
                                                    onClick={handleUpdateReturn}
                                                    disabled={isUpdating}
                                                >
                                                    {isUpdating ? 'Updating...' : 'Update Return'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="no-returns">
                                            <p>No return requests for this order.</p>
                                            <button className="btn-create-return">
                                                Create Return Request
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="return-policy">
                                    <h3>Return Policy</h3>
                                    <div className="policy-card">
                                        <div className="policy-item">
                                            <span className="policy-icon">📅</span>
                                            <div>
                                                <h4>30-Day Return Window</h4>
                                                <p>Items must be returned within 30 days of delivery</p>
                                            </div>
                                        </div>
                                        <div className="policy-item">
                                            <span className="policy-icon">🏷️</span>
                                            <div>
                                                <h4>Original Condition</h4>
                                                <p>Items must be unused, with tags attached</p>
                                            </div>
                                        </div>
                                        <div className="policy-item">
                                            <span className="policy-icon">📦</span>
                                            <div>
                                                <h4>Original Packaging</h4>
                                                <p>Items must be in original packaging</p>
                                            </div>
                                        </div>
                                        <div className="policy-item">
                                            <span className="policy-icon">💸</span>
                                            <div>
                                                <h4>Refund Method</h4>
                                                <p>Refunds issued to original payment method within 5-10 business days</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes & History Tab */}
                    {/* {activeTab === 'notes' && (
                        <div className="tab-content">
                            <div className="notes-history-grid">
                                <div className="order-notes">
                                    <h3>Order Notes</h3>
                                    <div className="notes-card">
                                        <div className="notes-list">
                                            <div className="note-item">
                                                <div className="note-header">
                                                    <span className="note-author">Admin</span>
                                                    <span className="note-date">Today, 10:30 AM</span>
                                                </div>
                                                <p className="note-content">Order marked as processing. Awaiting stock confirmation.</p>
                                            </div>
                                            <div className="note-item">
                                                <div className="note-header">
                                                    <span className="note-author">System</span>
                                                    <span className="note-date">Yesterday, 14:22 PM</span>
                                                </div>
                                                <p className="note-content">Order placed successfully. Payment received.</p>
                                            </div>
                                        </div>

                                        <div className="add-note">
                                            <textarea
                                                placeholder="Add a note about this order..."
                                                rows="3"
                                            />
                                            <button className="btn-add-note">
                                                Add Note
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="order-history">
                                    <h3>Order History</h3>
                                    <div className="history-card">
                                        <div className="history-timeline">
                                            <div className="history-event">
                                                <div className="event-icon">🔄</div>
                                                <div className="event-content">
                                                    <p>Order status changed to <strong>Processing</strong></p>
                                                    <span className="event-time">Today, 10:30 AM</span>
                                                </div>
                                            </div>
                                            <div className="history-event">
                                                <div className="event-icon">📦</div>
                                                <div className="event-content">
                                                    <p>Order placed by customer</p>
                                                    <span className="event-time">{formatDate(order.createdAt)}</span>
                                                </div>
                                            </div>
                                            <div className="history-event">
                                                <div className="event-icon">💳</div>
                                                <div className="event-content">
                                                    <p>Payment received via {order.payment.method}</p>
                                                     <span className="event-time">Yesterday, 14:22 PM</span> 
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )} */}
                </div>

                {/* Quick Actions Sidebar */}
                <aside className="quick-actions-sidebar">
                    <h3>Quick Actions</h3>

                    <div className="order-details-action-buttons">
                        <button className="order-details-action-btn">
                            📦 Create Shipping Label
                        </button>
                        <button className="order-details-action-btn">
                            ✉️ Send Shipping Notification
                        </button>
                        {/* <button className="order-details-action-btn">
                            🎁 Add Gift Note
                        </button>
                        <button className="order-details-action-btn">
                            🔄 Resend Invoice
                        </button>
                        <button className="order-details-action-btn">
                            📋 Duplicate Order
                        </button> */}
                        <button className="order-details-action-btn danger" onClick={handleCancelOrder} disabled={order.orderStatus === 'cancelled'}>
                            ❌ Cancel Order
                        </button>
                    </div>

                    <div className="order-metadata">
                        <h4>Metadata</h4>
                        <div className="metadata-item">
                            <span>Order ID:</span>
                            <code>{order._id}</code>
                        </div>
                        <div className="metadata-item">
                            <span>Created:</span>
                            <span>{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="metadata-item">
                            <span>Updated:</span>
                            <span>{formatDate(order.updatedAt)}</span>
                        </div>
                        <div className="metadata-item">
                            <span>IP Address:</span>
                            <span>192.168.1.1</span>
                        </div>
                    </div>
                </aside>
            </div>

        </div>
    );
};

const UpdateFulfillmentStatus = async (uid, orderId, status) => {
    // Your API call implementation
    return { success: true };
};

const ProcessRefund = async (uid, orderId, refundData) => {
    // Your API call implementation
    return { success: true };
};

const UpdateReturnStatus = async (uid, orderId, returnData) => {
    // Your API call implementation
    return { success: true };
};

export default AdminOrderDetails;