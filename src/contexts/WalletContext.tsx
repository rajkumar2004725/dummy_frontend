import React, { createContext, useContext, useState, useEffect } from 'react';

interface WalletContextType {
  address: string | null;
  connect: (address: string) => void;
  disconnect: () => void;
  isConnected: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem('walletAddress');
    return saved || null;
  });

  const connect = (newAddress: string) => {
    setAddress(newAddress);
    localStorage.setItem('walletAddress', newAddress);
  };

  const disconnect = () => {
    setAddress(null);
    localStorage.removeItem('walletAddress');
  };

  const value = {
    address,
    connect,
    disconnect,
    isConnected: !!address
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
