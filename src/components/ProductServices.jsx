export const getProducts = async () => {
  try {
    let products = JSON.parse(localStorage.getItem('products'));

    if (!products || products.length === 0) {
      const response = await fetch('/data/products.json');
      products = await response.json();
      localStorage.setItem('products', JSON.stringify(products));
    }

    return products;
  } catch (err) {
    console.error("Failed to fetch products", err);
    return [];
  }
};

export const getProductDetails = (id) => {
  try {
    const data = JSON.parse(localStorage.getItem('products')) || [];
    return data.find(p => p.id === id) || null;
  } catch (err) {
    console.error("Error reading products from localStorage:", err);
    return null;
  }
};

export const getRelatedProducts = async (category) => {
  try {
    const data = JSON.parse(localStorage.getItem('products')) || [];
    return data.filter(product => product.category === category);
  } catch (err) {
    console.error("Failed to fetch related products", err);
    return [];
  }
};