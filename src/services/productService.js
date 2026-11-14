export const fetchProducts = async () => {
  const response = await fetch('https://dummyjson.com/products?limit=100');

  if (!response.ok) {
    throw new Error(`Product request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.products;
};

export const fetchProductById = async (id) => {
  try {
    const response = await fetch(`https://dummyjson.com/products/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching product details:', error);
    return null;
  }
};