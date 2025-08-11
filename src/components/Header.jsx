import './Header.css';
import React, { useContext, useState, useEffect, useRef } from 'react';
import { openCart } from './Cart';
import { Link } from 'react-router-dom';
import { AuthContext } from './auth/AuthProvider';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const navRef = useRef();
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const handleMainLinkClick = (index, hasSubmenu, e) => {
    if (window.innerWidth <= 992 && hasSubmenu) {
      e.preventDefault();
      setActiveSubmenu(prev => (prev === index ? null : index));
    }
  };

  const handleDocumentClick = (e) => {
    if (
      navRef.current &&
      !navRef.current.contains(e.target) &&
      !e.target.closest('.fs-mobile-menu-btn')
    ) {
      setIsMobileMenuOpen(false);
      setActiveSubmenu(null);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);
  // {console.log('Mobile open?', isMobileMenuOpen)}

  return (
    <>
      <header className="fs-header-container">
        <div className="fs-header-content">
          <div
            className="fs-announcement-bar"
            data-aos="fade-down"
            data-aos-duration="500"
          >
            Summer Sale! Up to 50% off{' '}
            <Link to="/product">Shop Now</Link>
          </div>

          <div className="fs-main-header">
            <div className={`${isMobileMenuOpen ? '' : 'mobile-header-content'}`}>
            <Link to="/" ><img className="fs-logo" src='https://res.cloudinary.com/dekf5dyng/image/upload/v1752742536/official_tmj_logo_jygsft.png'></img></Link>
            <button className="fs-mobile-menu-btn" onClick={toggleMobileMenu}>
              <i className={`fas ${isMobileMenuOpen ? '' : 'fa-bars'}`}></i>
            </button>
            </div>
            <nav className="fs-nav-container">
              <nav ref={navRef} className={`fs-nav-links ${isMobileMenuOpen ? 'fs-mobile-active' : ''}`}>
                 <button className="fs-mobile-menu-btn" onClick={toggleMobileMenu}>
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : ''}`}></i>
            </button>
                <div className="fs-nav-item">
                  <Link to="#" className="fs-main-link">Best Seller</Link>
                </div>

                <div className="fs-nav-item">
                  <Link to="/men"
                    className="fs-main-link"
                    onClick={(e) => handleMainLinkClick(0, true, e)}>
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
                  <div className={`fs-mobile-submenu ${activeSubmenu === 0 ? 'fs-active' : ''}`}>
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
                  <Link to="/women" className="fs-main-link" onClick={(e) => handleMainLinkClick(1, true, e)} >
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
                  <div className={`fs-mobile-submenu ${activeSubmenu === 1 ? 'fs-active' : ''}`}>
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
              </nav>
            </nav>

            <div className={`${isMobileMenuOpen ? 'd-none' : 'fs-header-actions '}`}>
              {/* Search Bar */}
              <div className="fs-search-bar">
                <i className="fas fa-search"></i>
                <input type="text" placeholder="Search..." />
              </div>

              {/* User Dropdown */}
              <div className="fs-nav-item">
                <Link to="#" className="fs-main-link">
                  <i className="far fa-user"></i>
                </Link>

                {/* Dropdown Menu */}
                <div className="fs-dropdown-menu-user">
                  {user ? (
                    <>
                      <Link to="/dashboard" className="fs-dropdown-link">
                        <i className="fas fa-user-circle"></i> My Account
                      </Link>
                      <Link to="/orders" className="fs-dropdown-link">
                        <i className="fas fa-box-open"></i> My Orders
                      </Link>
                      <Link to="/wishlist" className="fs-dropdown-link">
                        <i className="fas fa-heart"></i> Wishlist
                      </Link>
                      <button
                        onClick={logout}
                        className="fs-dropdown-link logout-header"
                      >
                        <i className="fas fa-sign-out-alt"></i> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/auth/login" className="fs-dropdown-link-user">
                        <i className="fas fa-sign-in-alt"></i> Login
                      </Link>
                      <Link to="/auth/signup" className="fs-dropdown-link-user">
                        <i className="fas fa-user-plus"></i> Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Cart */}
              <Link onClick={() => openCart()} className="fs-cart-link">
                <i className="fas fa-shopping-bag"></i>
                <span className="fs-cart-count">0</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Toast (optional dynamic alerts) */}
      <div
        id="toast"
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          padding: '10px 20px',
          backgroundColor: '#272727',
          color: 'white',
          borderRadius: 5,
          display: 'none',
          zIndex: 9999
        }}
      ></div>
    </>
  );
}