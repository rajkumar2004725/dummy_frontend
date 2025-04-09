import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

interface WalletContextType {
  address: string | null;
  connect: (address: string) => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  getToken: () => string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(() => {
    const saved = localStorage.getItem('walletAddress');
    return saved || null;
  });

  const connect = async (newAddress: string) => {
    try {
      // In a real app, you'd sign a message and verify with backend
      // For now, we'll simulate a login API call
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        address: newAddress,
        // In a real app, this would be a proper signature
        signature: `mock_signature_for_${newAddress}`
      });
      
      const { token } = response.data;
      
      // Save address and token
      setAddress(newAddress);
      localStorage.setItem('walletAddress', newAddress);
      localStorage.setItem('token', token);
      
      console.log('Connected with token:', token);
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw new Error('Failed to connect wallet');
    }
  };

  const disconnect = () => {
    setAddress(null);
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('token');
  };

  const getToken = () => {
    const token = localStorage.getItem('token');
    console.log('Getting token:', token);
    return token;
  };

  const value = {
    address,
    connect,
    disconnect,
    isConnected: !!address,
    getToken
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
