import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Authentication
export const authApi = {
  login: async (address, signature) => {
    return axios.post(`${API_URL}/auth/login`, { address, signature });
  },
  checkWallet: async (address) => {
    return axios.get(`${API_URL}/wallet/status`, { params: { address } });
  },
  signMessage: async (address, message) => {
    return axios.post(`${API_URL}/wallet/sign`, { address, message });
  }
};

// Backgrounds
export const backgroundApi = {
  getAll: async () => {
    return axios.get(`${API_URL}/backgrounds`);
  },
  getById: async (id) => {
    return axios.get(`${API_URL}/backgrounds/${id}`);
  },
  create: async (data) => {
    return axios.post(`${API_URL}/backgrounds`, data);
  },
  getCategories: async () => {
    return axios.get(`${API_URL}/backgrounds/categories`);
  }
};

// Gift Cards
export const giftCardApi = {
  create: async (data) => {
    return axios.post(`${API_URL}/gift-cards/create`, data);
  },
  getById: async (id) => {
    return axios.get(`${API_URL}/gift-cards/${id}`);
  },
  transfer: async (id, recipient) => {
    return axios.post(`${API_URL}/gift-cards/${id}/transfer`, { recipient });
  },
  setSecret: async (id, secret) => {
    return axios.post(`${API_URL}/gift-cards/${id}/set-secret`, { secret });
  },
  claim: async (id, secret) => {
    return axios.post(`${API_URL}/gift-cards/${id}/claim`, { secret });
  },
  buy: async (id, message) => {
    return axios.post(`${API_URL}/gift-cards/${id}/buy`, { message });
  },
  search: async (params) => {
    return axios.get(`${API_URL}/gift-cards/search`, { params });
  }
};

// Images
export const imageApi = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return axios.post(`${API_URL}/images/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  get: async (id) => {
    return axios.get(`${API_URL}/images/${id}`);
  },
  validate: async (file) => {
    return axios.post(`${API_URL}/images/validate`, { file });
  }
};

// Users
export const userApi = {
  get: async (address) => {
    return axios.get(`${API_URL}/users/${address}`);
  },
  updateProfile: async (data) => {
    return axios.put(`${API_URL}/users/profile`, data);
  },
  getActivity: async () => {
    return axios.get(`${API_URL}/users/activity`);
  }
};
