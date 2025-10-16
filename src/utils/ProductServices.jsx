import axios from 'axios';
import { useProducts } from '../context/ProductContext';

export const getALLProducts = async () => {
  try {
    let products = JSON.parse(localStorage.getItem('products'));
    const response = await fetch('/data/products.json');
    products = await response.json();
    return products;
  } catch (err) {
    console.warn("Failed to fetch products", err);
    return [];
  }
};

export const getProductDetails = async (id) => {
  try {
    const data = await getProducts();
    return data.find(p => p.id === id) || null;
  } catch (err) {
    console.warn("Error reading products from localStorage:", err);
    return null;
  }
};

export const getRelatedProducts = async (category) => {
  try {
    const data = await getProducts();
    return data.filter(product => product.category === category);
  } catch (err) {
    console.warn("Failed to fetch related products", err);
    return [];
  }
};

////////////////////////////REAL API DATA
const api = axios.create({
  baseURL: 'https://themasterjacketsbackend-production.up.railway.app',
});

export const getProducts = async () => {
  try {
    api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    const response = await api.get('/api/product/fetch-all');

    return response.data.data;
  } catch (error) {
    console.warn("Error fetching categories:", error);
    throw error;
  }
};

export const getSingleProduct = async (productId) => {
  try {
    const response = await api.get(`/api/product/fetch/${productId}`);
    return response.data.data;
  } catch (error) {
    console.warn("Error fetching categories:", error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    const response = await api.delete(`/api/product/delete/68762589a469c496106e01d4?productId=${productId}`);
    return response.data;
  } catch (error) {
    console.warn("Error deleting product:", error);
    throw error;
  }
};

export const updateProduct = async (formData) => {
  try {
    api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    const response = await api.put(`/api/product/update/68762589a469c496106e01d4`, formData);
    return response.data;
  } catch (error) {
    console.warn("Error updating product:", error);
    throw error;
  }
};

export const getProductBySubCategoryId = async (CategoryId, SubCategoryId) => {
  try {
    api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    const response = await api.get(`/api/product/fetch-by-sub-category?categoryId=${CategoryId}&subCategoryId=${SubCategoryId}`);
    return response.data;
  } catch (error) {
    console.warn("Error fetching product by SubId:", error);
    throw error;
  }
};

export const addProductVariation = async (productId, currentVariation) => {
  try {
    api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    console.log("Adding variation to productId:", productId, "with data:", currentVariation);
    const response = await api.put(
      `/api/product/add-variation/68762589a469c496106e01d4`,
      {
        productId,
        variationData: currentVariation
      }
    );
    return response.data;
  } catch (error) {
    console.warn("❌ Error adding variation:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteProductVariation = async (productId, variationId) => {
  try {
    api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    const response = await api.delete(`/api/product/delete-variation/68762589a469c496106e01d4?productId=${productId}&variationId=${variationId}`);
    return response.data;
  } catch (error) {
    console.warn("❌ Error on deleting variation:", error.response?.data || error.message);
    throw error;
  }
};
