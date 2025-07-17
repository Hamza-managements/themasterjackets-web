import './Headers.css';
import React, { useState, useEffect } from 'react';
import { openCart } from './Cart';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/UseAuth';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (searchOpen) setSearchOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`fs-header-container ${isScrolled ? 'scrolled' : ''}`}>
        <div className="fs-header-content">
          <div className="fs-announcement-bar">
            Summer Sale! Up to 50% off{' '}
            <Link to="/product">Shop Now</Link>
          </div>

          <div className="fs-main-header">
            {/* Mobile Menu Button */}
            <button
              className="fs-mobile-menu-btn"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>

            {/* Logo */}
            <Link to="/">
              <img
                className="fs-logo"
                src='https://res.cloudinary.com/dekf5dyng/image/upload/v1752742536/official_tmj_logo_jygsft.png'
                alt="Master Jackets"
              />
            </Link>

            {/* Navigation */}
            <nav className={`fs-nav-container ${mobileMenuOpen ? 'mobile-open' : ''}`}>
              <div className="fs-nav-links">
                <div className="fs-nav-item">
                  <Link to="#" className="fs-main-link">Best Seller</Link>
                </div>

                <div className="fs-nav-item">
                  <Link to="/men" className="fs-main-link">
                    Men <i className="fas fa-chevron-down" style={{ fontSize: 10, marginLeft: 5 }}></i>
                  </Link>
                  {/* Mega menu for Men */}
                  <div className="fs-mega-menu fs-dropdown-menu">
                    <div className="fs-mega-menu-column">
                      <h4 className="fs-dropdown-title">Men Leather Jacket</h4>
                      <Link to="/product">Biker Leather Jackets</Link>
                      <Link to="#">Bomber Leather Jackets</Link>
                      <Link to="#">Field Leather Jackets</Link>
                      <Link to="#">Trucker Leather Jackets</Link>
                      <Link to="#">Quilted Nylon Jackets</Link>
                    </div>
                    <div className="fs-mega-menu-column">
                      <h4 className="fs-dropdown-title">Colors</h4>
                      <Link to="#">Black</Link>
                      <Link to="#">Brown</Link>
                      <Link to="#">Tan</Link>
                      <Link to="#">Cognac</Link>
                    </div>
                    <div className="fs-mega-menu-column">
                      <h4 className="fs-dropdown-title">Bags & Purses</h4>
                      <Link to="#">Handbags</Link>
                      <Link to="#">Backpacks</Link>
                      <Link to="#">Wallets</Link>
                      <Link to="#">Clutches</Link>
                    </div>
                  </div>
                  {/* Mobile submenu (optional support) */}
                  <div className="fs-mobile-submenu">
                    <div className="fs-dropdown-title">Categories</div>
                    <Link to="#">Dresses</Link>
                    <Link to="#">Tops & Tees</Link>
                    <Link to="#">Sweaters</Link>
                    <Link to="#">Jeans</Link>
                    <Link to="#">Jackets</Link>
                    <div className="fs-dropdown-divider"></div>
                    <div className="fs-dropdown-title">Shop By</div>
                    <Link to="#">New Arrivals</Link>
                    <Link to="#">Best Sellers</Link>
                    <Link to="#">Sale</Link>
                  </div>
                </div>

                <div className="fs-nav-item">
                  <Link to="/women" className="fs-main-link">
                    Women <i className="fas fa-chevron-down" style={{ fontSize: 10, marginLeft: 5 }}></i>
                  </Link>
                  <div className="fs-mega-menu fs-dropdown-menu">
                    <div className="fs-mega-menu-column">
                      <h4 className="fs-dropdown-title">Categories</h4>
                      <Link to="/product">Biker Leather Jackets</Link>
                      <Link to="#">Bomber Leather Jackets</Link>
                      <Link to="#">Field Leather Jackets</Link>
                      <Link to="#">Trucker Leather Jackets</Link>
                      <Link to="#">Quilted Nylon Jackets</Link>
                    </div>
                    <div className="fs-mega-menu-column">
                      <h4 className="fs-dropdown-title">Colors</h4>
                      <Link to="#">Black</Link>
                      <Link to="#">Brown</Link>
                      <Link to="#">Tan</Link>
                      <Link to="#">Cognac</Link>
                    </div>
                  </div>
                  <div className="fs-mobile-submenu">
                    <div className="fs-dropdown-title">Categories</div>
                    <Link to="/product">Biker Leather Jackets</Link>
                    <Link to="#">Bomber Leather Jackets</Link>
                    <Link to="#">Field Leather Jackets</Link>
                    <Link to="#">Trucker Leather Jackets</Link>
                    <Link to="#">Quilted Nylon Jackets</Link>
                  </div>
                </div>

                <div className="fs-nav-item">
                  <Link to="#" className="fs-main-link">
                    New In <i className="fas fa-chevron-down" style={{ fontSize: 10, marginLeft: 5 }}></i>
                  </Link>
                  <div className="fs-mega-menu fs-dropdown-menu">
                    <div className="fs-mega-menu-column">
                      <h4 className="fs-dropdown-title">Bags & Purses</h4>
                      <Link to="#">Handbags</Link>
                      <Link to="#">Backpacks</Link>
                      <Link to="#">Wallets</Link>
                      <Link to="#">Clutches</Link>
                    </div>
                    <div className="fs-mega-menu-column">
                      <h4 className="fs-dropdown-title">Jewelry</h4>
                      <Link to="#">Necklaces</Link>
                      <Link to="#">Earrings</Link>
                      <Link to="#">Bracelets</Link>
                      <Link to="#">Watches</Link>
                    </div>
                    <div className="fs-mega-menu-column">
                      <h4 className="fs-dropdown-title">Sunglasses</h4>
                      <Link to="#">Aviator</Link>
                      <Link to="#">Wayfarer</Link>
                      <Link to="#">Round</Link>
                      <Link to="#">Sports</Link>
                    </div>
                  </div>
                  <div className="fs-mobile-submenu">
                    <div className="fs-dropdown-title">Bags & Purses</div>
                    <Link to="#">Handbags</Link>
                    <Link to="#">Backpacks</Link>
                    <Link to="#">Wallets</Link>
                    <Link to="#">Clutches</Link>
                    <div className="fs-dropdown-title">Jewelry</div>
                    <Link to="#">Necklaces</Link>
                    <Link to="#">Earrings</Link>
                    <Link to="#">Bracelets</Link>
                    <Link to="#">Watches</Link>
                    <div className="fs-dropdown-title">Sunglasses</div>
                    <Link to="#">Aviator</Link>
                    <Link to="#">Wayfarer</Link>
                    <Link to="#">Round</Link>
                    <Link to="#">Sports</Link>
                  </div>
                </div>

                <div className="fs-nav-item">
                  <Link to="#" className="fs-main-link">Brand <i className="fas fa-chevron-down" style={{ fontSize: 10, marginLeft: 5 }}></i></Link>
                  <div className="fs-dropdown-menu">
                    <Link to="/about">About us</Link>
                    <Link to="/contact-us">Contact us</Link>
                    <Link to="/return-exchange">Return & Exchange</Link>
                  </div>
                  <div className="fs-mobile-submenu">
                    <Link to="/about">About us</Link>
                    <Link to="/contact-us">Contact us</Link>
                    <Link to="/return-exchange">Return & Exchange</Link>
                  </div>
                </div>

                <div className="fs-nav-item">
                  <Link to="#" className="fs-main-link">Help <i className="fas fa-chevron-down" style={{ fontSize: 10, marginLeft: 5 }}></i></Link>
                  <div className="fs-dropdown-menu">
                    <Link to="/contact-us">Contact us</Link>
                    <Link to="/return-exchange">Return & Exchange</Link>
                  </div>
                  <div className="fs-mobile-submenu">
                    <Link to="/contact-us">Contact us</Link>
                    <Link to="/return-exchange">Return & Exchange</Link>
                  </div>
                </div>
              </div>
            </nav>

            {/* Header Actions */}
            <div className="fs-header-actions">
              {/* Mobile Search Button */}
              <button
                className="fs-mobile-search-btn"
                onClick={toggleSearch}
                aria-label="Toggle search"
              >
                <i className="fas fa-search"></i>
              </button>

              {/* Search Bar */}
              <div className={`fs-search-bar ${searchOpen ? 'mobile-open' : ''}`}>
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search..."
                  className={searchOpen ? 'mobile-open' : ''}
                />
                {searchOpen && (
                  <button
                    className="fs-close-search"
                    onClick={() => setSearchOpen(false)}
                    aria-label="Close search"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>

              {/* User Dropdown */}
              <div className="fs-nav-item">
                <Link to="#" className="fs-main-link">
                  <i className="far fa-user"></i>
                </Link>
                {/* ... keep your existing dropdown menu ... */}
              </div>

              {/* Cart */}
              <Link onClick={() => openCart()} className="fs-cart-link">
                <i className="fas fa-shopping-bag"></i>
                <span className="fs-cart-count">0</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fs-mobile-menu-overlay"
            onClick={toggleMobileMenu}
          ></div>
        )}
      </header>

      {/* Toast Notification */}
      <div id="toast"></div>
    </>
  );
}