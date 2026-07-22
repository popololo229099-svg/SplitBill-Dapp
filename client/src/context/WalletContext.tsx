import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { openAuthModal, getAddressFromKit, disconnectKit, initWalletKit } from '../utils/wallet-kit';
import { fetchBalance } from '../utils/contract';

export type ErrorType = 'wallet_not_found' | 'transaction_rejected' | 'insufficient_balance' | 'connection_failed' | 'unknown';

interface WalletError {
  type: ErrorType;
  message: string;
}

interface WalletState {
  address: string | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: WalletError | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  clearError: () => void;
}

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<WalletError | null>(null);

  useEffect(() => {
    try {
      initWalletKit();
    } catch {
      // Kit init failed silently
    }

    getAddressFromKit().then((key) => {
      if (key) {
        setAddress(key);
        fetchBalance(key).then(setBalance).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!address) return;
    try {
      const bal = await fetchBalance(address);
      setBalance(bal);
    } catch {
      setError({ type: 'connection_failed', message: 'Failed to refresh balance' });
    }
  }, [address]);

  const connect = useCallback(async () => {
    setError(null);
    setIsConnecting(true);
    try {
      const addr = await openAuthModal();
      setAddress(addr);
      const bal = await fetchBalance(addr);
      setBalance(bal);
    } catch (e: any) {
      const code = e?.code;
      if (code === -1 || code === -3) {
        setError({ type: 'wallet_not_found', message: e?.message || 'No wallet found. Please install a Stellar wallet.' });
      } else if (code === 4001 || e?.message?.includes('rejected') || e?.message?.includes('denied')) {
        setError({ type: 'transaction_rejected', message: 'Connection was rejected by the user.' });
      } else if (e?.message?.includes('User closed') || e?.message?.includes('closed the modal')) {
        setError(null);
      } else {
        setError({ type: 'connection_failed', message: e?.message || 'Failed to connect wallet' });
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await disconnectKit();
    setAddress(null);
    setBalance(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
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
        error,
        connect,
        disconnect,
        refreshBalance,
        clearError,
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
