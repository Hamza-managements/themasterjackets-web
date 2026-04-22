// Order APIs ////////////////////////////
import axios from 'axios';
const api = axios.create({
    // baseURL: process.env.REACT_APP_BACKEND_URL,
  baseURL: "https://the-master-jackets-b881387dd0c5.herokuapp.com",
});

export async function createNewOrder(payload) {
    try {
        const response = await api.post("/api/order/place-order", payload);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function createStripeIntent(payload) {
    const { userDetails, items, shippingAddress } = payload;
    try {
        const response = await api.post("/api/payment/create-payment-intent", {
            userDetails,
            items,
            shippingAddress
        });
        return response;
    } catch (error) {
        throw error;
    }
}

export async function orderPaymentConfirm(paymentId, intentId) {
    try {
        const response = await api.post("/api/payment/confirm-payment", { paymentId, intentId });
        return response;
    } catch (error) {
        throw error;
    }
}

export const createCheckoutSession = async (data) => {
  try {
    const response = await api.post(
      "/api/payment/create-checkout-session",
      {
        userDetails: data.userDetails,
        items: data.items,
        shippingAddress: data.shippingAddress,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Stripe Session Error:", error.response?.data || error.message);
    throw error;
  }
};

export async function getUserOrderById(uid) {
    try {
        const response = await api.get(`/api/order/get-orders-by?uid=${uid}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user orders:", error);
        throw error;
    }
}

export async function getGuestOrderById(email) {
    try {
        const response = await api.get(`/api/order/get-orders-by?email=${email}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching guest orders:", error);
        throw error;
    }
}

export async function GetAllOrder(uid) {
    try {
        api.interceptors.request.use((config) => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
        const response = await api.get(`/api/order/get-all-orders/${uid}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching all orders:", error);
        throw error;
    }
}

export async function cancelOrderWithId(uid, orderId) {
    try {
        api.interceptors.request.use((config) => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
        const response = await api.put(`/api/order/cancel-order/${uid}?orderId=${orderId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting order:", error);
        throw error;
    }
}

export async function confirmOrderWithOrderId(uid, orderId) {
    try {
        api.interceptors.request.use((config) => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
        const response = await api.put(`/api/order/confirm-order/${uid}?orderId=${orderId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function updateShipmentWithOrderId(uid, updatedData) {
    try {
        api.interceptors.request.use((config) => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
        const response = await api.put(`/api/order/ship/${uid}`, updatedData);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function completeOrderWithOrderId(uid, orderId) {
    try {
        api.interceptors.request.use((config) => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
        const response = await api.put(`/api/order/complete/${orderId}/${uid}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function updateTrackingNumberWithOrderId(uid, updatedData) {
    try {
        api.interceptors.request.use((config) => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
        const response = await api.put(`/api/order/update-tracking/${uid}`, updatedData);
        return response.data;
    } catch (error) {
        throw error;
    }
}