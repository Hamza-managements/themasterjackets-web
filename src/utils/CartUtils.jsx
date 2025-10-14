import axios from 'axios';

export function getCartItems() {
  return JSON.parse(localStorage.getItem('cartsItems')) || [];
}

export function updateCartCount(setCount) {
  const items = getCartItems();
  setCount(items.length);
}
//////////////////////////// Category fetching with token handling ////////////////////////////
const api = axios.create({
  baseURL: 'https://themasterjacketsbackend-production.up.railway.app',
});

export async function fetchCategoriesAll() {
  try {
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

export const fetchCategoriesById = async (categoryId) => {
  try {
    api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    if (!categoryId) return;
    const response = await api.get(`/api/category/fetchById?categoryId=${categoryId}`);
    return [response.data.data];
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};

export const addCategory = async (formData) => {
  try {
    const response = await api.post('/api/category/add/68762589a469c496106e01d4', formData);
    return response.data;
  } catch (err) {
    console.error("Error fetching categories:", err);
  }
};

export const updateCategory = async (updatedData) => {
  try {
    const response = await api.put(`/api/category/update/main-category/68762589a469c496106e01d4`, updatedData);
    return response.data;
  } catch (err) {
    console.error("Error fetching categories:", err);
  }
};

export const updateSingleSubcategory = async (updatedData) => {
  try {
    const response = await api.put(`/api/category/add/sub-category/68762589a469c496106e01d4`, updatedData);
  } catch (err) {
    console.error("Error fetching categories:", err);
  }
};

export const deleteCategory = async (currentCategory) => {
  try {
    await api.delete(
      `/api/category/delete/main-category/68762589a469c496106e01d4?mainCategoryId=${currentCategory}`
    );
  } catch (err) {
    console.error("Error fetching categories:", err);
  }
};

export const addSubCategory = async (data) => {
  try {
    await api.put(`/api/category/add/sub-category/68762589a469c496106e01d4`, data);
  } catch (err) {
    console.error("Error fetching categories:", err);
  }
};

export const deleteSubCategory = async (categoryId, subcategoryId) => {
  try {
    await api.delete(
          `/api/category/delete/sub-category/68762589a469c496106e01d4?mainCategoryId=${categoryId}&subCategoryId=${subcategoryId}`
        );
  } catch (err) {
    console.error("Error fetching categories:", err);
  } 
};