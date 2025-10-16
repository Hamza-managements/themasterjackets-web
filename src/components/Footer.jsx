import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './styles/Footer.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchCategoriesAll } from '../utils/CartUtils';


export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);

  const [toastMessage, setToastMessage] = useState('');

  // Validation
  const isValidEmail = (email) => /^[^ ]+@[^ ]+\.[a-z]{2,6}$/i.test(email);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchCategoriesAll()
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

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
        <div className="row footer-links-row">
          {/* Brand */}
          <div className="col-lg-3 col-md-6 footer-col">
            <span>
              <b style={{ color: '#b72d2d' }}>The Master Jackets</b>
            </span>
            <p>Premium quality products crafted with care for the discerning customer.</p>
            <div className="social-icons">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-pinterest-p"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
            </div>
            <div className='mt-4' >
              <h5 className="footer-heading mb-1">Information</h5>
              <ul className="footer-links-main">
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact-us">Contact Us</Link></li>
                <li><Link to="/return-exchange">Return & Policy</Link></li>
                <li><Link to="#">Blogs</Link></li>
              </ul>
            </div>
          </div>


          {categories?.filter(cat => cat.mainCategoryName === "Men" || cat.mainCategoryName === "Women")
            .map(category => (
              <div key={category._id} className="col-lg-3 col-md-6 footer-col">
                <h5 className="footer-heading"> {category.mainCategoryName}</h5>
                <ul className="footer-links-main">
                  {category.subCategories?.map((sub) => (
                    <li key={sub._id}><Link to={`/products/${sub._id}`}>{sub.categoryName}</Link></li>
                  ))}
                </ul>
              </div>
            ))
          }

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
                  style={{ border: '2px solid #3b3b3b', borderRadius: '50px' }}>
                  <span className="fw-bold text-uppercase text-dark">SAVE20</span>
                  <button className="btn btn-sm rounded-pill text-dark" onClick={copyDiscountCode}>
                    <i className="fas fa-copy"></i>
                  </button>
                </div>
              </div>
            )}
            
            {toastMessage && (
              <div class="toast-message-footer">
                {toastMessage}
              </div>
           )}

          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="copyright">
              &copy; 2025 <Link to="/"><b>The Master Jackets</b></Link>. All rights reserved.
            </div>
          </div>
          <div className="col-md-6 d-flex justify-content-around gap-2">
            <div className="payment-methods">
              <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/stripe.svg" className='stripe-footer' alt="Stripe" width="30" />
              <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/visa.svg" className='visa-footer' alt="Visa" width="30" />
              <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mastercard.svg" className='mastercard-footer-alt' alt="Mastercard" width="30" />
              <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/paypal.svg" className='paypal-footer' alt="PayPal" width="30" />
              <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/applepay.svg" className='applepay-footer' alt="Apple Pay" width="30" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
