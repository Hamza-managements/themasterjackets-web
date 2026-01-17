import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/AdminOrderDetails.css';
import { AuthContext } from '../../context/AuthContext';
import { getUserOrderById, cancelOrderWithId, confirmOrderWithOrderId, updateShipmentWithOrderId, completeOrderWithOrderId } from '../../utils/OrderUtils';
import { useToast } from '../../context/ToastProvider';

const AdminOrderDetails = () => {
    const { user } = useContext(AuthContext);
    const { orderId, userId } = useParams();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [isUpdating, setIsUpdating] = useState(false);
    const [openFulfillment, setOpenFulfillment] = useState(false);

    console.log('Order Data:', order);

    // Form states
    const [trackingInfo, setTrackingInfo] = useState({
        orderId: '',
        email: '',
        trackingNumber: '',
        carrier: 'FEDEX',
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
                    email: selectedOrder.userDetails.userId.email,
                    trackingNumber: selectedOrder.fulfillment.trackingNumber || '',
                    carrier: selectedOrder.fulfillment.carrier || 'FEDEX',
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
            await updateShipmentWithOrderId(user?.uid, trackingInfo);
            fetchOrderDetails();
            showToast({ type: "success", message: `Order tracking updated Succesfullly` });
        } catch (error) {
            console.error('Error updating tracking:', error);
            showToast({ type: "error", message: `Failed to update order status, Try Again` });
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
            showToast({ type: "success", message: `Order status updated to Cancelled` });
        } catch (error) {
            console.error('Error cancelling order:', error);
            showToast({ type: "error", message: `Failed to update order status, Try Again` });
        } finally {
            setIsUpdating(false);
        }
    };

    // Update order status
    const updateOrderStatus = async (status) => {
        const actions = {
            confirmed: confirmOrderWithOrderId,
            completed: completeOrderWithOrderId,
        };

        try {
            setIsUpdating(true);

            const action = actions[status];
            if (!action) {
                showToast({ type: "error", message: `Unknown status: ${status}` });
                return;
            }

            await action(user?.uid, orderId);
            await fetchOrderDetails();
            showToast({ type: "success", message: `Order status updated to "${status.charAt(0).toUpperCase() + status.slice(1)}"` });
        } catch (error) {
            console.error("Failed to update order status:", error);
            showToast({ type: "error", message: `Failed to update order status, Try Again` });
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

    const getStatusClasses = (status) => {
        switch (status?.toLowerCase()) {
            case "shipped":
                return "bg-blue-100 text-blue-700";
            case "confirmed":
                return "bg-green-100 text-green-700";
            case "cancelled":
                return "bg-red-100 text-red-700";
            case "placed":
            default:
                return "bg-yellow-100 text-yellow-700";
        }
    };

    const getVariantSKU = (product, selectedAttributes) => {
        const variant = product?.variations?.find(
            (v) =>
                v?.attributes?.size === selectedAttributes?.size &&
                v?.attributes?.color === selectedAttributes?.color
        );

        return variant?.stockKeepingUnit || "N/A";
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
                    <button className="back-btn" onClick={() => navigate('/admin/dashboard?orders')}>
                        ← Back to Orders
                    </button>
                    <div className="header-actions">
                        <button className="btn-print" onClick={() => window.print()}>
                            🖨️ Print
                        </button>
                        <button className="btn-email">
                            ✉️ Email Customer
                        </button>
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

                {/* <div className="header-main">
                    <div>
                        <h1>Order #{order.orderNumber}</h1>
                        <div className="order-meta">
                            <span className="order-date">Placed on {formatDate(order.createdAt)}</span>
                            <span className="order-source">The Master Jackets</span>
                        </div>
                    </div>
                </div> */}
            </div>

            {/* Tabs Navigation */}
            <nav className="order-tabs">
                <button
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payment')}
                >
                    Payment
                </button>
                <button
                    className={`tab-btn ${activeTab === 'returns' ? 'active' : ''}`}
                    onClick={() => setActiveTab('returns')}
                >
                    Returns & Refunds
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

                            <hr className="border-gray-900" />

                            <div className="overview-grid">
                                {/* Shipping & Billing */}
                                <div className="shipping-billing">
                                    <div className="address-card">
                                        <h3>Order Summary</h3>

                                        <div className="shipping-content">
                                            <div className="row">
                                                <span className="label">Order #</span>
                                                <span className="value">{order.orderNumber}</span>
                                            </div>

                                            <div className="row">
                                                <span className="label">Purchase Date</span>
                                                <span className="value">{formatDate(order.createdAt)}</span>
                                            </div>

                                            <div className="row">
                                                <span className="label">Updated At</span>
                                                <span className="value">{formatDate(order.updatedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="address-card">
                                        <h3>Shipping Address</h3>

                                        <div className="shipping-content">
                                            <div className="row">
                                                <span className="label">Name</span>
                                                <span className="value">{order.shippingAddress.fullName}</span>
                                            </div>

                                            <div className="row">
                                                <span className="label">Address</span>
                                                <span className="value">{order.shippingAddress.addressLine1}</span>
                                            </div>

                                            {order.shippingAddress.addressLine2 && (
                                                <div className="row">
                                                    <span className="label">Address 2</span>
                                                    <span className="value">{order.shippingAddress.addressLine2}</span>
                                                </div>
                                            )}

                                            <div className="row">
                                                <span className="label">City</span>
                                                <span className="value">
                                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                                                </span>
                                            </div>

                                            <div className="row">
                                                <span className="label">Country</span>
                                                <span className="value">{order.shippingAddress.country}</span>
                                            </div>

                                            <div className="row">
                                                <span className="label">Phone</span>
                                                <span className="value">
                                                    {order.shippingAddress.phone || "No phone provided"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="my-6 border-gray-900" />

                            <div>
                                {!order.fulfillment.trackingNumber &&
                                    <div className="">
                                        <button
                                            onClick={() => setOpenFulfillment(true)}
                                            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded"
                                        >
                                            Confirm Shipment
                                        </button>
                                    </div>
                                }
                            </div>

                            <hr className="my-6 border-gray-900" />

                            {/* Order Items */}
                            <div className="order-items">
                                <h3 className="mb-3 font-semibold text-lg">Order Items</h3>

                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-gray-100 text-left border ">
                                                <th className="px-4 py-3 border text-center">Status</th>
                                                <th className="px-4 py-3 border">Product</th>
                                                <th className="px-4 py-3 border text-center">Qty</th>
                                                <th className="px-4 py-3 border text-right">Unit Price</th>
                                                <th className="px-4 py-3 border text-right">Proceeds</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {order.items.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-300">
                                                    {/* Status */}
                                                    <td className="px-4 py-3 border text-center">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClasses(order.orderStatus)}`}
                                                        >
                                                            {order.orderStatus}
                                                        </span>
                                                    </td>

                                                    {/* Product */}
                                                    <td className="px-4 py-3 border">
                                                        <div className="flex items-start gap-3">
                                                            <img
                                                                src={item.productId.productImages[0]}
                                                                alt={item.productId.productName}
                                                                className="w-12 h-16 object-cover rounded"
                                                            />

                                                            <div className="flex flex-col">
                                                                {/* Product Name */}
                                                                <span className="font-medium text-gray-900">
                                                                    {item.productId.productName}
                                                                </span>

                                                                {/* SKU */}
                                                                <span className="text-xs text-gray-500 font-mono">
                                                                    SKU: {getVariantSKU(item.productId, item.selectedAttributes)}
                                                                </span>

                                                                {/* Variants */}
                                                                <span className="text-xs text-gray-500">
                                                                    Size: {item.selectedAttributes.size} · Color: {item.selectedAttributes.color}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Quantity */}
                                                    <td className="px-4 py-3 border text-center">
                                                        {item.quantity}
                                                    </td>

                                                    {/* Unit Price */}
                                                    <td className="px-4 py-3 border text-right">
                                                        {formatCurrency(item.unitPrice)}
                                                    </td>

                                                    {/* Proceeds */}
                                                    <td className="px-4 py-3 border text-right font-semibold">
                                                        {formatCurrency(item.totalPrice)}
                                                    </td>
                                                </tr>
                                            )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {order.fulfillment?.trackingNumber && (
                                <div className="mt-4 border rounded-lg bg-white shadow-sm p-4">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-semibold text-gray-900">
                                            Current Tracking
                                        </h4>

                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                            Shipped
                                        </span>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Tracking Number :</span>
                                            <span className="font-mono text-gray-900">
                                                {order.fulfillment.trackingNumber}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Carrier :</span>
                                            <span className="font-medium text-gray-900">
                                                {order.fulfillment.carrier}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-4 flex justify-end">
                                        <a
                                            href={`https://tools.usps.com/go/TrackConfirmAction?tRef=fullpage&tLabels=${order.fulfillment.trackingNumber}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
                                        >
                                            Track Package
                                        </a>
                                    </div>
                                </div>
                            )}

                            <hr className="my-6 border-gray-900" />

                            {openFulfillment && (
                                <div className="mt-4 border rounded-lg bg-white shadow-sm p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-semibold text-lg">Create Fulfillment</h3>
                                        <button
                                            onClick={() => setOpenFulfillment(false)}
                                            className="text-sm text-gray-500 hover:text-gray-700"
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                    {/* Carrier */}
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Shipping Carrier
                                        </label>
                                        <select
                                            value={trackingInfo.carrier}
                                            onChange={(e) => setTrackingInfo({
                                                ...trackingInfo,
                                                carrier: e.target.value
                                            })}
                                            className="w-full border rounded px-3 py-2 text-sm focus:ring focus:ring-yellow-200"
                                        >
                                            <option value="">Select carrier</option>
                                            <option>DHL</option>
                                            <option>FedEx</option>
                                            <option>USPS</option>
                                            <option>UPS</option>
                                        </select>
                                    </div>

                                    {/* Tracking Number */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tracking Number
                                        </label>
                                        <input
                                            type="text"
                                            value={trackingInfo.trackingNumber}
                                            onChange={(e) => setTrackingInfo({
                                                ...trackingInfo,
                                                trackingNumber: e.target.value
                                            })}
                                            placeholder="Enter tracking number"
                                            className="w-full border rounded px-3 py-2 text-sm focus:ring focus:ring-yellow-200"
                                        />
                                    </div>

                                    <hr className="my-6 border-gray-900" />

                                    {/* Fulfillment Items */}
                                    <div className="mb-4">
                                        <h5 className="text-sm font-semibold text-gray-800 mb-2">
                                            Items to Fulfill
                                        </h5>

                                        {order.items.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex justify-between items-center py-4 border-b border-gray-900 last:border-b-0"
                                            >
                                                {/* Left: Image + Details */}
                                                <div className="flex items-start gap-4">
                                                    <img
                                                        src={item.productId.productImages[0]}
                                                        alt={item.productId.productName}
                                                        className="w-12 h-16 object-cover rounded border border-gray-700"
                                                    />

                                                    <div className="space-y-1">
                                                        {/* Product Name */}
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {item.productId.productName}
                                                        </div>

                                                        {/* SKU */}
                                                        <div className="text-xs text-gray-500 font-mono">
                                                            SKU: {getVariantSKU(item.productId, item.selectedAttributes)}
                                                        </div>

                                                        {/* Variants */}
                                                        <div className="text-xs text-gray-500">
                                                            Size: {item.selectedAttributes.size} · Color: {item.selectedAttributes.color}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: Quantity */}
                                                <div className="text-sm font-medium text-gray-900">
                                                    Qty: {item.quantity}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => setOpenFulfillment(false)}
                                            className="px-4 py-2 text-sm border rounded"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            disabled={!trackingInfo.carrier || !trackingInfo.trackingNumber}
                                            onClick={handleUpdateTracking}
                                            className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {isUpdating ? 'Updating...' : ' Create Fulfillment'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Fulfillment Tab */}
                    {/* {activeTab === 'fulfillment' && (
                        <div className="tab-content">
                            <div className="fulfillment-grid">
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
                                                <option value="FEDEX">FedEx</option>
                                                <option value="DHL">DHL</option>
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
                    )} */}

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
                            <span>C.Email:</span>
                            <span className="customer-email">{order.userDetails.userId.email}</span>
                        </div>
                        <div className="metadata-item">
                            <span>Created:</span>
                            <span>{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="metadata-item">
                            <span>Updated:</span>
                            <span>{formatDate(order.updatedAt)}</span>
                        </div>
                    </div>
                </aside>
            </div >

        </div >
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