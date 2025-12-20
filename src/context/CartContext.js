// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import {
    getGuestId,
    getCartItems,
    removeCartItem,
    deleteAllCartItems,
    updateCartItemQuantity
} from "../utils/CartUtils";
import { AuthContext } from "../components/auth/AuthProvider";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { user } = useContext(AuthContext);

    const userId = user?.uid || null;
    const [guestId, setGuestId] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    console.log("Cart Items in Context:", cartItems);
    const [loading, setLoading] = useState(false);

    const cartOwnerId = userId ?? guestId;
    const isGuest = !user?.uid;

    // ✅ Fetch guest ID ONLY if not logged in
    useEffect(() => {
        if (!userId && !guestId) {
            getGuestId()
                .then(res => setGuestId(res?.guestId || res))
                .catch(err => console.error("Guest ID error:", err));
        }

        if (userId) {
            setGuestId(null);
        }
    }, [userId]);

    // ✅ Load cart when owner changes
    useEffect(() => {
        if (!cartOwnerId) return;

        setLoading(true);
        getCartItems(cartOwnerId)
            .then(res => setCartItems(res || []))
            .catch(err => console.error("Cart fetch error:", err))
            .finally(() => setLoading(false));
    }, [cartOwnerId]);

    // ───────────────── ACTIONS ─────────────────
    useEffect(() => {
        console.log("🔐 AUTH CHANGED");
        console.log("user:", user?.uid || null);
        console.log("guestId:", guestId);
        console.log("👉 SENDING ID:", cartOwnerId);
    }, [user, guestId]);

    const refreshCart = async () => {
        if (!cartOwnerId) return;

        console.log("🛒 FETCH CART");
        console.log("👉 user:", user?.uid || null);
        console.log("👉 guestId:", guestId);
        console.log("👉 SENDING ID:", cartOwnerId);

        const res = await getCartItems(cartOwnerId, isGuest);
        console.log("⬅️ CART RESPONSE:", res);

        setCartItems(res || []);
    };

    // const refreshCart = async () => {
    //     if (!cartOwnerId) return;
    //     const res = await getCartItems(cartOwnerId, isGuest);
    //     setCartItems(res || []);
    // };

    const handleRemoveCartItem = async (cartId, itemId) => {
        await removeCartItem(cartId, itemId);
        await refreshCart();
    };

    const handleDeleteAllCartItems = async (cartId) => {
        await deleteAllCartItems(cartId);
    };

    const handleQuantityChange = async (updateData) => {
        await updateCartItemQuantity(updateData);
        await refreshCart();
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                setCartItems,
                cartOwnerId,
                userId,
                guestId,
                loading,
                refreshCart,
                handleRemoveCartItem,
                handleDeleteAllCartItems,
                handleQuantityChange
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside CartProvider");
    return ctx;
};
