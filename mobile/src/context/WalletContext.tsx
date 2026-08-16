import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { createWallet as createWalletKeypair, deleteWallet, importWallet as importWalletKeypair, restoreWallet } from '../lib/wallet';
import { fetchBalance } from '../lib/stellar';
import { identifyUser, resetUser, track } from '../lib/mixpanel';

interface WalletState {
  address: string | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  createWallet: () => Promise<void>;
  importWallet: (secretKey: string) => Promise<void>;
  disconnect: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  clearError: () => void;
}

const WalletContext = createContext<WalletState | null>(null);

const MOBILE_WALLET_ID = 'mobile_self_custody';

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    restoreWallet()
      .then((key) => {
        if (!key) return;
        setAddress(key);
        identifyUser(key);
        fetchBalance(key).then(setBalance).catch(() => {});
      })
      .catch(() => {});
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!address) return;
    try {
      const bal = await fetchBalance(address);
      setBalance(bal);
    } catch {
      setError('Failed to refresh balance');
    }
  }, [address]);

  const afterConnect = useCallback(
    async (publicKey: string) => {
      setAddress(publicKey);
      identifyUser(publicKey);
      track('wallet_connected', { wallet_id: MOBILE_WALLET_ID });
      try {
        const bal = await fetchBalance(publicKey);
        setBalance(bal);
      } catch {
        setError('Failed to load balance');
      }
    },
    [],
  );

  const createWallet = useCallback(async () => {
    setError(null);
    setIsConnecting(true);
    try {
      const { publicKey } = await createWalletKeypair();
      await afterConnect(publicKey);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [afterConnect]);

  const importWallet = useCallback(
    async (secretKey: string) => {
      setError(null);
      setIsConnecting(true);
      try {
        const { publicKey } = await importWalletKeypair(secretKey);
        await afterConnect(publicKey);
      } catch {
        setError('Invalid secret key. Please check and try again.');
      } finally {
        setIsConnecting(false);
      }
    },
    [afterConnect],
  );

  const disconnect = useCallback(async () => {
    try {
      await deleteWallet();
    } catch {
      // ignore
    }
    resetUser();
    setAddress(null);
    setBalance(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

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
        createWallet,
        importWallet,
        disconnect,
        refreshBalance,
        clearError,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
