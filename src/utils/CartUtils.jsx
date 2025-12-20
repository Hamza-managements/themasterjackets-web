import axios from 'axios';
//////////////////////////// Category fetching with token handling ////////////////////////////
const api = axios.create({
  baseURL: 'https://themasterjacketsbackend-production.up.railway.app',
});

// Cart APIs ////////////////////////////
export async function getGuestId() {
  try {
    const response = await api.get("/api/cart/is-viewed", {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Cart items:", error);
    throw error;
  }
}

export async function getCartItems(uid, isGuest = false) {
  try {
    const response = await api.get(`/api/cart/user-cart/${uid}`, {
      withCredentials: isGuest
    });

    return response.data.data;
  } catch (error) {
    console.error("Error fetching Cart items:", error);
    throw error;
  }
}

export async function addItemToCart(itemData) {
  try {
    const response = await api.post("/api/cart/add-item", itemData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Error adding Cart items:", error);
    throw error;
  }
}

export async function removeCartItem(cartId, itemId) {
  try {
    const response = await api.post(
      "/api/cart/remove-item",
      { cartId, itemId },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error removing Cart items:", error);
    throw error;
  }
}

export async function updateCartItemQuantity(updateData) {
  try {
    const response = await api.post(`/api/cart/update-item-quantity`, updateData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Error updating item quantity:", error);
    throw error;
  }
}

export async function deleteAllCartItems(cartId) {
  try {
    await api.delete(`/api/cart/delete/${cartId}`);
    return true;
  } catch (error) {
    console.error("Error deleting all cart items:", error);
    throw error;
  }
}

// User APIs ////////////////////////////
export async function fetchAllUsers() {
  try {
    api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    const response = await api.get("/api/user/fetch-all/68762589a469c496106e01d4");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function deleteUser(userId) {
  try {
    api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    const response = await api.delete(`/api/user/delete/68762589a469c496106e01d4?uid=${userId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error deleting users:", error);
    throw error;
  }
}

export async function fetchCategoriesAll() {
  try {
    api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
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
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    if (!categoryId) return;
    const response = await api.get(`/api/category/fetchById?categoryId=${categoryId}`);
    return [response.data.data];
  } catch (error) {
    console.error("Error fetching category by Id:", error);
  }
};

export const addCategory = async (formData) => {
  try {
    const response = await api.post('/api/category/add/68762589a469c496106e01d4', formData);
    return response.data;
  } catch (err) {
    console.error("Error adding categories:", err);
  }
};

export const updateCategory = async (updatedData) => {
  try {
    const response = await api.put(`/api/category/update/main-category/68762589a469c496106e01d4`, updatedData);
    return response.data;
  } catch (err) {
    console.error("Error updating categories:", err);
  }
};

export const updateSingleSubcategory = async (updatedData) => {
  try {
    await api.post(`/api/category/update/sub-category/68762589a469c496106e01d4`, updatedData);
  } catch (err) {
    console.error("Error updating Single Subcategory:", err);
  }
};

export const deleteCategory = async (currentCategory) => {
  try {
    await api.delete(
      `/api/category/delete/main-category/68762589a469c496106e01d4?mainCategoryId=${currentCategory}`
    );
  } catch (err) {
    console.error("Error deleting categories:", err);
  }
};

export const addSubCategory = async (data) => {
  try {
    await api.post(`/api/category/add/sub-category/68762589a469c496106e01d4`, data);
  } catch (err) {
    console.error("Error adding Subcategory:", err);
  }
};

export const deleteSubCategory = async (categoryId, subcategoryId) => {
  try {
    await api.delete(
      `/api/category/delete/sub-category/68762589a469c496106e01d4?mainCategoryId=${categoryId}&subCategoryId=${subcategoryId}`
    );
  } catch (err) {
    console.error("Error deleting Subcategory:", err);
  }
};