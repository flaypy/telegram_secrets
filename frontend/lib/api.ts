import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Types
export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  prices: Price[];
  createdAt: string;
  updatedAt: string;
}

export interface Price {
  id: string;
  amount: number;
  currency: string;
  category: string;
  productId: string;
}

export interface Order {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  userId: string;
  priceId: string;
  downloadLink?: string;
  createdAt: string;
  price?: Price & { product?: Product };
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// API functions
export const productAPI = {
  getAll: async () => {
    const response = await api.get<{
      products: Product[];
      detectedCountry: string | null;
      totalCount: number;
    }>('/api/products');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{
      product: Product;
      detectedCountry: string | null;
    }>(`/api/products/${id}`);
    return response.data;
  },
};

export const authAPI = {
  register: async (email: string, password: string) => {
    const response = await api.post('/api/auth/register', { email, password });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },
};

export const adminAPI = {
  getProducts: async () => {
    const response = await api.get<{ products: Product[] }>('/api/admin/products');
    return response.data;
  },

  createProduct: async (data: {
    name: string;
    description: string;
    imageUrl: string;
    isActive?: boolean;
    prices?: Array<{ amount: number; currency: string; category: string }>;
  }) => {
    const response = await api.post('/api/admin/products', data);
    return response.data;
  },

  updateProduct: async (
    id: string,
    data: {
      name?: string;
      description?: string;
      imageUrl?: string;
      isActive?: boolean;
    }
  ) => {
    const response = await api.put(`/api/admin/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await api.delete(`/api/admin/products/${id}`);
    return response.data;
  },

  getOrders: async () => {
    const response = await api.get<{ orders: Order[] }>('/api/admin/orders');
    return response.data;
  },

  addProductRegion: async (productId: string, countryCode: string) => {
    const response = await api.post('/api/admin/products/regions', {
      productId,
      countryCode,
    });
    return response.data;
  },
};

export const paymentAPI = {
  initiatePayment: async (priceId: string) => {
    const response = await api.post('/api/payments/initiate-payment', { priceId });
    return response.data;
  },

  getOrder: async (orderId: string) => {
    const response = await api.get<{ order: Order }>(`/api/payments/order/${orderId}`);
    return response.data;
  },
};
