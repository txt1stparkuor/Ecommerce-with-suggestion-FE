export const ApiConstant = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    refreshToken: "/auth/refresh-token",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    changePassword: "/auth/change-password",
  },
  categories: {
    base: "/categories",
    withProducts: "/categories/with-products",
    leaf: "/categories/leaf",
  },
  products: {
    base: "/products",
    getById: (productId) => `/products/${productId}`,
    getReviews: (productId) => `/products/${productId}/reviews`,
    getRecommendations: (productId) => `/products/${productId}/recommendations`,
    getRecommendationsHybrid: (productId) => `/products/${productId}/recommendations/hybrid`,
    exportAmazonCSV: "/export/amazon.csv"
  },
  users: {
    base: "/users",
    getById: (userId) => `/users/${userId}`,
    getCurrentUser: "/users/me",
    recommendations: "/users/recommendations",
  },
  images: {
    base: "/images",
  },
  cart: {
    base: "/cart",
    cartItems: "/cart/items",
    item: (itemId) => `/cart/items/${itemId}`,
  },
  orders: {
    base: "/orders",
    myOrders: "/orders/me",
    getById: (orderId) => `/orders/${orderId}`,
    cancel: (orderId) => `/orders/${orderId}/cancel`,
    updateStatus: (orderId) => `/orders/${orderId}/status`,
  },
};
