import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import productsData from '../data/products.json';
import './Cart.css';

export default function CartSidebar() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const alreadyStored = localStorage.getItem('products');
    if (!alreadyStored) {
      localStorage.setItem('products', JSON.stringify(productsData));
    }

    const storedProducts = JSON.parse(localStorage.getItem('products')) || [];
    const cartIds = JSON.parse(localStorage.getItem('cartsItems')) || [];

    const updatedCart = cartIds
      .map(item => {
        const product = storedProducts.find(p => p.id === item.id);
        return product ? { ...product, quantity: item.quantity || 1, size: item.size } : null;
      })
      .filter(Boolean);

    setCartItems(updatedCart);
  }, []);

  const refreshCart = () => {
    const storedProducts = JSON.parse(localStorage.getItem('products')) || [];
    const cartIds = JSON.parse(localStorage.getItem('cartsItems')) || [];

    const updatedCart = cartIds
      .map(item => {
        const product = storedProducts.find(p => p.id === item.id);
        return product ? { ...product, quantity: item.quantity || 1, size: item.size } : null;
      })
      .filter(Boolean);

    setCartItems(updatedCart);
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantityInStorage(id, newQuantity);
    refreshCart(); // Re-render without page reload
  };

  const handleRemoveItem = (id) => {
    removeItemFromStorage(id);
    refreshCart(); // Re-render without page reload
  };


  const subtotal = cartItems.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
  );

  return (
    <>
      <div id="cartSidebarOverlay" className="cart-sidebar-overlay d-none" onClick={() => closeCart()}></div>

      <div id="cartSidebar" className="cart-sidebar d-flex flex-column">
        {/* Header */}
        <div className="cart-header d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 className="mb-0">Your Cart</h5>
          <button className="btn-close" onClick={() => closeCart()}></button>
        </div>

        {/* Scrollable Area */}
        <div className="cart-scroll-area flex-grow-1 overflow-auto">
          <div className="cart-body p-3" id="cart-items">
            {cartItems.length === 0 ? (
              <div className="text-center py-3">
                <i className="fas fa-shopping-cart fa-3x mb-3 text-muted"></i>
                <h3>Your cart is empty</h3>
                <p className="text-muted">Add some items to your cart to continue shopping</p>
                <center>
                  <Link to="/" className="btn text-center py-md-2" style={{ backgroundColor: '#3E2C1C', color: '#fff', width: '75%' }}>
                    Continue Shopping
                  </Link>
                </center>
              </div>
            ) : (
              cartItems.map(product => (
                <div key={product.id} className="d-flex align-items-start mb-3 gap-3">
                  <div>
                    <img src={product.image} alt={product.title} className="img-fluid" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{product.title}</strong><br />
                        <small className="text-muted">${product.price.toFixed(2)}</small><br />
                        <small>Size: {product.size}</small>
                      </div>
                      <button className="btn text-danger ms-2" onClick={() => handleRemoveItem(product.id)} aria-label="Remove item">
                        <i className="fas fa-trash-alt me-1"></i>
                      </button>
                    </div>
                    <div className="d-flex align-items-center gap-3 flex-wrap mt-2">
                      <div className="d-flex align-items-center shadow-sm border border-secondary bg-white px-1" style={{ height: '38px' }}>
                        <button className="btn btn-sm btn-outline-secondary border-0 bg-light d-flex align-items-center justify-content-center p-1 quantity-btn" onClick={() => handleUpdateQuantity(product.id, product.quantity - 1)} aria-label="Decrease quantity" style={{ width: '32px', height: '32px' }}>
                          <i className="fas fa-minus"></i>
                        </button>
                        <span className="text-center fw-semibold mx-1" style={{ minWidth: '28px' }}>{product.quantity}</span>
                        <button className="btn btn-sm btn-outline-secondary border-0 bg-light d-flex align-items-center justify-content-center p-1 quantity-btn" onClick={() => handleUpdateQuantity(product.id, product.quantity + 1)} aria-label="Increase quantity" style={{ width: '32px', height: '32px' }}>
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* More From Us */}
          <div className="more-from-us p-3 border-top">
            <h5 className="mb-3">Explore More:</h5>
            <div className="cart-product-slider">
              <button className="nav-btn prev-btn">
                <i className="fas fa-chevron-left"></i>
              </button>
              <div className="cart-slider-container">
                <div className="cart-slider-track" id="sliderTrack"></div>
              </div>
              <button className="nav-btn nexts-btn">
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="cart-footer border-top shadow-sm bg-white px-3 py-3 py-md-2">
          <div className="d-flex justify-content-between mb-3 mb-md-2">
            <span className="fw-semibold fs-5 text-dark">Subtotal:</span>
            <strong id="cartSubtotal" className="fs-5 text-dark">${subtotal.toFixed(2)}</strong>
          </div>
          <button onClick={() => navigate('/Checkout')}
            className="btn w-100 py-3" style={{ backgroundColor: '#de7921', borderRadius: 0, fontSize: '1.1rem' }}>
            Checkot
          </button>
          <button onClick={() => navigate('/Checkout')}
            className="btn w-100 py-2 mt-2" style={{ backgroundColor: '#2b2a2a', color: '#fff' }}
          >
            <i className="fa fa-credit-card" aria-hidden="true"></i> Pay with Stripe
          </button>

          <div className="text-center mt-3">
            <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" style={{ height: '20px' }} />
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" alt="MasterCard" style={{ height: '20px' }} />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" style={{ height: '20px' }} />
            </div>
            <div className="text-center mt-3">
              <i className="fas fa-lock" style={{ color: 'green', fontSize: '1.3rem' }}></i>
              <span className="ms-2 text-muted">SSL Secured Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function openCart() {
  document.getElementById("cartSidebar").classList.add("open");
  document.getElementById("cartSidebarOverlay").classList.remove("d-none");
  initializeSlider();
}

export function closeCart() {
  document.getElementById("cartSidebar").classList.remove("open");
  document.getElementById("cartSidebarOverlay").classList.add("d-none");
}

export function updateQuantityInStorage(id, newQuantity) {
  let cartItems = JSON.parse(localStorage.getItem('cartsItems')) || [];

  cartItems = cartItems.map(item =>
    item.id === id ? { ...item, quantity: newQuantity } : item
  );

  localStorage.setItem('cartsItems', JSON.stringify(cartItems));
}


export function removeItemFromStorage(id) {
  let cartItemIds = JSON.parse(localStorage.getItem('cartsItems')) || [];
  cartItemIds = cartItemIds.filter(item => item.id !== id);
  localStorage.setItem('cartsItems', JSON.stringify(cartItemIds));
}


export function initializeSlider() {
  const track = document.getElementById('sliderTrack');
  const products = JSON.parse(localStorage.getItem('products')) || [];

  track.innerHTML = '';

  const shuffled = products.sort(() => 0.5 - Math.random());
  const selectedProducts = shuffled.slice(0, 8);

  selectedProducts.forEach(product => {
    const card = document.createElement('div');
    card.className = 'cart-product-card';
    card.innerHTML = `
      <a style="text-decoration: none; color: inherit;" href="/products-details?id=${product.id}">
        <img src="${product.image}" alt="${product.title}" class="product-img">
        <div class="cart-product-info">
          <p class="cart-product-title">${product.title}</p>
          <div class="cart-product-price">$${product.price}</div>
        </div>
      </a>`;
    track.appendChild(card);
  });

  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.nexts-btn');
  let position = 0;

  function slide(direction) {
    const cardWidth = document.querySelector('.cart-product-card').offsetWidth + 10;
    const visibleCards = Math.floor(track.parentElement.offsetWidth / cardWidth);
    const maxPosition = (selectedProducts.length - visibleCards) * cardWidth;

    if (direction === 'next' && position > -maxPosition) {
      position -= cardWidth;
    } else if (direction === 'prev' && position < 0) {
      position += cardWidth;
    }

    track.style.transform = `translateX(${position}px)`;
  }

  prevBtn.addEventListener('click', () => slide('prev'));
  nextBtn.addEventListener('click', () => slide('next'));
}

export function cart() {
  setTimeout(() => {
    openCart();
  }, 500);
}