// // Checkout.jsx - Shopify-style Checkout
// import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
// import { useState, useEffect, useContext } from 'react';
// import { Link } from 'react-router-dom';
// import zipToStateMap from '../data/fullZipData';
// import PhoneInput from "react-phone-input-2";
// import './styles/Checkout.css';
// import "react-phone-input-2/lib/material.css";
// import { AuthContext } from '../context/AuthContext';
// import { validateCheckout } from './ValidateCheckout';
// import OrderSuccess from './OrderSuccess';
// import { createPortal } from "react-dom";
// import { createCheckoutSession, createStripeIntent, orderPaymentConfirm } from "../utils/OrderUtils";
// import { AlertCircle, CreditCard, LockIcon } from "lucide-react";
// import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDiscover } from 'react-icons/fa';

// const Checkout = ({ cartId, cartItems, totalPrice, onPlaceOrder, refreshCart }) => {
//     const [formData, setFormData] = useState({
//         firstName: '',
//         lastName: '',
//         fullName: '',
//         email: '',
//         phone: '',
//         addressLine1: '',
//         addressLine2: '',
//         city: '',
//         zipCode: '',
//         country: '',
//         state: '',
//         paymentMethod: 'card',
//         cardNumber: '',
//         cardName: '',
//         expiryDate: '',
//         cvv: '',
//         termsAccepted: false
//     });

//     const stripe = useStripe();
//     const elements = useElements();
//     const { user } = useContext(AuthContext);
//     const [errors, setErrors] = useState({});
//     const [submitError, setSubmitError] = useState(null);
//     const [, setCardComplete] = useState(false);
//     const [cardError, setCardError] = useState("");
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [orderSuccess, setOrderSuccess] = useState(false);
//     const [isFormValid, setIsFormValid] = useState(false);
//     const [hasInteracted, setHasInteracted] = useState(false);
//     const [shippingMethod, setShippingMethod] = useState("standard");
//     const [showOrderSummary, setShowOrderSummary] = useState(false);
//     const [openShippingModal, setOpenShippingModal] = useState(false);
//     // const [isGuestCheckout, setIsGuestCheckout] = useState(xtrue); // below is the input that is commented out

//     const { zipCode, state, country } = formData;

//     useEffect(() => {
//         const zip = zipCode?.trim();
//         const stateCode = zipToStateMap[zip];

//         if (
//             zip?.length === 5 &&
//             stateCode &&
//             (state !== stateCode || country !== "USA")
//         ) {
//             setFormData(prev => ({
//                 ...prev,
//                 state: stateCode,
//                 country: "USA",
//             }));
//         }
//     }, [zipCode, state, country]);

//     useEffect(() => {
//         if (user) {
//             setFormData(prev => ({
//                 ...prev,
//                 email: user.userEmail || "",
//                 firstName: user?.userName?.split(" ")[0] || "",
//                 lastName: user?.userName?.split(" ")[1] || "",
//                 fullName: user?.userName || ""
//             }));
//         }
//     }, [user]);

//     useEffect(() => {
//         if (!hasInteracted) return;
//         const timeout = setTimeout(async () => {
//             const valid = await validateCheckout(formData, setErrors);
//             setIsFormValid(valid);
//         }, 300);

//         return () => clearTimeout(timeout);
//     }, [formData, hasInteracted]);

//     // Express checkout handlers
//     const handleExpressCheckout = (provider) => {
//         setShippingMethod("standard");
//         setTimeout(() => {
//             setFormData(prev => ({
//                 ...prev,
//                 email: 'customer@example.com',
//                 firstName: 'John',
//                 lastName: 'Doe',
//                 addressLine1: '123 Shopify St',
//                 addressLine2: '',
//                 city: 'San Francisco',
//                 state: 'CA',
//                 zipCode: '94107',
//                 country: 'USA'
//             }));
//             setFormData(prev => ({
//                 ...prev,
//                 paymentMethod: provider === 'paypal' ? 'paypal' : 'card'
//             }));
//         }, 500);
//     };

//     const handleChange = (e) => {
//         setHasInteracted(true);
//         const { name, value, type, checked } = e.target;

//         setFormData(prev => {
//             let updated = {
//                 ...prev,
//                 [name]: type === "checkbox" ? checked : value
//             };

//             if (name === "zipCode") {
//                 const location = zipToStateMap[value];
//                 if (location) {
//                     updated.state = location.state;
//                     updated.country = location.country;
//                 }
//             }

//             if (name === "firstName" || name === "lastName") {
//                 updated.fullName = `${updated.firstName} ${updated.lastName}`.trim();
//             }

//             return updated;
//         });
//     };

//     const handleStripePayment = async (orderData) => {
//         try {
//             setIsSubmitting(true);
//             setSubmitError(null);

//             const res = await createStripeIntent(orderData);

//             console.log("Stripe order creation response:", res);

//             const { intentId, paymentId, clientSecret } = res.data?.data;

//             const resultStripe = await stripe.confirmCardPayment(clientSecret, {
//                 payment_method: {
//                     card: elements.getElement(CardElement),
//                 },
//             });

//             console.log("stripeeeee:", resultStripe);

//             const result = await orderPaymentConfirm(paymentId, intentId);

//             console.log("Payment Api response:", result);

//             if (result.error) {
//                 setSubmitError(result.error.message);
//                 setIsSubmitting(false);
//                 return;
//             }

//             if (result.paymentIntent.status !== "succeeded") {
//                 setSubmitError("Payment not successful");
//                 setIsSubmitting(false);
//                 return;
//             }

//             // 3. Place order in backend
//             await onPlaceOrder({
//                 ...orderData,
//                 payment: {
//                     method: "card",
//                     stripePaymentId: result.paymentIntent.id
//                 }
//             });

//             await refreshCart();
//             setOrderSuccess(true);

//         } catch (err) {
//             console.error(err);
//             setSubmitError(
//                 err?.response?.data?.message ||
//                 err?.message ||
//                 "Payment failed. Please try again."
//             );
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setHasInteracted(true);
//         setSubmitError(null);

//         const isValid = await validateCheckout(formData, setErrors);
//         if (!isValid) return;

//         setIsSubmitting(true);

//         const payload = {
//             userDetails: user?.uid
//                 ? { userId: user.uid }
//                 : { guestEmail: formData.email },
//             items: cartItems.map(item => ({
//                 productId: item?.productId?._id,
//                 variationId: item?.variationId,
//                 selectedAttributes: item?.selectedAttributes,
//                 quantity: item?.quantity,
//                 unitPrice: item?.price
//             })),
//             shippingAddress: {
//                 fullName: formData.fullName,
//                 phone: formData.phone,
//                 addressLine1: formData.addressLine1,
//                 addressLine2: formData.addressLine2,
//                 postalCode: formData.zipCode,
//                 city: formData.city,
//                 state: formData.state,
//                 country: formData.country
//             },
//             payment: {
//                 method: formData.paymentMethod
//             },
//             cartId
//         };
//         console.log(payload)

//         if (formData.paymentMethod === "card") {
//             await handleCreateStripeSession(payload);
//             // await handleStripePayment(payload);
//         } else {
//             setIsSubmitting(true);
//             try {
//                 await onPlaceOrder(payload);
//                 await refreshCart();
//                 setOrderSuccess(true);
//             } catch (err) {
//                 setSubmitError(err?.message || "Something went wrong");
//             } finally {
//                 setIsSubmitting(false);
//             }
//         }
//     };

//     const handleCreateStripeSession = async (payload) => {
//         try {
//             if (!payload || !payload.items?.length) {
//                 throw new Error("Cart is empty");
//             }

//             const data = await createCheckoutSession(payload);
//             console.log("dataaa" , data)
//             if (data?.data?.checkoutUrl) {
//                 window.location.href = data?.data?.checkoutUrl;
//             } else {
//                 throw new Error("Invalid session response");
//             }
//         } catch (error) {
//             console.error("Checkout Error:", error.message);

//             // Optional UI feedback
//             alert("Something went wrong while processing payment");
//         }
//     };

//     const OrderSummary = () => (
//         <div className={`order-summary-sidebar ${showOrderSummary ? 'mobile-visible' : ''}`}>
//             <div className="summary-header">
//                 <button
//                     className="summary-toggle"
//                     onClick={() => setShowOrderSummary(!showOrderSummary)}
//                 >
//                     {showOrderSummary ? 'Hide' : 'Show'} order summary
//                     <span className="summary-arrow">{showOrderSummary ? '↑' : '↓'}</span>
//                 </button>
//                 {!showOrderSummary ? <div className="summary-total">${(totalPrice * 1).toFixed(2)}</div> : ''}
//             </div>

//             {!cartItems || cartItems.length === 0 ?
//                 (
//                     <div className="empty-cart-wrapper">
//                         <div className="empty-cart-box">
//                             <div className="empty-cart-icon">🛒</div>

//                             <h2>Your cart is empty</h2>
//                             <p>
//                                 Looks like you haven’t added anything to your cart yet.
//                                 Start shopping to continue checkout.
//                             </p>

//                             <a href="/products/new-in/new-arrivals" className="empty-cart-btn">
//                                 Continue shopping
//                             </a>
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="summary-content">
//                         {cartItems?.map((item) => (
//                             <div key={item?.variationId} className="summary-item">
//                                 <div className="checkout-item-image">
//                                     <img src={item?.productId?.productImages[0]} alt={item?.productId?.productName} />
//                                     <span className="checkout-item-quantity">{item?.quantity}</span>
//                                 </div>
//                                 <div className="checkout-item-details">
//                                     <h4>{item?.productId?.productName}</h4>
//                                     <p>Size: {item?.selectedAttributes?.size}</p>
//                                 </div>
//                                 <div className="checkout-item-price">${(item?.price * item?.quantity).toFixed(2)}</div>
//                             </div>
//                         ))}
//                         <div className="checkout-summary-totals">
//                             <div className="total-row">
//                                 <span>Subtotal</span>
//                                 <span>${totalPrice?.toFixed(2)}</span>
//                             </div>
//                             {/* Shipping row */}
//                             <div className="total-row">
//                                 <span className="shipping-label">
//                                     Shipping
//                                     <button
//                                         type="button"
//                                         className="checkout-info-btn"
//                                         onClick={() => setOpenShippingModal(true)}
//                                     >
//                                         ?
//                                     </button>
//                                 </span>
//                                 <span>Calculated at next step</span>
//                             </div>

//                             {openShippingModal &&
//                                 createPortal(
//                                     <div
//                                         className="checkout-shipping-modal-backdrop"
//                                         onClick={() => setOpenShippingModal(false)}
//                                     >
//                                         <div
//                                             className="checkout-shipping-modal"
//                                             onClick={(e) => e.stopPropagation()}
//                                         >
//                                             <div className="checkout-shipping-modal-header">
//                                                 <h3>Shipping Policy</h3>
//                                                 <button
//                                                     className="checkout-shipping-close"
//                                                     onClick={() => setOpenShippingModal(false)}
//                                                 >
//                                                     ✕
//                                                 </button>
//                                             </div>

//                                             <div className="checkout-shipping-modal-body">
//                                                 <p>
//                                                     Shipping charges are calculated at checkout based on your delivery
//                                                     address and selected shipping method.
//                                                 </p>
//                                                 <p>
//                                                     Orders are processed within 1–3 business days.
//                                                 </p><p>
//                                                     1. Delivery Time:
//                                                 </p><p>
//                                                     Orders are delivered between 5-8 working days.
//                                                 </p><p>
//                                                     Note - You can contact us at info@themasterjackets.com, and we will be happy to assist you.
//                                                 </p><p>
//                                                     2. Tracking:
//                                                 </p><p>
//                                                     The customer will receive a tracking link via email once his or her order is shipped from our location.
//                                                 </p><p>
//                                                     3. Courier Service:
//                                                 </p><p>
//                                                     We use valuable courier services (DHL, FedEx, or USPS) that are known for shipping products on time. We may choose to ship from the US, UK, or from our overseas warehouses.
//                                                 </p><p>
//                                                     4. In Case of Damage/Defect:
//                                                 </p><p>
//                                                     We make every effort to provide you with high-quality flawless products. However, if the item is damaged during the shipment process, please contact us within 7 days.
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     </div>,
//                                     document.body
//                                 )
//                             }

//                             {/* <div className="total-row">
//                                 <span>Tax</span>
//                                 <span>${(totalPrice * 0).toFixed(2)}</span>
//                             </div> */}
//                             <div className="total-row">
//                                 <span><span className='grand-total'>Total</span></span>
//                                 <span>USD<span className='grand-total'> ${(totalPrice * 1).toFixed(2)}</span></span>
//                             </div>
//                         </div>

//                         {/* Trust badges */}
//                         <div className="trust-badges">
//                             <div className="trust-badge">
//                                 <svg viewBox="0 0 24 24" width="16" height="16">
//                                     <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
//                                 </svg>
//                                 Secure checkout
//                             </div>
//                             <div className="trust-badge">
//                                 <svg viewBox="0 0 24 24" width="16" height="16">
//                                     <path d="M20 8l-8 5-8-5v10h16V8zm-8-6l8 4v2l-8-5-8 5V6l8-4z" />
//                                 </svg>
//                                 SSL encrypted
//                             </div>
//                         </div>
//                     </div>
//                 )
//             }
//         </div >
//     );

//     return (
//         <div className="checkout-container shopify-style">
//             {orderSuccess ? (
//                 <OrderSuccess user={user?.uid ? "true" : "false"} />
//             ) : (
//                 <>
//                     <header className="checkout-header">
//                         <Link to="/" className="checkout-logo">
//                             <img
//                                 src="https://res.cloudinary.com/dvmpyh0hj/image/upload/v1760615184/hilkmru9zutcneybpwwc.png"
//                                 alt="The Master Jackets"
//                             />
//                         </Link>
//                         {/* <div className="checkout-steps">
//                             <div className={`step ${checkoutStep === 'information' ? 'active' : ''}`}>
//                                 <span>1</span>
//                                 Information
//                             </div>
//                             <div className={`step ${checkoutStep === 'shipping' ? 'active' : ''}`}>
//                                 <span>2</span>
//                                 Shipping
//                             </div>
//                             <div className={`step ${checkoutStep === 'payment' ? 'active' : ''}`}>
//                                 <span>3</span>
//                                 Payment
//                             </div>
//                         </div> */}
//                     </header>

//                     <div className="checkout-layout">
//                         {/* Main checkout form */}
//                         <div className="checkout-main">
//                             {/* Express checkout options - Shopify style */}
//                             <section className="express-checkout-section">
//                                 <h3>Express checkout</h3>
//                                 <div className="express-buttons">
//                                     <button
//                                         className="express-btn paypal"
//                                         onClick={() => handleExpressCheckout('paypal')}
//                                     >
//                                         <img src="https://res.cloudinary.com/dekf5dyng/image/upload/v1768391458/paypal_cp6hum.png" height={30} alt="" />
//                                     </button>
//                                     <button
//                                         className="express-btn stripe-pay"
//                                         onClick={() => handleExpressCheckout("card")}
//                                     >
//                                         <img
//                                             src="https://res.cloudinary.com/dekf5dyng/image/upload/v1769500363/Stripe_Logo__revised_2016.svg_biqcli.png"
//                                             height={30}
//                                             alt="Stripe"
//                                         />
//                                     </button>
//                                 </div>

//                                 <div className="divider">
//                                     <span>OR</span>
//                                 </div>
//                             </section>

//                             {/* Contact information */}
//                             <form onSubmit={handleSubmit} className="checkout-form">
//                                 <section className="form-section">
//                                     <div className="form-contact-header">
//                                         <h3>Contact</h3>
//                                         {!user && <Link to={"/auth/login"}>Sign in</Link>}
//                                     </div>
//                                     <div className="checkout-form-group">
//                                         <input
//                                             type="email"
//                                             id="email"
//                                             name="email"
//                                             value={formData.email}
//                                             onChange={handleChange}
//                                             placeholder="Email"
//                                             className={errors.email ? 'error' : ''}
//                                         />
//                                         {errors.email && <span className="checkout-error-message">{errors.email}</span>}
//                                     </div>

//                                     {/* Guest checkout option */}
//                                     {/* <div className="guest-checkout-option">
//                                 <label>
//                                     <input
//                                         type="checkbox"
//                                         checked={isGuestCheckout}
//                                         onChange={(e) => setIsGuestCheckout(e.target.checked)}
//                                     />
//                                     <span>Check out as guest</span>
//                                 </label>
//                                 <p className="note">
//                                     You'll be able to create an account after checkout if you'd like.
//                                 </p>
//                             </div> */}
//                                 </section>

//                                 {/* Shipping address */}
//                                 <section className="form-section">
//                                     <h3>Delivery</h3>
//                                     <div className="checkout-form-group">
//                                         <select
//                                             id="country"
//                                             name="country"
//                                             value={formData.country}
//                                             onChange={handleChange}
//                                             className={errors.country ? 'error' : ''}
//                                         >
//                                             <option value="" disabled>Country/Region</option>
//                                             <option value="USA">United States</option>
//                                         </select>
//                                     </div>
//                                     <div className="checkout-form-row">
//                                         <div className="checkout-form-group">
//                                             <input
//                                                 type="text"
//                                                 id="firstName"
//                                                 name="firstName"
//                                                 value={formData.firstName}
//                                                 onChange={handleChange}
//                                                 placeholder="First name"
//                                                 className={errors.firstName ? 'error' : ''}
//                                             />
//                                         </div>
//                                         <div className="checkout-form-group">
//                                             <input
//                                                 type="text"
//                                                 id="lastName"
//                                                 name="lastName"
//                                                 value={formData.lastName}
//                                                 onChange={handleChange}
//                                                 placeholder="Last name"
//                                                 className={errors.lastName ? 'error' : ''}
//                                             />
//                                         </div>
//                                     </div>

//                                     <div className="checkout-form-group">
//                                         <input
//                                             type="text"
//                                             id="addressLine1"
//                                             name="addressLine1"
//                                             value={formData.addressLine1}
//                                             onChange={handleChange}
//                                             placeholder="Address Line 1"
//                                             className={errors.addressLine1 ? 'error' : ''}
//                                         />
//                                         {errors.addressLine1 && <span className="checkout-error-message">{errors.addressLine1}</span>}
//                                     </div>

//                                     <div className="checkout-form-group">
//                                         <input
//                                             type="text"
//                                             id="addressLine2"
//                                             name="addressLine2"
//                                             value={formData.addressLine2}
//                                             onChange={handleChange}
//                                             placeholder="Address Line 2"
//                                             className={errors.addressLine2 ? 'error' : ''}
//                                         />
//                                     </div>

//                                     <div className="checkout-form-row phone-zip-row">
//                                         <div className="checkout-form-group">
//                                             <input
//                                                 type="text"
//                                                 id="city"
//                                                 name="city"
//                                                 value={formData.city}
//                                                 onChange={handleChange}
//                                                 placeholder="City"
//                                                 className={errors.city ? 'error' : ''}
//                                             />
//                                             {errors.city && <span className="checkout-error-message">{errors.city}</span>}
//                                         </div>

//                                         <div className="checkout-form-group">
//                                             <select
//                                                 id="state"
//                                                 name="state"
//                                                 value={formData.state}
//                                                 onChange={handleChange}
//                                                 className={errors.city ? 'error' : ''}
//                                             >
//                                                 <option value="" disabled >State</option>
//                                                 <option value="AL">Alabama</option>
//                                                 <option value="AK">Alaska</option>
//                                                 <option value="AZ">Arizona</option>
//                                                 <option value="AR">Arkansas</option>
//                                                 <option value="CA">California</option>
//                                                 <option value="CO">Colorado</option>
//                                                 <option value="CT">Connecticut</option>
//                                                 <option value="DE">Delaware</option>
//                                                 <option value="FL">Florida</option>
//                                                 <option value="GA">Georgia</option>
//                                                 <option value="ID">Idaho</option>
//                                                 <option value="IL">Illinois</option>
//                                                 <option value="IN">Indiana</option>
//                                                 <option value="IA">Iowa</option>
//                                                 <option value="KS">Kansas</option>
//                                                 <option value="KY">Kentucky</option>
//                                                 <option value="LA">Louisiana</option>
//                                                 <option value="ME">Maine</option>
//                                                 <option value="MD">Maryland</option>
//                                                 <option value="MA">Massachusetts</option>
//                                                 <option value="MI">Michigan</option>
//                                                 <option value="MN">Minnesota</option>
//                                                 <option value="MS">Mississippi</option>
//                                                 <option value="MO">Missouri</option>
//                                                 <option value="MT">Montana</option>
//                                                 <option value="NE">Nebraska</option>
//                                                 <option value="NV">Nevada</option>
//                                                 <option value="NH">New Hampshire</option>
//                                                 <option value="NJ">New Jersey</option>
//                                                 <option value="NM">New Mexico</option>
//                                                 <option value="NY">New York</option>
//                                                 <option value="NC">North Carolina</option>
//                                                 <option value="ND">North Dakota</option>
//                                                 <option value="OH">Ohio</option>
//                                                 <option value="OK">Oklahoma</option>
//                                                 <option value="OR">Oregon</option>
//                                                 <option value="PA">Pennsylvania</option>
//                                                 <option value="RI">Rhode Island</option>
//                                                 <option value="SC">South Carolina</option>
//                                                 <option value="SD">South Dakota</option>
//                                                 <option value="TN">Tennessee</option>
//                                                 <option value="TX">Texas</option>
//                                                 <option value="UT">Utah</option>
//                                                 <option value="VT">Vermont</option>
//                                                 <option value="VA">Virginia</option>
//                                                 <option value="WA">Washington</option>
//                                                 <option value="WV">West Virginia</option>
//                                                 <option value="WI">Wisconsin</option>
//                                                 <option value="WY">Wyoming</option>
//                                             </select>
//                                         </div>

//                                         <div className="checkout-form-group">
//                                             <input
//                                                 type="text"
//                                                 id="zipCode"
//                                                 name="zipCode"
//                                                 value={formData.zipCode}
//                                                 onChange={handleChange}
//                                                 placeholder="ZIP code"
//                                                 className={errors.zipCode ? 'error' : ''}
//                                             />
//                                             {errors.zipCode && <span className="checkout-error-message">{errors.zipCode}</span>}
//                                         </div>
//                                     </div>

//                                     <div className="phone-input-wrapper">
//                                         <PhoneInput
//                                             country={"us"}
//                                             value={formData.phone}
//                                             onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
//                                             inputProps={{
//                                                 name: "phone",
//                                                 id: "phone"
//                                             }}
//                                             enableSearch
//                                             countryCodeEditable={false}
//                                             className={errors.phone ? 'error' : ''}
//                                         />
//                                         <span className="phone-tooltip">
//                                             ?
//                                             <span className="tooltip-text">
//                                                 In case we need to contact you about your order
//                                             </span>
//                                         </span>
//                                         {errors.phone && <span className="checkout-error-message">{errors.phone}</span>}
//                                     </div>
//                                 </section>

//                                 {/* Shipping method */}
//                                 <section className="form-section">
//                                     <h3>Shipping method</h3>

//                                     <div className="shipping-options">
//                                         <label className={`shipping-option ${shippingMethod === "standard" ? "selected" : ""}`}>
//                                             <input
//                                                 type="radio"
//                                                 name="shippingMethod"
//                                                 value="standard"
//                                                 checked={shippingMethod === "standard"}
//                                                 onChange={() => setShippingMethod("standard")}
//                                             />
//                                             <div className="option-content">
//                                                 <span className="option-name">Standard Shipping</span>
//                                                 <span className="option-price">Free</span>
//                                                 <span className="option-time">5–7 business days</span>
//                                             </div>
//                                         </label>

//                                         {/* <label className="shipping-option">
//                                             <input
//                                                 type="radio"
//                                                 name="shippingMethod"
//                                                 value="express"
//                                                 checked={shippingMethod === "express"}
//                                                 onChange={() => setShippingMethod("express")}
//                                             />
//                                             <div className="option-content">
//                                                 <span className="option-name">Express Shipping</span>
//                                                 <span className="option-price">$9.99</span>
//                                                 <span className="option-time">2–3 business days</span>
//                                             </div>
//                                         </label> */}
//                                     </div>
//                                 </section>


//                                 {/* Payment method */}
//                                 <section className="form-section">
//                                     <h3>Payment method</h3>

//                                     {shippingMethod === "standard" && (
//                                         <>
//                                             <div className="checkout-payment-methods">
//                                                 <label className={`checkout-payment-method ${formData.paymentMethod === "card" ? "selected" : ""}`}>
//                                                     <div className="payment-method-header">
//                                                         <div className="payment-method-title">
//                                                             <input
//                                                                 type="radio"
//                                                                 name="paymentMethod"
//                                                                 value="card"
//                                                                 checked={formData.paymentMethod === 'card'}
//                                                                 onChange={handleChange}
//                                                             />
//                                                             <CreditCard className="checkout-payment-icon" />
//                                                             <span>Credit or debit card</span>
//                                                         </div>
//                                                         <div className="payment-logos">
//                                                             <FaCcVisa className="card-logo" />
//                                                             <FaCcMastercard className="card-logo" />
//                                                             <FaCcAmex className="card-logo" />
//                                                             <FaCcDiscover className="card-logo" />
//                                                         </div>
//                                                     </div>
//                                                 </label>

//                                                 {/* {formData.paymentMethod === 'card' && (
//                                                     <div className="credit-card-form">
//                                                         <div className="checkout-form-group">
//                                                             <input
//                                                                 type="text"
//                                                                 id="cardNumber"
//                                                                 name="cardNumber"
//                                                                 value={formData.cardNumber}
//                                                                 onChange={handleChange}
//                                                                 placeholder="Card number"
//                                                                 className={errors.cardNumber ? 'error' : ''}
//                                                             />
//                                                         </div>

//                                                         <div className="checkout-form-group">
//                                                             <input
//                                                                 type="text"
//                                                                 id="cardName"
//                                                                 name="cardName"
//                                                                 value={formData.cardName}
//                                                                 onChange={handleChange}
//                                                                 placeholder="Name on card"
//                                                                 className={errors.cardName ? 'error' : ''}
//                                                             />
//                                                             {errors.cardName && (
//                                                                 <span className="checkout-error-message">{errors.cardName}</span>
//                                                             )}
//                                                         </div>

//                                                         <div className="checkout-form-row">
//                                                             <div className="checkout-form-group">
//                                                                 <input
//                                                                     type="text"
//                                                                     id="expiryDate"
//                                                                     name="expiryDate"
//                                                                     value={formData.expiryDate}
//                                                                     onChange={handleChange}
//                                                                     placeholder="MM/YY"
//                                                                     className={errors.expiryDate ? 'error' : ''}
//                                                                 />
//                                                                 {errors.expiryDate && (
//                                                                     <span className="checkout-error-message">{errors.expiryDate}</span>
//                                                                 )}
//                                                             </div>
//                                                             <div className="checkout-form-group">
//                                                                 <input
//                                                                     type="text"
//                                                                     id="cvv"
//                                                                     name="cvv"
//                                                                     value={formData.cvv}
//                                                                     onChange={handleChange}
//                                                                     placeholder="CVV"
//                                                                     className={errors.cvv ? 'error' : ''}
//                                                                 />
//                                                                 {errors.cvv && (
//                                                                     <span className="checkout-error-message">{errors.cvv}</span>
//                                                                 )}
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 )} */}

//                                                 {formData.paymentMethod === 'card' && (
//                                                     <div className="checkout-form-group">
//                                                         <div className={`checkout-stripe-card ${submitError ? 'stripe-card-error' : ''}`}>
//                                                             <div className="stripe-card-wrapper">
//                                                                 <div className="stripe-card-label">
//                                                                     Card information
//                                                                 </div>
//                                                                 <div className="stripe-card-element-container">
//                                                                     <CardElement
//                                                                         id="card-element"
//                                                                         onChange={(e) => {
//                                                                             setCardComplete(e.complete);
//                                                                             setCardError(e.error ? e.error.message : "");
//                                                                         }}
//                                                                         //  ${isCardFocused ? 'stripe-card-focused' : ''}
//                                                                         // onFocus={() => setIsCardFocused(true)}
//                                                                         // onBlur={() => setIsCardFocused(false)}
//                                                                         options={{
//                                                                             style: {
//                                                                                 base: {
//                                                                                     fontSize: '16px',
//                                                                                     color: '#1a1a1a',
//                                                                                     fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
//                                                                                     fontSmoothing: 'antialiased',
//                                                                                     fontWeight: '400',
//                                                                                     lineHeight: '1.5',
//                                                                                     '::placeholder': {
//                                                                                         color: '#6b7280',
//                                                                                         fontWeight: '400',
//                                                                                     },
//                                                                                     padding: '12px 14px',
//                                                                                     backgroundColor: 'transparent',
//                                                                                     ':-webkit-autofill': {
//                                                                                         color: '#1a1a1a',
//                                                                                         backgroundColor: '#fefce8',
//                                                                                     },
//                                                                                 },
//                                                                                 invalid: {
//                                                                                     color: '#dc2626',
//                                                                                     iconColor: '#dc2626',
//                                                                                 },
//                                                                             },
//                                                                             hidePostalCode: true,
//                                                                             classes: {
//                                                                                 focus: 'stripe-card-focus',
//                                                                                 empty: 'stripe-card-empty',
//                                                                                 invalid: 'stripe-card-invalid',
//                                                                                 complete: 'stripe-card-complete',
//                                                                             },
//                                                                         }}
//                                                                     />
//                                                                 </div>

//                                                                 {cardError && (
//                                                                     <div style={{ color: "red", marginTop: "8px" }}>
//                                                                         {cardError}
//                                                                     </div>
//                                                                 )}

//                                                                 <div className="stripe-card-hint">
//                                                                     <LockIcon className="lock-icon" />
//                                                                     <span>Your payment details are secured with 256-bit SSL encryption</span>
//                                                                 </div>
//                                                             </div>

//                                                             {submitError ? (
//                                                                 <div className="checkout-error-message">
//                                                                     <AlertCircle className="error-icon" />
//                                                                     <span>{submitError}</span>
//                                                                 </div>
//                                                             ) : (
//                                                                 <div className="stripe-card-help">
//                                                                     <span>Accepted cards: Visa, Mastercard, American Express, Discover</span>
//                                                                     <Link to="/about-us" className="security-link">
//                                                                         How we keep your information safe
//                                                                     </Link>
//                                                                 </div>
//                                                             )}
//                                                         </div>
//                                                     </div>
//                                                 )}

//                                                 <label className={`checkout-payment-method ${formData.paymentMethod === "paypal" ? "selected" : ""}`}>
//                                                     <input
//                                                         type="radio"
//                                                         name="paymentMethod"
//                                                         value="paypal"
//                                                         checked={formData.paymentMethod === 'paypal'}
//                                                         onChange={handleChange}
//                                                     />
//                                                     <span>PayPal</span>
//                                                 </label>

//                                                 {formData.paymentMethod === "paypal" && (
//                                                     <div className="payment-info paypal-info">
//                                                         <div className="paypal-icon">
//                                                             <img
//                                                                 src="https://www.svgrepo.com/show/349473/paypal.svg"
//                                                                 alt="PayPal"
//                                                                 loading="lazy"
//                                                             />
//                                                         </div>

//                                                         <p className="payment-note">
//                                                             After clicking <strong>“Pay with PayPal”</strong>, you will be redirected
//                                                             to PayPal to complete your purchase securely.
//                                                         </p>
//                                                     </div>
//                                                 )}
//                                                 {/* <label className={`checkout-payment-method ${formData.paymentMethod === "stripe" ? "selected" : ""}`}>
//                                                     <input
//                                                         type="radio"
//                                                         name="paymentMethod"
//                                                         value="stripe"
//                                                         checked={formData.paymentMethod === 'stripe'}
//                                                         onChange={handleChange}
//                                                     />
//                                                     <span>Stripe</span>
//                                                 </label> */}

//                                                 {/* {formData.paymentMethod === "stripe" && (
//                                                     <div className="payment-info paypal-info">
//                                                         <div className="paypal-icon">
//                                                             <img
//                                                                 src="https://res.cloudinary.com/dekf5dyng/image/upload/v1769500924/images_axnhqp.png"
//                                                                 alt="Stripe"
//                                                                 loading="lazy"
//                                                             />
//                                                         </div>

//                                                         <p className="payment-note">
//                                                             After clicking <strong>“Pay with Stripe”</strong>, you will be redirected
//                                                             to Stripe to complete your purchase securely.
//                                                         </p>
//                                                     </div>
//                                                 )} */}
//                                             </div>
//                                         </>
//                                     )}

//                                     {shippingMethod === "express" && (
//                                         <div className="express-checkout-active">
//                                             <p>You'll complete your purchase with {shippingMethod && "Express"}.</p>
//                                         </div>
//                                     )}
//                                 </section>

//                                 {/* Terms and submit */}
//                                 <div className="form-section">
//                                     <div className="terms-acceptance">
//                                         <label className='d-flex align-items-center'>
//                                             <input
//                                                 type="checkbox"
//                                                 name="termsAccepted"
//                                                 checked={formData.termsAccepted}
//                                                 onChange={handleChange}
//                                             />
//                                             <span>
//                                                 I agree to the <Link to="/terms">Terms of Service</Link> and
//                                                 acknowledge the <Link to="/privacy">Privacy Policy</Link>.
//                                             </span>
//                                         </label>
//                                         {errors.termsAccepted && (
//                                             <span className="checkout-error-message">{errors.termsAccepted}</span>
//                                         )}
//                                     </div>

//                                     {submitError && (
//                                         <div className="checkout-submission-error">
//                                             {submitError}
//                                         </div>
//                                     )}

//                                     {cartItems.length === 0 ? (
//                                         <div className="checkout-submission-error">
//                                             Your cart is empty.
//                                         </div>
//                                     ) : formData.paymentMethod === "paypal" ? (
//                                         <button
//                                             type="submit"
//                                             className="paypal-submit-order-btn"
//                                             disabled={isSubmitting || orderSuccess}
//                                         >
//                                             <img
//                                                 src="https://www.svgrepo.com/show/349473/paypal.svg"
//                                                 alt="PayPal"
//                                             />
//                                             {isSubmitting ? "Processing..." : "Pay with PayPal"}
//                                         </button>
//                                     ) : formData.paymentMethod === "stripe" ? (
//                                         <button
//                                             type="submit"
//                                             className="stripe-submit-order-btn"
//                                             disabled={isSubmitting || orderSuccess}
//                                         >
//                                             <img
//                                                 src="https://res.cloudinary.com/dekf5dyng/image/upload/v1769500924/images_axnhqp.png"
//                                                 alt="Stripe"
//                                             />
//                                             {isSubmitting ? "Processing..." : "Pay with Stripe"}
//                                         </button>
//                                     ) : (
//                                         <button
//                                             type="submit"
//                                             className="submit-order-btn"
//                                             disabled={!isFormValid || isSubmitting || orderSuccess}
//                                         //  || !cardComplete
//                                         >
//                                             {isSubmitting
//                                                 ? "Processing..."
//                                                 : `Pay $${(totalPrice * 1).toFixed(2)}`}
//                                         </button>
//                                     )}

//                                     <p className="secure-notice">
//                                         <svg viewBox="0 0 24 24" width="16" height="16">
//                                             <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
//                                         </svg>
//                                         Your payment information is encrypted and secure.
//                                     </p>
//                                 </div>
//                             </form>

//                         </div>

//                         {/* Order summary sidebar */}
//                         <OrderSummary />
//                     </div>
//                     {/* Footer links */}
//                     <footer className="checkout-footer">
//                         <Link to="/return-exchange">Return policy</Link>
//                         <Link to="/privacy">Privacy policy</Link>
//                         <Link to="/terms">Terms of service</Link>
//                         <div className="copyright">
//                             © {new Date().getFullYear()} The Master Jackets. All rights reserved.
//                         </div>
//                     </footer>
//                 </>
//             )}
//         </div>
//     );
// };

// export default Checkout;