"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAllowed, setAllowed, getUserInfo } from '@stellar/freighter-api';

interface WalletContextType {
  publicKey: string;
  connectWallet: () => Promise<void>;
  loading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [publicKey, setPublicKey] = useState('');
  const [loading, setLoading] = useState(true);

  const checkConnection = async () => {
    try {
      if (await isAllowed()) {
        const userInfo = await getUserInfo();
        if (userInfo.publicKey) {
          setPublicKey(userInfo.publicKey);
        }
      }
    } catch (e) {
      console.error("Wallet connection check failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const connectWallet = async () => {
    try {
      if (await setAllowed()) {
        const userInfo = await getUserInfo();
        if (userInfo.publicKey) {
          setPublicKey(userInfo.publicKey);
        }
      }
    } catch (e) {
      console.error("Freighter not available or permission denied.");
      alert("Please install Freighter wallet extension.");
    }
  };

  return (
    <WalletContext.Provider value={{ publicKey, connectWallet, loading }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
