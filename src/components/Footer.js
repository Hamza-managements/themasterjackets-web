import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Validation
  const isValidEmail = (email) => /^[^ ]+@[^ ]+\.[a-z]{2,6}$/i.test(email);

  // Toast Message
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Submit newsletter
  const submitNewsletter = () => {
    if (!isValidEmail(email)) {
      showToast("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 3000);
  };

  // Copy code
  const copyDiscountCode = () => {
    const code = "SAVE20";
    navigator.clipboard.writeText(code).then(() => {
      showToast("Code copied to clipboard!");
    });
  };

  return (
    <footer className="luxury-footer">
      <div className="container">

        {toastMessage && (
          <div className="toast-message alert alert-dark text-center">{toastMessage}</div>
        )}

        <div className="row footer-links-row">

          {/* Brand */}
          <div className="col-lg-3 col-md-6 footer-col">
            <span>
              <b style={{ color: '#D6AD60' }}>The Master Jackets</b>
            </span>
            <p>Premium quality products crafted with care for the discerning customer.</p>
            <div className="social-icons">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-pinterest-p"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
            </div>
          </div>


            <div className="col-lg-3 col-md-6 footer-col">
              <h5 className="footer-heading">Shop</h5>
              <ul className="footer-links-main">
                <li><Link to="/product">Biker Jacket</Link></li>
                <li><Link to="/product">New Arrivals</Link></li>
                <li><Link to="/product">Best Sellers</Link></li>
                <li><Link to="/product">Sale Items</Link></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div className="col-lg-3 col-md-6 footer-col">
              <h5 className="footer-heading">Information</h5>
              <ul className="footer-links-main">
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact-us">Contact Us</Link></li>
                <li><Link to="/return-exchange">Return & Policy</Link></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Careers</a></li>
              </ul>
            </div>

            

          {/* Newsletter */}
          <div className="col-lg-3 col-md-6 footer-col">
            <h5 className="footer-heading">Contact</h5>
            <p><i className="fas fa-map-marker-alt"></i> Office # 48, Idrees Chambers, Karachi, Pakistan</p>
            <p><i className="fas fa-phone"></i> (888) 555-1234</p>
            <p><i className="fas fa-envelope"></i> info@themasterjackets.com</p>

            <h5 className="footer-heading mt-3">Newsletter</h5>

            {!loading && !success && (
              <div className="newsletter-form">
                <p>Join our newsletter to get exclusive updates & offers.</p>
                <input
                  type="email"
                  className="newsletter-input form-control mt-3 mb-3"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type="button"
                  className="newsletter-btn w-100"
                  onClick={submitNewsletter}
                >
                  Subscribe
                </button>
              </div>
            )}

            {loading && (
              <div className="mt-3 text-center">
                <div className="spinner-border" role="status"></div>
                <p className="mt-2">Verifying your email...</p>
              </div>
            )}

            {success && (
              <div className="mt-3">
                <p className="text-success fw-semibold mb-2">🎉 Thank you for subscribing!</p>
                <p className="mb-1">Here’s your exclusive code:</p>
                <div className="d-flex justify-content-between align-items-center px-3 py-2 bg-white shadow-sm"
                  style={{ border: '2px dotted #3b3b3b', borderRadius: '50px' }}>
                  <span className="fw-bold text-uppercase text-dark">SAVE20</span>
                  <button className="btn btn-sm rounded-pill text-dark" onClick={copyDiscountCode}>
                    <i className="fas fa-copy"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="copyright">
              &copy; 2025 <Link to="/">The Master Jackets</Link>. All rights reserved.
            </div>
          </div>
          <div className="col-md-6 d-flex justify-content-around gap-2">
            <div className="payment-methods">
              <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/stripe.svg" alt="Stripe" width="30" />
              <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/visa.svg" alt="Visa" width="30" />
              <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mastercard.svg" alt="Mastercard" width="30" />
              <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/paypal.svg" alt="PayPal" width="30" />
              <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/applepay.svg" alt="Apple Pay" width="30" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
