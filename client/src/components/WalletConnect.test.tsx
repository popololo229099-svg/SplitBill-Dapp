import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import WalletConnect from '../components/WalletConnect';

vi.mock('../context/WalletContext', () => ({
  useWallet: vi.fn(),
}));

vi.mock('../utils/wallet-kit', () => ({
  WALLET_OPTIONS: [
    { id: 'freighter', name: 'Freighter', icon: '🦊' },
    { id: 'lobstr', name: 'LOBSTR', icon: '🐋' },
    { id: 'albedo', name: 'Albedo', icon: '🔷' },
  ],
}));

vi.mock('../hooks/useMediaQuery', () => ({
  useIsMobile: () => false,
}));

import { useWallet } from '../context/WalletContext';
const mockUseWallet = vi.mocked(useWallet);

describe('WalletConnect', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all 3 wallet buttons when not connected', () => {
    mockUseWallet.mockReturnValue({
      address: null,
      balance: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      connect: vi.fn(),
      connectWallet: vi.fn(),
      disconnect: vi.fn(),
      refreshBalance: vi.fn(),
      clearError: vi.fn(),
    });

    render(createElement(WalletConnect));
    expect(screen.getByText('Freighter')).toBeInTheDocument();
    expect(screen.getByText('LOBSTR')).toBeInTheDocument();
    expect(screen.getByText('Albedo')).toBeInTheDocument();
  });

  it('calls connectWallet with freighter when Freighter button clicked', async () => {
    const user = userEvent.setup();
    const connectWalletFn = vi.fn();

    mockUseWallet.mockReturnValue({
      address: null,
      balance: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      connect: vi.fn(),
      connectWallet: connectWalletFn,
      disconnect: vi.fn(),
      refreshBalance: vi.fn(),
      clearError: vi.fn(),
    });

    render(createElement(WalletConnect));
    await user.click(screen.getByText('Freighter'));
    expect(connectWalletFn).toHaveBeenCalledWith('freighter');
  });

  it('calls connectWallet with lobstr when LOBSTR button clicked', async () => {
    const user = userEvent.setup();
    const connectWalletFn = vi.fn();

    mockUseWallet.mockReturnValue({
      address: null,
      balance: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      connect: vi.fn(),
      connectWallet: connectWalletFn,
      disconnect: vi.fn(),
      refreshBalance: vi.fn(),
      clearError: vi.fn(),
    });

    render(createElement(WalletConnect));
    await user.click(screen.getByText('LOBSTR'));
    expect(connectWalletFn).toHaveBeenCalledWith('lobstr');
  });

  it('calls connectWallet with albedo when Albedo button clicked', async () => {
    const user = userEvent.setup();
    const connectWalletFn = vi.fn();

    mockUseWallet.mockReturnValue({
      address: null,
      balance: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      connect: vi.fn(),
      connectWallet: connectWalletFn,
      disconnect: vi.fn(),
      refreshBalance: vi.fn(),
      clearError: vi.fn(),
    });

    render(createElement(WalletConnect));
    await user.click(screen.getByText('Albedo'));
    expect(connectWalletFn).toHaveBeenCalledWith('albedo');
  });

  it('renders connected state with address', () => {
    mockUseWallet.mockReturnValue({
      address: 'GABC1234567890XYZ',
      balance: '100.00',
      isConnected: true,
      isConnecting: false,
      error: null,
      connect: vi.fn(),
      connectWallet: vi.fn(),
      disconnect: vi.fn(),
      refreshBalance: vi.fn(),
      clearError: vi.fn(),
    });

    render(createElement(WalletConnect));
    expect(screen.getByText(/GABC12/)).toBeInTheDocument();
    expect(screen.getByText('Disconnect')).toBeInTheDocument();
  });

  it('shows connecting state', () => {
    mockUseWallet.mockReturnValue({
      address: null,
      balance: null,
      isConnected: false,
      isConnecting: true,
      error: null,
      connect: vi.fn(),
      connectWallet: vi.fn(),
      disconnect: vi.fn(),
      refreshBalance: vi.fn(),
      clearError: vi.fn(),
    });

    render(createElement(WalletConnect));
    const connectingTexts = screen.getAllByText('Connecting...');
    expect(connectingTexts.length).toBe(3);
  });

  it('shows error banner when error exists', () => {
    mockUseWallet.mockReturnValue({
      address: null,
      balance: null,
      isConnected: false,
      isConnecting: false,
      error: { type: 'wallet_not_found', message: 'No wallet found' },
      connect: vi.fn(),
      connectWallet: vi.fn(),
      disconnect: vi.fn(),
      refreshBalance: vi.fn(),
      clearError: vi.fn(),
    });

    render(createElement(WalletConnect));
    expect(screen.getByText('No wallet found')).toBeInTheDocument();
    expect(screen.getByText('Wallet Not Found')).toBeInTheDocument();
  });

  it('calls disconnect when disconnect button clicked', async () => {
    const user = userEvent.setup();
    const disconnectFn = vi.fn();

    mockUseWallet.mockReturnValue({
      address: 'GABC1234567890XYZ',
      balance: '100.00',
      isConnected: true,
      isConnecting: false,
      error: null,
      connect: vi.fn(),
      connectWallet: vi.fn(),
      disconnect: disconnectFn,
      refreshBalance: vi.fn(),
      clearError: vi.fn(),
    });

    render(createElement(WalletConnect));
    await user.click(screen.getByText('Disconnect'));
    expect(disconnectFn).toHaveBeenCalledTimes(1);
  });
});
