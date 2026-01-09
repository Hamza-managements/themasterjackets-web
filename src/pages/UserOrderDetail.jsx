import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getUserOrderById } from '../utils/OrderUtils';;

const OrderPage = () => {
  const { orderId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getUserOrderById(user.uid);

      const selectedOrder = data?.data?.find(
        (order) => order._id === orderId
      );

      if (!selectedOrder) {
        navigate("/dashboard?orders");
        return;
      }

      setOrder(selectedOrder);
    } catch (err) {
      console.error(err);
      navigate("/dashboard?orders");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
    <div className="order-page">
      {/* Header Section */}
      <header className="order-header">
        <div className="container">
          <h1>Order Details</h1>
          <div className="order-summary-header">
            <div className="order-meta">
              <span className="order-number">Order #{order.orderNumber}</span>
              <span className="order-date">Placed on {formatDate(order.createdAt)}</span>
            </div>
            <div className={`status-badge ${order.orderStatus.toLowerCase()}`}>
              {order.orderStatus.toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="order-main container">
        {/* Navigation Tabs */}
        <nav className="order-tabs">
          <button
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Order Details
          </button>
          <button
            className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
            onClick={() => setActiveTab('shipping')}
          >
            Shipping & Tracking
          </button>
          <button
            className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveTab('payment')}
          >
            Payment
          </button>
        </nav>

        {/* Order Details Tab */}
        {activeTab === 'details' && (
          <div className="tab-content">
            {/* Order Items */}
            <section className="order-items-section">
              <h2>Items Ordered</h2>
              {order.items.map((item, index) => (
                <div key={index} className="order-item-card">
                  <div className="item-image">
                    <img
                      src={item.productId.productImages[0]}
                      alt={item.productId.productName}
                    />
                  </div>
                  <div className="item-details">
                    <h3 className="item-name">{item.productId.productName}</h3>
                    <div className="item-variants">
                      <span className="variant">
                        <strong>Size:</strong> {item.selectedAttributes.size}
                      </span>
                      <span className="variant">
                        <strong>Color:</strong> {item.selectedAttributes.color}
                      </span>
                    </div>
                    <div className="item-price-info">
                      <span className="price">
                        {formatCurrency(item.unitPrice)} × {item.quantity}
                      </span>
                      <span className="total-price">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                    <div className="item-status">
                      <span className="in-stock">In Stock</span>
                      <span className="estimated-delivery">
                        Est. Delivery: 5-7 days
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Order Summary */}
            <section className="order-summary-section">
              <h2>Order Summary</h2>
              <div className="summary-card">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.pricing.subTotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="free">FREE</span>
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
            </section>
          </div>
        )}

        {/* Shipping Tab */}
        {activeTab === 'shipping' && (
          <div className="tab-content">
            <section className="shipping-section">
              <h2>Shipping Information</h2>
              <div className="address-card">
                <div className="address-header">
                  <h3>Shipping Address</h3>
                  <span className="default-badge">Default</span>
                </div>
                <div className="address-details">
                  <p><strong>{order.shippingAddress.fullName}</strong></p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && (
                    <p>{order.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  <p className="phone">Phone: {order.shippingAddress.phone}</p>
                </div>
              </div>

              {/* Tracking Info */}
              <div className="tracking-card">
                <h3>Tracking Information</h3>
                {order.fulfillment.trackingNumber ? (
                  <div className="tracking-details">
                    <div className="tracking-row">
                      <span>Tracking Number:</span>
                      <strong>{order.fulfillment.trackingNumber}</strong>
                    </div>
                    <div className="tracking-row">
                      <span>Carrier:</span>
                      <span>{order.fulfillment.carrier || 'Standard Shipping'}</span>
                    </div>
                    <div className="tracking-row">
                      <span>Status:</span>
                      <span className={`status-badge ${order.fulfillment.status}`}>
                        {order.fulfillment.status.toUpperCase()}
                      </span>
                    </div>
                    <a href="#" className="track-btn">
                      Track Package
                    </a>
                  </div>
                ) : (
                  <p className="no-tracking">Tracking information will be available once the order is shipped.</p>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <div className="tab-content">
            <section className="payment-section">
              <h2>Payment Information</h2>
              <div className="payment-card">
                <div className="payment-method">
                  <h3>Payment Method</h3>
                  <div className="method-details">
                    <span className="method-icon">💳</span>
                    <div>
                      <p className="method-name">Credit / Debit Card</p>
                      <p className="method-status">Payment {order.payment.status}</p>
                    </div>
                  </div>
                </div>

                <div className="payment-summary">
                  <h3>Payment Summary</h3>
                  <div className="payment-row">
                    <span>Order Total</span>
                    <span>{formatCurrency(order.pricing.grandTotal)}</span>
                  </div>
                  <div className="payment-row">
                    <span>Payment Status</span>
                    <span className={`payment-status ${order.payment.status}`}>
                      {order.payment.status.toUpperCase()}
                    </span>
                  </div>
                  {order.payment.transactionId && (
                    <div className="payment-row">
                      <span>Transaction ID</span>
                      <span className="transaction-id">{order.payment.transactionId}</span>
                    </div>
                  )}
                </div>

                {!order.isPaid && (
                  <div className="payment-actions">
                    <button className="pay-now-btn">
                      Complete Payment
                    </button>
                    <button className="cancel-btn">
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          {/* <button className="print-btn">
                        📄 Print Order
                    </button> */}
          <button className="support-btn" onClick={() => navigate('/contact-us')}>
            💬 Contact Support
          </button>
          <button className="return-btn">
            ↩️ Start Return
          </button>
        </div>
      </main>
      <style>{`:root {
  --red: #d30217;
  --black: #000000;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  --green: #10b981;
  --yellow: #f59e0b;
  --blue: #3b82f6;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background-color: var(--gray-50);
  color: var(--gray-900);
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header Styles */
.order-header {
  background: linear-gradient(135deg, var(--black) 0%, var(--gray-800) 100%);
  color: white;
  padding: 2rem 0;
  margin-bottom: 2rem;
}

.order-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.order-summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.order-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.order-number {
  font-size: 1.1rem;
  font-weight: 600;
}

.order-date {
  color: var(--gray-300);
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.placed, .status-badge.shipped, .status-badge.refunded {
  background-color: var(--blue);
  color: white;
}

.status-badge.returned, .status-badge.pending, .status-badge.processing {
  background-color: var(--yellow);
  color: var(--black);
}

.status-badge.confirmed, .status-badge.delivered, .status-badge.paid {
  background-color: var(--green);
  color: white;
}

.status-badge.cancelled, .status-badge.failed {
  background-color: var(--red);
  color: white;
}

/* Tabs Navigation */
.order-tabs {
  display: flex;
  gap: 1px;
  background-color: var(--gray-200);
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  margin-bottom: 2rem;
}

.tab-btn {
  flex: 1;
  padding: 1rem 1.5rem;
  background-color: var(--gray-100);
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.tab-btn:hover {
  background-color: white;
  color: var(--black);
}

.tab-btn.active {
  background-color: white;
  color: var(--black);
  border-bottom: 3px solid var(--red);
}

/* Order Items */
.order-items-section {
  margin-bottom: 2rem;
}

.order-items-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--black);
}

.order-item-card {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.order-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.item-image {
  flex-shrink: 0;
  width: 120px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--black);
}

.item-variants {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.variant {
  font-size: 0.9rem;
  color: var(--gray-600);
}

.item-price-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.price {
  font-size: 1rem;
  color: var(--gray-700);
}

.total-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--black);
}

.item-status {
  display: flex;
  gap: 1.5rem;
  font-size: 0.875rem;
}

.in-stock {
  color: var(--green);
  font-weight: 600;
}

.estimated-delivery {
  color: var(--gray-600);
}

/* Order Summary */
.order-summary-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--black);
}

.summary-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--gray-100);
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row.total {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--black);
}

.free {
  color: var(--green);
  font-weight: 600;
}

.discount {
  color: var(--red);
  font-weight: 600;
}

/* Shipping Section */
.shipping-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--black);
}

.address-card,
.tracking-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.address-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
}

.default-badge {
  background-color: var(--gray-100);
  color: var(--gray-700);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.address-details p {
  margin-bottom: 0.5rem;
  color: var(--gray-700);
}

.phone {
  margin-top: 1rem;
  color: var(--gray-600);
}

.tracking-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--gray-100);
}

.tracking-row:last-child {
  border-bottom: none;
  margin-bottom: 1.5rem;
}

.track-btn {
  display: inline-block;
  background-color: var(--red);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.track-btn:hover {
  background-color: #b30215;
}

.no-tracking {
  color: var(--gray-600);
  font-style: italic;
}

/* Payment Section */
.payment-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.payment-method,
.payment-summary {
  margin-bottom: 2rem;
}

.payment-method h3,
.payment-summary h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.method-details {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.method-icon {
  font-size: 1.5rem;
}

.method-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.method-status {
  color: var(--gray-600);
  font-size: 0.9rem;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--gray-100);
}

.payment-row:last-child {
  border-bottom: none;
}

.payment-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.transaction-id {
  font-family: monospace;
  color: var(--gray-700);
}

.payment-actions {
  display: flex;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--gray-200);
}

.pay-now-btn {
  background-color: var(--red);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  flex: 1;
}

.pay-now-btn:hover {
  background-color: #b30215;
}

.cancel-btn {
  background-color: transparent;
  color: var(--gray-700);
  padding: 0.75rem 2rem;
  border-radius: 8px;
  border: 1px solid var(--gray-300);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.cancel-btn:hover {
  background-color: var(--gray-100);
  color: var(--black);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--gray-200);
  flex-wrap: wrap;
}

.print-btn,
.support-btn,
.return-btn {
  flex: 1;
  min-width: 200px;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--gray-300);
  background-color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.print-btn:hover,
.support-btn:hover,
.return-btn:hover {
  background-color: var(--gray-100);
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }

  .order-header {
    padding: 1.5rem 0;
  }

  .order-header h1 {
    font-size: 1.5rem;
  }

  .order-summary-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .order-tabs {
    flex-direction: column;
  }

  .tab-btn {
    text-align: left;
    padding: 0.875rem 1rem;
  }

  .order-item-card {
    flex-direction: column;
    gap: 1rem;
  }

  .item-image {
    width: 100%;
    height: 200px;
  }

  .item-price-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .item-status {
    flex-direction: column;
    gap: 0.5rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .print-btn,
  .support-btn,
  .return-btn {
    min-width: 100%;
  }

  .payment-actions {
    flex-direction: column;
  }

  .tracking-row {
    flex-direction: column;
    gap: 0.25rem;
  }
}

@media (max-width: 480px) {
  .order-item-card,
  .summary-card,
  .address-card,
  .tracking-card,
  .payment-card {
    padding: 1rem;
  }

  .variant {
    width: 100%;
  }

  .method-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

/* Loading State */
.order-item-card.loading {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}`}
      </style>
    </div>
  );
};

export default OrderPage;