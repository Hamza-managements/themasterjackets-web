import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify'
import "./styles/Cart.css";

export default function CartSidebar() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [showToastContainer, setShowToastContainer] = useState(false)

  useEffect(() => {
    const loadCart = () => {
      const storedCart = JSON.parse(localStorage.getItem("cartsItems")) || [];
      setCartItems(storedCart);
    };

    loadCart();

    const handleCartUpdate = () => loadCart();
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);


  const updateCart = (newCart) => {
    localStorage.setItem("cartsItems", JSON.stringify(newCart));
    setCartItems(newCart);
  };

  const handleUpdateQuantity = (variationId, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = cartItems.map((item) =>
      item.variationId === variationId
        ? { ...item, quantity: newQuantity }
        : item
    );

    updateCart(updatedCart);
    window.dispatchEvent(new Event("cartUpdated"));
    setShowToastContainer(true);
    toast.info("Quantity updated");
  };

  // ✅ Remove Item
  const handleRemoveItem = (variationId) => {
    const updatedCart = cartItems.filter(
      (item) => item.variationId !== variationId
    );

    updateCart(updatedCart);
    window.dispatchEvent(new Event("cartUpdated"));
    setShowToastContainer(true);
    toast.warn("Item removed from cart");
  };

  // ✅ Calculate subtotal and total quantity
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // ✅ Empty cart message
  const EmptyCart = () => (
    <div className="text-center py-4">
      <i className="fas fa-shopping-cart fa-3x mb-3 text-muted"></i>
      <h5>Your cart is empty</h5>
      <p className="text-muted mb-4">Add some items to continue shopping.</p>
      <Link
        to="/"
        className="btn btn-dark px-4"
        style={{ backgroundColor: "#3E2C1C", color: "#fff" }}
      >
        Continue Shopping
      </Link>
    </div>
  );

  return (
    <>
      {/* Overlay */}
      <div
        id="cartSidebarOverlay"
        className="cart-sidebar-overlay d-none"
        onClick={() => closeCart()}
      ></div>

      {/* Sidebar */}
      <div id="cartSidebar" className="cart-sidebar d-flex flex-column">
        {/* Header */}
        <div className="cart-header d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
          <h5 className="mb-0">Your Cart ({totalItems})</h5>
          <button className="btn-close" onClick={() => closeCart()}></button>
        </div>

        {/* Body */}
        <div className="cart-scroll-area flex-grow-1 overflow-auto p-3">
          {cartItems.length === 0 ? (
            <EmptyCart />
          ) : (
            cartItems.map((product) => (
              <div
                key={product.variationId}
                className="d-flex align-items-start mb-3 border-bottom pb-3"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="img-fluid rounded"
                  style={{
                    width: "90px",
                    height: "100px",
                    objectFit: "contain",
                  }}
                />
                <div className="flex-grow-1 ms-3">
                  <div className="d-flex justify-content-between">
                    <div>
                      <strong>{product.name}</strong>
                      <div className="text-muted small">
                        {product.variation}
                      </div>
                      <div className="text-muted small">
                        Size: {product.size}
                      </div>
                      <div className="fw-bold mt-1">
                        ${product.price.toFixed(2)}
                      </div>
                    </div>
                    <button
                      className="btn text-danger"
                      onClick={() => handleRemoveItem(product.variationId)}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>

                  {/* Quantity */}
                  <div className="d-flex align-items-center mt-2">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() =>
                        handleUpdateQuantity(
                          product.variationId,
                          product.quantity - 1
                        )
                      }
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <span className="mx-2">{product.quantity}</span>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() =>
                        handleUpdateQuantity(
                          product.variationId,
                          product.quantity + 1
                        )
                      }
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          {showToastContainer && (
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnHover
            draggable
            theme="dark"
            onClose={() => setShowToastContainer(false)}
          />
        )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="cart-footer border-top bg-white p-3">
            <div className="d-flex justify-content-between mb-3">
              <span className="fw-semibold fs-5 text-dark">Subtotal:</span>
              <strong className="fs-5 text-dark">
                ${subtotal.toFixed(2)}
              </strong>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="btn w-100 py-2"
              style={{
                backgroundColor: "#de7921",
                borderRadius: 0,
                fontSize: "1rem",
              }}
            >
              Proceed to Checkout
            </button>

            <button
              onClick={() => navigate("/checkout")}
              className="btn w-100 py-2 mt-2"
              style={{
                backgroundColor: "#2b2a2a",
                color: "#fff",
                borderRadius: 0,
              }}
            >
              <i className="fa fa-credit-card me-2"></i> Pay with Stripe
            </button>

            <div className="text-center d-flex justify-content-center mt-3">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
                alt="Visa"
                style={{ height: "20px", marginRight: "8px" }}
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
                alt="Mastercard"
                style={{ height: "20px", marginRight: "8px" }}
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                alt="PayPal"
                style={{ height: "20px" }}
              />
            </div>
            <div className="mt-2 text-muted d-flex justify-content-center small">
              <i className="fas fa-lock text-success me-1"></i> SSL Secured
              Checkout
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ==========================
   Sidebar Open/Close Helpers
=========================== */
export function openCart() {
  document.getElementById("cartSidebar").classList.add("open");
  document.getElementById("cartSidebarOverlay").classList.remove("d-none");
}

export function closeCart() {
  document.getElementById("cartSidebar").classList.remove("open");
  document.getElementById("cartSidebarOverlay").classList.add("d-none");
}
