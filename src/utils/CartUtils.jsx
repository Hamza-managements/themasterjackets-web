import axios from 'axios';

export function getCartItems() {
  return JSON.parse(localStorage.getItem('cartsItems')) || [];
}

export function updateCartCount(setCount) {
  const items = getCartItems();
  setCount(items.length);
}
//////////////////////////// Category fetching with token handling ////////////////////////////
export async function fetchCategoriesAll() {
  try {
    const api = axios.create({
      baseURL: 'https://themasterjacketsbackend-production.up.railway.app',
    });
    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      });
      const response = await api.get('/api/category/fetch-all');
      return response.data.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  } 
}
