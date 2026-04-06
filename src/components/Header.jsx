import './styles/Header.css';
import { useContext, useState, useEffect, useRef } from 'react';
import { openCart } from './Cart';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fetchCategoriesAll } from '../utils/CartUtils';
import { useProducts } from '../context/ProductContext';
import Aos from 'aos';
import { useCart } from '../context/CartContext';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [categories, setCategories] = useState([]);
  const navRef = useRef();
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  useEffect(() => {
    Aos.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic'
    });

    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await fetchCategoriesAll();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const [input, setInput] = useState("");
  const { handleGlobalSearch } = useProducts();
  const navigate = useNavigate();

  const handleSearch = () => {
    handleGlobalSearch(input);
    navigate("/search");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
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
            <Link to="/products/men/all">Shop Now</Link>
          </div>

          <div className="fs-main-header">
            <div className={`${isMobileMenuOpen ? '' : 'mobile-header-content'}`}>
              <Link onClick={() => openCart()} className={`fs-cart-link-mobile ${isMobileMenuOpen ? '' : ''}`}>
                <i className="fas fa-shopping-bag"></i>
                {cartItems?.items?.length > 0 &&
                  <span className="fs-cart-count">{cartItems?.items?.length}</span>
                }
              </Link>
              <button className="fs-mobile-menu-btn" onClick={toggleMobileMenu}>
                <i className={`fas ${isMobileMenuOpen ? '' : 'fa-bars'}`}></i>
              </button>
              <Link to="/" ><img className="fs-logo" alt='TheMasterJacketsLOGO' src='https://res.cloudinary.com/dvmpyh0hj/image/upload/v1760615184/hilkmru9zutcneybpwwc.png'></img></Link>
            </div>
            <nav className="fs-nav-container">
              <nav ref={navRef} className={`fs-nav-links ${isMobileMenuOpen ? 'fs-mobile-active' : ''}`}>
                <div className={`${isMobileMenuOpen ? 'fs-mobile-header-active' : 'd-none'}`}>
                  <Link to="/" ><img className="fs-logo" alt='TheMasterJacketsLOGO' src='https://res.cloudinary.com/dvmpyh0hj/image/upload/v1760615184/hilkmru9zutcneybpwwc.png'></img></Link>
                  <button className="fs-mobile-menu-btn" onClick={toggleMobileMenu}>
                    <i className={`fas ${isMobileMenuOpen ? 'fa-times' : ''}`}></i>
                  </button>
                </div>
                <div className="fs-nav-item">
                  <Link to="/products/men/new-arrivals" className={`${isMobileMenuOpen ? 'fs-main-link mobile-divider' : 'fs-main-link'}`} onClick={() => setIsMobileMenuOpen(false)}>New IN<i className="fas fa-chevron-down" style={{ fontSize: 10, marginLeft: 5 }}></i> </Link>
                  <div className="fs-mega-menu fs-dropdown-menu">
                    <div className="fs-mega-menu-column">
                      <h4 className="fs-dropdown-title">New Arrivals</h4>
                      <Link to="/products/men/new-arrivals">New In Men</Link>
                      <Link to="/products/women/new-arrivals">New In Women</Link>
                    </div>
                  </div>
                  <div className={`fs-mobile-submenu ${activeSubmenu === 4 ? 'fs-active' : ''}`}>
                    <div className="fs-dropdown-title">New Arrivals</div>
                    <Link to="/products/men/new-arrivals">Men</Link>
                    <Link to="/products/women/new-arrivals">Women</Link>
                  </div>
                </div>
                {categories
                  ?.filter(category =>
                    ["Men", "Women", "Halloween"].includes(category.mainCategoryName)
                  )
                  .map((cat, index) =>
                    <div className="fs-nav-item" key={cat._id}>
                      <Link to={`/category/${cat.slug}`} className={`${isMobileMenuOpen ? 'fs-main-link mobile-divider' : 'fs-main-link'}`} onClick={(e) => handleMainLinkClick(index, true, e)} >{cat.mainCategoryName} <i className="fas fa-chevron-down" style={{ fontSize: 10, marginLeft: 5 }}></i></Link>
                      <div className="fs-mega-menu fs-dropdown-menu">
                        <div className="fs-mega-menu-column">
                          <h4 className="fs-dropdown-title">{cat.mainCategoryName} Leather Jacket</h4>
                          <Link to={`/products/${cat.slug}/all`}>View All</Link>
                          {cat.subCategories?.map((sub) => (
                            <Link key={sub._id} to={`/products/${cat.slug}/${sub.slug}`}>{sub.categoryName}</Link>
                          ))}
                        </div>
                        <div className="fs-mega-menu-column">
                          <h4 className="fs-dropdown-title">Colors</h4>
                          <Link to={`/products/${cat.slug}/all?color=black`}>Black</Link>
                          <Link to={`/products/${cat.slug}/all?color=brown`}>Brown</Link>
                          <Link to={`/products/${cat.slug}/all?color=washed up`}>Washed Up</Link>
                          <Link to={`/products/${cat.slug}/all?color=cognac`}>Cognac</Link>
                        </div>
                      </div>
                      <div className={`fs-mobile-submenu ${activeSubmenu === index ? 'fs-active' : ''}`}>
                        <div className="fs-dropdown-title">Categories</div>
                        <Link to={`/products/${cat.slug}/all`} onClick={() => setIsMobileMenuOpen(false)}>View All</Link>
                        {cat.subCategories?.map((sub) => (
                          <Link key={sub._id} to={`/products/${cat.slug}/${sub.slug}`} onClick={() => setIsMobileMenuOpen(false)}>{sub.categoryName}</Link>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="fs-nav-item">
                  <Link to="/about" className={`${isMobileMenuOpen ? 'fs-main-link mobile-divider' : 'fs-main-link'}`} onClick={(e) => handleMainLinkClick(3, true, e)}>Brand <i className="fas fa-chevron-down" style={{ fontSize: 10, marginLeft: 5 }}></i></Link>
                  <div className="fs-dropdown-menu">
                    <Link to="/about">About us</Link>
                    <Link to="/contact-us">Contact us</Link>
                    <Link to="/return-exchange">Return & Exchange</Link>
                  </div>
                  <div className={`fs-mobile-submenu ${activeSubmenu === 3 ? 'fs-active' : ''}`}>
                    <Link onClick={() => setIsMobileMenuOpen(false)} to="/about">About us</Link>
                    <Link onClick={() => setIsMobileMenuOpen(false)} to="/contact-us">Contact us</Link>
                    <Link onClick={() => setIsMobileMenuOpen(false)} to="/return-exchange">Return & Exchange</Link>
                  </div>
                </div>
                <div className={`${isMobileMenuOpen ? 'fs-mobile-bottom-info' : 'd-none'}`}>
                  <div className="fs-mobile-info-item">
                    <i className="fa-solid fa-shield-halved"></i>
                    <span>Free Insured Shipping</span>
                  </div>

                  <div className="fs-mobile-info-item">
                    <i className="fa-solid fa-box-open"></i>
                    <span>Track Your Order</span>
                  </div>

                  <div className="fs-mobile-info-item">
                    <i className="fa-solid fa-headset"></i>
                    <span>Talk To Support</span>
                  </div>

                  <div className="fs-mobile-info-item">
                    <i className="fa-solid fa-circle-info"></i>
                    <span>FAQs & Help Center</span>
                  </div>
                </div>
              </nav>
            </nav>

            <div className={`${isMobileMenuOpen ? 'd-none' : 'fs-header-actions'}`}>
              {/* Search Bar */}
              <div className="fs-search-bar">
                <i
                  className="fas fa-search"
                  onClick={handleSearch}
                  style={{ cursor: "pointer" }}
                ></i>
                <input
                  type="text"
                  placeholder="Search..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
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
                      {
                        user.role === "admin" ? (
                          <>
                            <Link
                              to="/admin/dashboard"
                              className="fs-dropdown-link-admin"
                            >
                              <i className="fas fa-user-circle"></i>{" "} Admin Panel
                            </Link>
                            <Link
                              to="/admin/manage-all-products"
                              className="fs-dropdown-link-admin"
                            >
                              <i className="fas fa-tools"></i> Manage Products
                            </Link>
                            <Link
                              to="/admin/dashboard?orders"
                              className="fs-dropdown-link-admin"
                            >
                              <i className="fas fa-gear"></i> Manage Orders
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              to="/dashboard"
                              className="fs-dropdown-link"
                            >
                              <i className="fas fa-user-circle"></i> My Account
                            </Link>
                            <Link target="_blank" to="/dashboard?orders" className="fs-dropdown-link">
                              {/* /dashboard?orders pending */}
                              <i className="fas fa-box-open"></i> My Orders
                            </Link>
                            {/* <Link target="_blank" to="/wishlist" className="fs-dropdown-link">
                              <i className="fas fa-heart"></i> 
                            </Link> */}
                          </>
                        )}
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
              <Link onClick={() => openCart()} className={`${isMobileMenuOpen ? 'd-none' : 'fs-cart-link'}`}>
                <i className="fas fa-shopping-bag"></i>
                {cartItems?.items?.length > 0 &&
                  <span className="fs-cart-count">{cartItems?.items?.length}</span>
                }
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