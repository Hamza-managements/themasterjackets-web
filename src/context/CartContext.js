// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import {
    getGuestId,
    getCartItems,
    removeCartItem,
    deleteAllCartItems,
    updateCartItemQuantity
} from "../utils/CartUtils";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "../components/auth/AuthProvider";

const CartContext = createContext(null);

const GUEST_ID_KEY = "tmj_guest_id";

export const CartProvider = ({ children }) => {
    const { user } = useContext(AuthContext);

    const userId = user?.uid ?? null;
    const isGuest = !userId;

    const [guestId, setGuestId] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const cartOwnerId = userId || guestId;

    /* ─────────── GUEST ID RESOLUTION (ONCE) ─────────── */
    useEffect(() => {
        if (userId) {
            // User logged in → guest no longer active
            setGuestId(null);
            return;
        }

        let storedGuestId = localStorage.getItem(GUEST_ID_KEY);

        if (!storedGuestId) {
            storedGuestId = uuidv4();
            localStorage.setItem(GUEST_ID_KEY, storedGuestId);

            // Optional: tell backend a guest exists
            getGuestId(storedGuestId).catch(err =>
                console.error("Guest init failed:", err)
            );
        }

        setGuestId(storedGuestId);
    }, [userId]);

    /* ─────────── FETCH CART WHEN ID READY ─────────── */
    useEffect(() => {
        if (!cartOwnerId) return;

        const fetchCart = async () => {
            setLoading(true);
            try {
                const res = await getCartItems(cartOwnerId, isGuest);
                setCartItems(res || []);
            } catch (err) {
                console.error("Cart fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [cartOwnerId]);

    /* ─────────── CART ACTIONS ─────────── */
    const refreshCart = async () => {
        if (!cartOwnerId) return;
        const res = await getCartItems(cartOwnerId, isGuest);
        setCartItems(res || []);
    };

    const handleRemoveCartItem = async (cartId, itemId) => {
        await removeCartItem(cartId, itemId, guestId);
        await refreshCart();
    };

    const handleDeleteAllCartItems = async (cartId) => {
        await deleteAllCartItems(cartId, guestId);
        setCartItems([]);
    };

    const handleQuantityChange = async (updateData) => {
        await updateCartItemQuantity(updateData, guestId);
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
                isGuest,
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
