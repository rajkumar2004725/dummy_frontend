import axios from 'axios';
import { useWallet } from '@/contexts/WalletContext';

const API_BASE_URL = 'http://localhost:3001';

// Get token from localStorage
const getToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }
  return token;
};

// Add token to request headers
export const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/images/upload`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.url;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload image');
  }
};

export const createBackground = async (data: { image: File; category: string; price: string }) => {
  try {
    const formData = new FormData();
    formData.append('image', data.image);
    formData.append('category', data.category);
    formData.append('price', data.price);
    formData.append('artistAddress', localStorage.getItem('walletAddress') || '');
    
    const response = await axios.post(`${API_BASE_URL}/api/backgrounds`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Create background error:', error);
    throw new Error('Failed to create background');
  }
};

export const mintBackgroundNFT = async (data: { image: File; category: string; price: string }) => {
  try {
    const walletAddress = localStorage.getItem('walletAddress');
    if (!walletAddress) {
      throw new Error('No wallet address found - please connect your wallet');
    }
    
    const formData = new FormData();
    formData.append('image', data.image);
    formData.append('category', data.category);
    formData.append('price', data.price);
    formData.append('artistAddress', walletAddress);
    
    console.log('Sending mint request with wallet address:', walletAddress);
    
    const response = await axios.post(`${API_BASE_URL}/api/backgrounds/mint`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Mint background NFT error:', error);
    throw new Error('Failed to mint background NFT');
  }
};

export const verifyBackgroundStatus = async (backgroundId: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/backgrounds/verify/${backgroundId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Verify background status error:', error);
    throw new Error('Failed to verify background status');
  }
};
