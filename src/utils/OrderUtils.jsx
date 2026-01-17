// Order APIs ////////////////////////////
import axios from 'axios';
const api = axios.create({
    baseURL: 'https://themasterjacketsbackend-production.up.railway.app',
});

export async function createNewOrder(payload) {
    try {
        const response = await api.post("/api/order/place-order", payload);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function getUserOrderById(uid) {
    try {
        const response = await api.get(`/api/order/get-orders-by/${uid}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user orders:", error);
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
        const response = await api.put(`/api/order/complete/${uid}?orderId=${orderId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}