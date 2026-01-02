// Checkout.jsx - Shopify-style Checkout
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import zipToStateMap from '../data/fullZipData';
import PhoneInput from "react-phone-input-2";
import './styles/Checkout.css';
import "react-phone-input-2/lib/material.css";
import { AuthContext } from '../context/AuthContext';
import { validateCheckout } from './ValidateCheckout';

const Checkout = ({ cartItems, totalPrice, onPlaceOrder }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        fullName: '',
        email: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        zipCode: '',
        country: '',
        state: '',
        paymentMethod: 'CARD',
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
        termsAccepted: false
    });

    const { user } = useContext(AuthContext);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [shippingMethod, setShippingMethod] = useState("standard");
    const [hasInteracted, setHasInteracted] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState('information');
    const [showOrderSummary, setShowOrderSummary] = useState(false);
    // const [isGuestCheckout, setIsGuestCheckout] = useState(xtrue); // below is the input that is commented out


    useEffect(() => {
        const zip = formData.zipCode?.trim();
        const stateCode = zipToStateMap[zip];

        if (
            zip?.length === 5 &&
            stateCode &&
            (formData.state !== stateCode || formData.country !== "USA")
        ) {
            setFormData(prev => ({
                ...prev,
                state: stateCode,
                country: "USA"
            }));
        }
    }, [formData.zipCode]);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                email: user.userEmail || "",
                firstName: user?.userName?.split(" ")[0] || "",
                lastName: user?.userName?.split(" ")[1] || "",
                fullName: user?.userName || ""
            }));
        }
    }, [user]);

    useEffect(() => {
        if (!hasInteracted) return;
        const timeout = setTimeout(async () => {
            const valid = await validateCheckout(formData, setErrors);
            setIsFormValid(valid);
        }, 300);

        return () => clearTimeout(timeout);
    }, [formData, hasInteracted]);

    // Express checkout handlers
    const handleExpressCheckout = (provider) => {
        setShippingMethod(provider);
        setTimeout(() => {
            setFormData(prev => ({
                ...prev,
                email: 'customer@example.com',
                firstName: 'John',
                lastName: 'Doe',
                addressLine1: '123 Shopify St',
                addressLine2: '',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94107',
                country: 'USA'
            }));
            setCheckoutStep('shipping');
        }, 500);
    };

    const handleChange = (e) => {
        setHasInteracted(true);
        const { name, value, type, checked } = e.target;

        setFormData(prev => {
            let updated = {
                ...prev,
                [name]: type === "checkbox" ? checked : value
            };

            if (name === "zipCode") {
                const location = zipToStateMap[value];
                if (location) {
                    updated.state = location.state;
                    updated.country = location.country;
                }
            }

            if (name === "firstName" || name === "lastName") {
                updated.fullName = `${updated.firstName} ${updated.lastName}`.trim();
            }

            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setHasInteracted(true);

        const isValid = await validateCheckout(formData, setErrors);
        if (!isValid) return;
        setIsSubmitting(true);

        const payload = {
            userDetails: {
                userId: user?.uid || null,
            },
            items: cartItems.map(item => ({
                productId: item?.productId?._id,
                variationId: item?.variationId,
                selectedAttributes: item?.selectedAttributes,
                quantity: item?.quantity,
                unitPrice: item?.price
            })),
            shippingAddress: {
                fullName: formData.fullName,
                phone: formData.phone,
                addressLine1: formData.addressLine1,
                addressLine2: formData.addressLine2,
                postalCode: formData.zipCode,
                city: formData.city,
                state: formData.state,
                country: formData.country
            },
            payment: {
                method: "CARD"
            }
        };
        setTimeout(() => {
            onPlaceOrder(payload);
            setIsSubmitting(false);
            setOrderSuccess(true);
        }, 1500);
    };

    // const validateForm = () => {
    //     const newErrors = {};

    //     // Shopify-style minimal validation
    //     if (!formData.email?.trim()) newErrors.email = 'Email is required';
    //     if (!formData.addressLine1?.trim()) newErrors.addressLine1 = 'Address is required';
    //     if (!formData.city?.trim()) newErrors.city = 'City is required';
    //     if (!formData.country?.trim()) newErrors.country = 'Country is required';
    //     if (!formData.zipCode?.trim()) newErrors.zipCode = 'ZIP/Postal code is required';

    //     // Payment validation only if not using express checkout
    //     if (!shippingMethod && formData.paymentMethod === 'CARD') {
    //         if (!formData.cardNumber?.replace(/\s/g, '')) newErrors.cardNumber = 'Card number is required';
    //         if (!formData.cardName?.trim()) newErrors.cardName = 'Name on card is required';
    //         if (!formData.expiryDate?.trim()) newErrors.expiryDate = 'Expiry date is required';
    //         if (!formData.cvv?.trim()) newErrors.cvv = 'CVV is required';
    //     }

    //     setErrors(newErrors);
    //     return Object.keys(newErrors).length === 0;
    // };

    const OrderSummary = () => (
        <div className={`order-summary-sidebar ${showOrderSummary ? 'mobile-visible' : ''}`}>
            <div className="summary-header">
                <button
                    className="summary-toggle"
                    onClick={() => setShowOrderSummary(!showOrderSummary)}
                >
                    {showOrderSummary ? 'Hide' : 'Show'} order summary
                    <span className="summary-arrow">{showOrderSummary ? '↑' : '↓'}</span>
                </button>
                {showOrderSummary ? <div className="summary-total">${(totalPrice * 1).toFixed(2)}</div> : ''}

            </div>

            {!cartItems || cartItems.length === 0 ?
                (
                    <div className="empty-cart-wrapper">
                        <div className="empty-cart-box">
                            <div className="empty-cart-icon">🛒</div>

                            <h2>Your cart is empty</h2>
                            <p>
                                Looks like you haven’t added anything to your cart yet.
                                Start shopping to continue checkout.
                            </p>

                            <a href="/products/new-in/new-arrivals" className="empty-cart-btn">
                                Continue shopping
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="summary-content">
                        {cartItems?.map((item) => (
                            <div key={item?.variationId} className="summary-item">
                                <div className="item-image">
                                    <img src={item?.productId?.productImages[0]} alt={item?.productId?.productName} />
                                    <span className="item-quantity">{item?.quantity}</span>
                                </div>
                                <div className="item-details">
                                    <h4>{item?.productId?.productName}</h4>
                                    <p>Size: {item?.selectedAttributes?.size}</p>
                                </div>
                                <div className="item-price">${(item?.price * item?.quantity).toFixed(2)}</div>
                            </div>
                        ))}

                        <div className="summary-totals">
                            <div className="total-row">
                                <span>Subtotal</span>
                                <span>${totalPrice?.toFixed(2)}</span>
                            </div>
                            <div className="total-row">
                                <span>Shipping</span>
                                <span>Calculated at next step</span>
                            </div>
                            <div className="total-row">
                                <span>Tax</span>
                                <span>${(totalPrice * 0).toFixed(2)}</span>
                            </div>
                            <div className="total-row grand-total">
                                <span>Total</span>
                                <span>USD ${(totalPrice * 1).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Trust badges */}
                        <div className="trust-badges">
                            <div className="trust-badge">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                                </svg>
                                Secure checkout
                            </div>
                            <div className="trust-badge">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M20 8l-8 5-8-5v10h16V8zm-8-6l8 4v2l-8-5-8 5V6l8-4z" />
                                </svg>
                                SSL encrypted
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );

    return (
        <div className="checkout-container shopify-style">
            {/* Header with logo */}
            <header className="checkout-header">
                <Link to="/" className="checkout-logo">
                    <img
                        src="https://res.cloudinary.com/dvmpyh0hj/image/upload/v1760615184/hilkmru9zutcneybpwwc.png"
                        alt="The Master Jackets"
                    />
                </Link>
                <div className="checkout-steps">
                    <div className={`step ${checkoutStep === 'information' ? 'active' : ''}`}>
                        <span>1</span>
                        Information
                    </div>
                    <div className={`step ${checkoutStep === 'shipping' ? 'active' : ''}`}>
                        <span>2</span>
                        Shipping
                    </div>
                    <div className={`step ${checkoutStep === 'payment' ? 'active' : ''}`}>
                        <span>3</span>
                        Payment
                    </div>
                </div>
            </header>

            <div className="checkout-layout">
                {/* Main checkout form */}
                <div className="checkout-main">
                    {/* Express checkout options - Shopify style */}
                    <section className="express-checkout-section">
                        <h3>Express checkout</h3>
                        <div className="express-buttons">
                            <button
                                className="express-btn paypal"
                                onClick={() => handleExpressCheckout('paypal')}
                            >
                                PayPal
                            </button>
                            <button
                                className="express-btn google-pay"
                                onClick={() => handleExpressCheckout('google-pay')}
                            >
                                Google Pay
                            </button>
                        </div>

                        <div className="divider">
                            <span>OR</span>
                        </div>
                    </section>

                    {/* Contact information */}
                    <form onSubmit={handleSubmit} className="checkout-form">
                        <section className="form-section">
                            <div className="form-contact-header">
                                <h3>Contact information</h3>
                                {!user && <Link to={"/auth/login"}>Sign in</Link>}
                            </div>
                            <div className="form-group">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    className={errors.email ? 'error' : ''}
                                />
                                {errors.email && <span className="checkout-error-message">{errors.email}</span>}
                            </div>

                            {/* Guest checkout option */}
                            {/* <div className="guest-checkout-option">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={isGuestCheckout}
                                        onChange={(e) => setIsGuestCheckout(e.target.checked)}
                                    />
                                    <span>Check out as guest</span>
                                </label>
                                <p className="note">
                                    You'll be able to create an account after checkout if you'd like.
                                </p>
                            </div> */}
                        </section>

                        {/* Shipping address */}
                        <section className="form-section">
                            <h3>Shipping address</h3>
                            <div className="form-group">
                                <select
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className={errors.country ? 'error' : ''}
                                >
                                    <option value="" disabled>Country/Region</option>
                                    <option value="USA">United States</option>
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="First name"
                                        className={errors.firstName ? 'error' : ''}
                                    />
                                </div>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Last name"
                                        className={errors.lastName ? 'error' : ''}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <input
                                    type="text"
                                    id="addressLine1"
                                    name="addressLine1"
                                    value={formData.addressLine1}
                                    onChange={handleChange}
                                    placeholder="Address Line 1"
                                    className={errors.addressLine1 ? 'error' : ''}
                                />
                                {errors.addressLine1 && <span className="checkout-error-message">{errors.addressLine1}</span>}
                            </div>

                            <div className="form-group">
                                <input
                                    type="text"
                                    id="addressLine2"
                                    name="addressLine2"
                                    value={formData.addressLine2}
                                    onChange={handleChange}
                                    placeholder="Address Line 2"
                                    className={errors.addressLine2 ? 'error' : ''}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                        className={errors.city ? 'error' : ''}
                                    />
                                    {errors.city && <span className="checkout-error-message">{errors.city}</span>}
                                </div>

                                <div className="form-group">
                                    <input
                                        type="text"
                                        id="zipCode"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleChange}
                                        placeholder="ZIP code"
                                        className={errors.zipCode ? 'error' : ''}
                                    />
                                    {errors.zipCode && <span className="checkout-error-message">{errors.zipCode}</span>}
                                </div>
                                <div className="form-group">
                                    <select
                                        id="state"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className={errors.city ? 'error' : ''}
                                    >
                                        <option value="" disabled >Select State</option>
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
                                </div>
                            </div>

                            <div className="phone-input-wrapper">
                                <PhoneInput
                                    country={"us"}
                                    value={formData.phone}
                                    onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
                                    inputProps={{
                                        name: "phone",
                                        id: "phone"
                                    }}
                                    enableSearch
                                    countryCodeEditable={false}
                                    className={errors.phone ? 'error' : ''}
                                />
                                <span className="phone-tooltip">
                                    ?
                                    <span className="tooltip-text">
                                        In case we need to contact you about your order
                                    </span>
                                </span>
                                {errors.phone && <span className="checkout-error-message">{errors.phone}</span>}
                            </div>
                        </section>

                        {/* Shipping method */}
                        <section className="form-section">
                            <h3>Shipping method</h3>

                            <div className="shipping-options">
                                <label className="shipping-option">
                                    <input
                                        type="radio"
                                        name="shippingMethod"
                                        value="standard"
                                        checked={shippingMethod === "standard"}
                                        onChange={() => setShippingMethod("standard")}
                                    />
                                    <div className="option-content">
                                        <span className="option-name">Standard Shipping</span>
                                        <span className="option-price">Free</span>
                                        <span className="option-time">5–7 business days</span>
                                    </div>
                                </label>

                                <label className="shipping-option">
                                    <input
                                        type="radio"
                                        name="shippingMethod"
                                        value="express"
                                        checked={shippingMethod === "express"}
                                        onChange={() => setShippingMethod("express")}
                                    />
                                    <div className="option-content">
                                        <span className="option-name">Express Shipping</span>
                                        <span className="option-price">$9.99</span>
                                        <span className="option-time">2–3 business days</span>
                                    </div>
                                </label>
                            </div>
                        </section>


                        {/* Payment method */}
                        <section className="form-section">
                            <h3>Payment method</h3>

                            {shippingMethod == "standard" && (
                                <>
                                    <div className="checkout-payment-methods">
                                        <label className="checkout-payment-method">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="CARD"
                                                checked={formData.paymentMethod === 'CARD'}
                                                onChange={handleChange}
                                            />
                                            <span>Credit card</span>
                                            <div className="card-icons">
                                                <span className="card-icon visa">Visa</span>
                                                <span className="card-icon mastercard">Mastercard</span>
                                                <span className="card-icon amex">Amex</span>
                                            </div>
                                        </label>

                                        {formData.paymentMethod === 'CARD' && (
                                            <div className="credit-card-form">
                                                <div className="form-group">
                                                    <input
                                                        type="text"
                                                        id="cardNumber"
                                                        name="cardNumber"
                                                        value={formData.cardNumber}
                                                        onChange={handleChange}
                                                        placeholder="Card number"
                                                        className={errors.cardNumber ? 'error' : ''}
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <input
                                                        type="text"
                                                        id="cardName"
                                                        name="cardName"
                                                        value={formData.cardName}
                                                        onChange={handleChange}
                                                        placeholder="Name on card"
                                                        className={errors.cardName ? 'error' : ''}
                                                    />
                                                    {errors.cardName && (
                                                        <span className="checkout-error-message">{errors.cardName}</span>
                                                    )}
                                                </div>

                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <input
                                                            type="text"
                                                            id="expiryDate"
                                                            name="expiryDate"
                                                            value={formData.expiryDate}
                                                            onChange={handleChange}
                                                            placeholder="MM/YY"
                                                            className={errors.expiryDate ? 'error' : ''}
                                                        />
                                                        {errors.expiryDate && (
                                                            <span className="checkout-error-message">{errors.expiryDate}</span>
                                                        )}
                                                    </div>
                                                    <div className="form-group">
                                                        <input
                                                            type="text"
                                                            id="cvv"
                                                            name="cvv"
                                                            value={formData.cvv}
                                                            onChange={handleChange}
                                                            placeholder="CVV"
                                                            className={errors.cvv ? 'error' : ''}
                                                        />
                                                        {errors.cvv && (
                                                            <span className="checkout-error-message">{errors.cvv}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <label className="checkout-payment-method">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="paypal"
                                                checked={formData.paymentMethod === 'paypal'}
                                                onChange={handleChange}
                                            />
                                            <span>PayPal</span>
                                        </label>

                                        {formData.paymentMethod === "paypal" && (
                                            <div className="payment-info paypal-info">
                                                <div className="paypal-icon">
                                                    <img
                                                        src="https://www.svgrepo.com/show/349473/paypal.svg"
                                                        alt="PayPal"
                                                        loading="lazy"
                                                    />
                                                </div>

                                                <p className="payment-note">
                                                    After clicking <strong>“Pay with PayPal”</strong>, you will be redirected
                                                    to PayPal to complete your purchase securely.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                </>
                            )}

                            {shippingMethod === "express" && (
                                <div className="express-checkout-active">
                                    <p>You'll complete your purchase with {shippingMethod && "Express"}.</p>
                                </div>
                            )}
                        </section>

                        {/* Terms and submit */}
                        <div className="form-section">
                            <div className="terms-acceptance">
                                <label className='d-flex align-items-center'>
                                    <input
                                        type="checkbox"
                                        name="termsAccepted"
                                        checked={formData.termsAccepted}
                                        onChange={handleChange}
                                    />
                                    <span>
                                        I agree to the <Link to="/terms">Terms of Service</Link> and
                                        acknowledge the <Link to="/privacy">Privacy Policy</Link>.
                                    </span>
                                </label>
                                {errors.termsAccepted && (
                                    <span className="checkout-error-message">{errors.termsAccepted}</span>
                                )}
                            </div>

                            {formData.paymentMethod === "paypal" ? (
                                <button
                                    type="submit"
                                    className="paypal-submit-order-btn"
                                    disabled={isSubmitting}
                                >
                                    <img
                                        src="https://www.svgrepo.com/show/349473/paypal.svg"
                                        alt="PayPal"
                                    />
                                    {isSubmitting ? "Processing..." : "Pay with PayPal"}
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="submit-order-btn"
                                    disabled={!isFormValid || isSubmitting}
                                >
                                    {isSubmitting ? 'Processing...' : `Pay $${(totalPrice * 1).toFixed(2)}`}
                                </button>
                            )}

                            <p className="secure-notice">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                                </svg>
                                Your payment information is encrypted and secure.
                            </p>
                        </div>
                    </form>

                </div>

                {/* Order summary sidebar */}
                <OrderSummary />
            </div>
            {/* Footer links */}
            <footer className="checkout-footer">
                <Link to="/return-exchange">Return policy</Link>
                <Link to="/privacy">Privacy policy</Link>
                <Link to="/terms">Terms of service</Link>
                <div className="copyright">
                    © {new Date().getFullYear()} The Master Jackets. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Checkout;