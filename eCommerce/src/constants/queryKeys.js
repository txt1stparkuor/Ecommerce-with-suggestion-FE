export const userKeys = {
  all: ['users'],
  
  // Lists of users (e.g., for an admin panel)
  lists: () => [...userKeys.all, 'list'],
  list: (params) => [...userKeys.lists(), params],
  
  // Specific user details
  details: () => [...userKeys.all, 'detail'],
  detail: (id) => [...userKeys.details(), id],
  
  // The currently logged-in user
  currentUser: () => [...userKeys.all, 'me'],
  
  // Recommendations for the current user
  recommendations: (params) => [...userKeys.currentUser(), 'recommendations', params],
}

export const categoryKeys = {
  all: ['categories'],
  
  // Different list variations
  lists: () => [...categoryKeys.all, 'list'], // For getAllCategories
  withProducts: () => [...categoryKeys.all, 'with-products'],
  leaf: (params) => [...categoryKeys.all, 'leaf', params],
}

export const productKeys = {
  all: ['products'],
  
  // Product lists with filters/pagination
  lists: () => [...productKeys.all, 'list'],
  list: (params) => [...productKeys.lists(), params],
  
  // Specific product details
  details: () => [...productKeys.all, 'detail'],
  detail: (id) => [...productKeys.details(), id],
  
  // Sub-resources nested under a specific product
  reviews: (id, params) => [...productKeys.detail(id), 'reviews', params],
  recommendations: (id, params) => [...productKeys.detail(id), 'recommendations', params],
  recommendationsHybrid: (id, params) => [...productKeys.detail(id), 'recommendations-hybrid', params],
}

export const cartKeys = {
  all: ['cart'], 
}

export const orderKeys = {
  all: ['orders'],
  
  // All orders 
  lists: () => [...orderKeys.all, 'list'],
  list: (params) => [...orderKeys.lists(), params],
  
  // Specific order details
  details: () => [...orderKeys.all, 'detail'],
  detail: (id) => [...orderKeys.details(), id],
  
  // Orders belonging to the current user
  myOrders: () => [...orderKeys.all, 'me'],
}