import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { checkFreighterInstalled, connectWallet, getStoredPublicKey, fetchBalance } from '../utils/freighter';

interface WalletState {
  address: string | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isInstalled: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkFreighterInstalled().then(setIsInstalled);
    getStoredPublicKey().then((key) => {
      if (key) {
        setAddress(key);
        fetchBalance(key).then(setBalance).catch(() => {});
      }
    });
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!address) return;
    try {
      const bal = await fetchBalance(address);
      setBalance(bal);
    } catch {
      setError('Failed to fetch balance');
    }
  }, [address]);

  const connect = useCallback(async () => {
    setError(null);
    setIsConnecting(true);
    try {
      const addr = await connectWallet();
      setAddress(addr);
      const bal = await fetchBalance(addr);
      setBalance(bal);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (address) {
      refreshBalance();
      const interval = setInterval(refreshBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [address, refreshBalance]);

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        isConnected: !!address,
        isConnecting,
        isInstalled,
        error,
        connect,
        disconnect,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
