import React, { useState, useEffect } from 'react';
import './Checkout.css';
import zipToStateMap from '../data/fullZipData';


const Checkout = ({ cartItems, totalPrice, onPlaceOrder }) => {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (modalName) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const modalContents = {
    returns: {
      title: "Master Jackets Return Promise",
      content: (
        <div className="policy-content">
          <div className="policy-header">
            <h4>30-Day Satisfaction Guarantee</h4>
            <p>We stand behind every stitch. If your jacket doesn't meet expectations, we'll make it right.</p>
          </div>

          <div className="policy-highlights">
            <div className="highlight-card">
              <div className="icon">✓</div>
              <h5>Easy Returns</h5>
              <p>Unworn items with tags within 30 days</p>
            </div>
            <div className="highlight-card">
              <div className="icon">!</div>
              <h5>Quick Resolution</h5>
              <p>Defects reported within 72 hours</p>
            </div>
          </div>

          <h5 className="section-title">The Fine Print</h5>
          <ul className="policy-list">
            <li>Original packaging required for refunds</li>
            <li>Custom jackets are final sale</li>
            <li>Return shipping not included</li>
          </ul>

          <div className="policy-contact">
            <p><strong>Need help?</strong> Email <a href="mailto:returns@masterjackets.com">returns@masterjackets.com</a></p>
          </div>
        </div>
      )
    },
    shipping: {
      title: "Global Shipping Excellence",
      content: (
        <div className="policy-content">
          <div className="policy-badge">WORLDWIDE DELIVERY</div>

          <h4>Our Shipping Promise</h4>
          <p>Every Master Jacket deserves a grand entrance. We handle your order with white-glove care from warehouse to doorstep.</p>

          <div className="timeline">
            <div className="timeline-step">
              <div className="step-number">1</div>
              <h5>Processing</h5>
              <p>1-2 business days</p>
            </div>
            <div className="timeline-step">
              <div className="step-number">2</div>
              <h5>Shipping</h5>
              <p>3-5 business days (US/EU)</p>
              <p>7-10 days (International)</p>
            </div>
          </div>

          <h5 className="section-title">Important Notes</h5>
          <ul className="policy-list">
            <li>Signature required for orders over $500</li>
            <li>Customs fees may apply for international orders</li>
            <li>Real-time tracking provided</li>
          </ul>
        </div>
      )
    },
    terms: {
      title: "Our Agreement",
      content: (
        <div className="policy-content">
          <h4>Purchasing Terms</h4>
          <p>By ordering from Master Jackets, you agree to these fair terms:</p>

          <div className="terms-grid">
            <div className="term-card">
              <h5>Product Ownership</h5>
              <p>You own the jacket; we retain design rights</p>
            </div>
            <div className="term-card">
              <h5>Payment</h5>
              <p>Charged when order ships</p>
            </div>
            <div className="term-card">
              <h5>Disputes</h5>
              <p>Contact us before chargebacks</p>
            </div>
          </div>

          <div className="legal-notes">
            <h5>Key Limitations</h5>
            <ul>
              <li>Not responsible for misuse of products</li>
              <li>May cancel suspicious orders</li>
              <li>Prices subject to change</li>
            </ul>
          </div>
        </div>
      )
    },
    privacy: {
      title: "Your Privacy Matters",
      content: (
        <div className="policy-content">
          <div className="trust-badge">
            <span>Data Protection Guaranteed</span>
          </div>

          <h4>We Value Your Trust</h4>
          <p>Master Jackets collects only essential data to deliver exceptional service and nothing more.</p>

          <div className="data-usage">
            <h5>What We Collect</h5>
            <ul>
              <li>Order information for fulfillment</li>
              <li>Contact details for service</li>
              <li>Secure payment data (encrypted)</li>
            </ul>

            <h5>What We Never Do</h5>
            <ul>
              <li>Sell your information</li>
              <li>Share data unnecessarily</li>
              <li>Store payment details after processing</li>
            </ul>
          </div>

          <div className="gdpr-notice">
            <p>EU customers: We fully comply with GDPR regulations.</p>
          </div>
        </div>
      )
    }
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    state: '',
    paymentMethod: 'credit-card',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    termsAccepted: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updatedFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };

    if (name === "zipCode") {
      const location = zipToStateMap[value];
      if (location) {
        updatedFormData = {
          ...updatedFormData,
          state: location.state,
          country: location.country
        };
      }
    }

    setFormData(updatedFormData);
  };


  const validateForm = () => {
    const newErrors = {};

    // Personal info validation
    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.address?.trim()) newErrors.address = 'Address is required';
    if (!formData.city?.trim()) newErrors.city = 'City is required';
    if (!formData.zipCode?.trim()) newErrors.zipCode = 'Zip code is required';
    if (!formData.state?.trim()) newErrors.state = 'State is required';
    if (!formData.country?.trim()) newErrors.country = 'Country is required';

    // Payment validation
    if (formData.paymentMethod === 'credit-card') {
      if (!formData.cardNumber?.trim()) newErrors.cardNumber = 'Card number is required';
      if (!formData.cardName?.trim()) newErrors.cardName = 'Name on card is required';
      if (!formData.expiryDate?.trim()) newErrors.expiryDate = 'Expiry date is required';
      if (!formData.cvv?.trim()) newErrors.cvv = 'CVV is required';
    }

    if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      // Simulate API call
      setTimeout(() => {
        onPlaceOrder(formData);
        setIsSubmitting(false);
        setOrderSuccess(true);
      }, 1500);
    }
  };

  const [highlightState, setHighlightState] = useState(false);
  const [highlightCountry, setHighlightCountry] = useState(false);

  useEffect(() => {
    const zip = formData.zipCode.trim();
    const stateCode = zipToStateMap[zip];

    if (zip.length === 5 && stateCode) {
      setFormData(prev => ({
        ...prev,
        state: stateCode,
        country: 'US'
      }));

      setHighlightState(true);
      setHighlightCountry(true);

      setTimeout(() => {
        setHighlightState(false);
        setHighlightCountry(false);
      }, 1400);
    }
  }, [formData.zipCode]);


  if (orderSuccess) {
    return (
      <div className="order-success">
        <div className="success-icon">✓</div>
        <h2>Order Placed Successfully!</h2>
        <p>Thank you for your purchase. Your order has been received and is being processed.</p>
        <p>A confirmation email has been sent to <strong>{formData.email}</strong>.</p>
        <button className="continue-shopping" onClick={() => window.location.reload()}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-grid">
        <div className="checkout-form">
          <form onSubmit={handleSubmit}>
            <section className="form-section">
              <h2>Contact Information</h2>
              <div className="form-row">
                  <div className="form-group">
                  <label htmlFor="email">Email*</label>
                  <input
                    type="email"
                    // placeholder='Email'
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name*</label>
                  <input
                    type="text"
                    id="firstName"
                    // placeholder='First Name*'
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? 'error' : ''}
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name*</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? 'error' : ''}
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>
            <section className="form-section">
              <h2>Shipping Address</h2>
              <div className="form-group">
                <label htmlFor="address">Address*</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City*</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={errors.city ? 'error' : ''}
                  />
                  {errors.city && <span className="error-message">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="zipCode">Zip/Postal Code*</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className={errors.zipCode ? 'error' : ''}
                  />
                  {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="state">State*</label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`${errors.state ? 'error' : ''} ${highlightState ? 'highlight' : ''}`}
                  ><option value="" disabled selected>Select State</option>
                    <option value="AL">Alabama</option>
                    <option value="AK">Alaska</option>
                    <option value="AZ">Arizona</option>
                    <option value="AR">Arkansas</option>
                    <option value="CA">California</option>
                    <option value="CO">Colorado</option>
                    <option value="CT">Connecticut</option>
                    <option value="DE">Delaware</option>
                    <option value="FL">Florida</option>
                    <option value="GA">Georgia</option>
                    <option value="ID">Idaho</option>
                    <option value="IL">Illinois</option>
                    <option value="IN">Indiana</option>
                    <option value="IA">Iowa</option>
                    <option value="KS">Kansas</option>
                    <option value="KY">Kentucky</option>
                    <option value="LA">Louisiana</option>
                    <option value="ME">Maine</option>
                    <option value="MD">Maryland</option>
                    <option value="MA">Massachusetts</option>
                    <option value="MI">Michigan</option>
                    <option value="MN">Minnesota</option>
                    <option value="MS">Mississippi</option>
                    <option value="MO">Missouri</option>
                    <option value="MT">Montana</option>
                    <option value="NE">Nebraska</option>
                    <option value="NV">Nevada</option>
                    <option value="NH">New Hampshire</option>
                    <option value="NJ">New Jersey</option>
                    <option value="NM">New Mexico</option>
                    <option value="NY">New York</option>
                    <option value="NC">North Carolina</option>
                    <option value="ND">North Dakota</option>
                    <option value="OH">Ohio</option>
                    <option value="OK">Oklahoma</option>
                    <option value="OR">Oregon</option>
                    <option value="PA">Pennsylvania</option>
                    <option value="RI">Rhode Island</option>
                    <option value="SC">South Carolina</option>
                    <option value="SD">South Dakota</option>
                    <option value="TN">Tennessee</option>
                    <option value="TX">Texas</option>
                    <option value="UT">Utah</option>
                    <option value="VT">Vermont</option>
                    <option value="VA">Virginia</option>
                    <option value="WA">Washington</option>
                    <option value="WV">West Virginia</option>
                    <option value="WI">Wisconsin</option>
                    <option value="WY">Wyoming</option>
                  </select>
                  {errors.country && <span className="error-message">{errors.state}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="country">Country*</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={`${errors.country ? 'error' : ''} ${highlightCountry ? 'highlight' : ''}`}
                  >

                    <option value="" disabled>Select Country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="JP">Japan</option>
                    {/* Add more countries as needed */}
                  </select>
                  {errors.country && <span className="error-message">{errors.country}</span>}
                </div>
              </div>
            </section>
            <section className="form-section">
              <h2>Shipping Method</h2>
              <p>Enter your shipping address to view available shipping methods.</p>
            </section>

            <section className="form-section">
              <h2>Payment Method</h2>
              <div className="payment-methods">
                <label className="payment-method">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit-card"
                    checked={formData.paymentMethod === 'credit-card'}
                    onChange={handleChange}
                  />
                  <span>Credit Card</span>
                  <div className="payment-icons">
                    <span className="icon visa">Visa</span>
                    <span className="icon mastercard">MasterCard</span>
                    <span className="icon amex">Amex</span>
                  </div>
                </label>

                <label className="payment-method">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={formData.paymentMethod === 'paypal'}
                    onChange={handleChange}
                  />
                  <span>PayPal</span>
                  <div className="payment-icons">
                    <span className="icon paypal">PayPal</span>
                  </div>
                </label>
              </div>

              {formData.paymentMethod === 'credit-card' && (
                <div className="credit-card-form">
                  <div className="form-group">
                    <label htmlFor="cardNumber">Card Number*</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="1234 5678 9012 3456"
                      className={errors.cardNumber ? 'error' : ''}
                    />
                    {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="cardName">Name on Card*</label>
                    <input
                      type="text"
                      id="cardName"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      className={errors.cardName ? 'error' : ''}
                    />
                    {errors.cardName && <span className="error-message">{errors.cardName}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="expiryDate">Expiry Date*</label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        className={errors.expiryDate ? 'error' : ''}
                      />
                      {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="cvv">CVV*</label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                        placeholder="123"
                        className={errors.cvv ? 'error' : ''}
                      />
                      {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <div className="terms-checkbox">
              <label>
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className={errors.termsAccepted ? 'error' : ''}
                />
                <span>I agree to the <a href="/terms">Terms and Conditions</a> and <a href="/privacy">Privacy Policy</a>*</span>
              </label>
              {errors.termsAccepted && <span className="error-message">{errors.termsAccepted}</span>}
            </div>

            <button type="submit" className="place-order-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : `Place Order ($${(totalPrice * 1.1).toFixed(2)})`}
            </button>
          </form>
        </div>

        <div className="order-summary">
          <h2>The Master Jackets</h2>
          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={item.id} className="summary-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-details">
                  <h4>{item.title}</h4>
                  <p>Size: {item.size}</p>
                </div>
                <div className="item-price">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="total-row">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="total-row">
              <span>Tax</span>
              <span>${(totalPrice * 0.1).toFixed(2)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total</span>
              <span>${(totalPrice * 1.1).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      <footer className="simple-footer">
        <div className="footer-links">
          <button onClick={() => openModal('returns')}>Return Policy</button>
          <button onClick={() => openModal('privacy')}>Privacy Policy</button>
          <button onClick={() => openModal('terms')}>Terms of Service</button>
          <button onClick={() => openModal('shipping')}>Shipping Policy</button>
        </div>
        <p className="copyright">© {new Date().getFullYear()} The Master Jackets. All rights reserved.</p>
      </footer>

      {activeModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>×</button>
            <h3>{modalContents[activeModal].title}</h3>
            <p>{modalContents[activeModal].content}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;